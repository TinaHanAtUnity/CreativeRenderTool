import { Platform } from 'Core/Constants/Platform';
import { ConfigError } from 'Core/Errors/ConfigError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Url } from 'Core/Utilities/Url';
import { UnityInfo } from 'Core/Models/UnityInfo';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { SDKMetrics, MiscellaneousMetric } from 'Ads/Utilities/SDKMetrics';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { BatteryStatus } from 'Core/Constants/Android/BatteryStatus';

interface IConfigIosDeviceParam {
    networkOperator: string | null;
    freeMemory: number;
    batteryStatus: BatteryStatus;
    batteryLevel: number;
    screenBrightness: number;
    volume: number;
    deviceFreeSpace: number;
}

export class ConfigManager {

    public static setTestBaseUrl(baseUrl: string): void {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: ABGroup) {
        ConfigManager.AbGroup = abGroup;
    }

    public static setCountry(country: string) {
        ConfigManager.Country = country;
    }

    private static ConfigBaseUrl: string = 'https://publisher-config.unityads.unity3d.com/games';
    private static AbGroup: ABGroup | undefined;
    private static Country: string | undefined;

    private _platform: Platform;
    private _core: ICoreApi;
    private _metaDataManager: MetaDataManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _unityInfo: UnityInfo;
    private _request: RequestManager;

    private _rawConfig?: unknown;

    constructor(platform: Platform, core: ICoreApi, metaDataManager: MetaDataManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, unityInfo: UnityInfo, request: RequestManager) {
        this._platform = platform;
        this._core = core;
        this._metaDataManager = metaDataManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._unityInfo = unityInfo;
        this._request = request;
    }

    public getConfig(): Promise<unknown> {
        if (this._rawConfig) {
            return Promise.resolve(this._rawConfig);
        } else {
            return Promise.all([
                this._deviceInfo.getConnectionType(),
                this._deviceInfo.getScreenHeight(),
                this._deviceInfo.getScreenWidth(),
                this._metaDataManager.fetch(FrameworkMetaData),
                this._metaDataManager.fetch(AdapterMetaData),
                this.fetchGamerToken(),
                this.getConfigDeviceDTO()
            ]).then(([connectionType, screenHeight, screenWidth, framework, adapter, storedGamerToken, configIosDeviceParams]) => {
                let gamerToken: string | undefined;

                // TODO: Fix or remove following code
                if (this._platform === Platform.IOS && this._core.DeviceInfo.getLimitAdTrackingFlag()) {
                    // only use stored gamerToken for iOS when ad tracking is limited
                    gamerToken = storedGamerToken;
                } else if (storedGamerToken) {
                    // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                    this.deleteGamerToken();
                    SDKMetrics.reportMetricEvent(MiscellaneousMetric.IOSDeleteStoredGamerToken);
                }

                const url: string = this.createConfigUrl(connectionType, screenHeight, screenWidth, framework, adapter, configIosDeviceParams);
                this._core.Sdk.logInfo('Requesting configuration from ' + url);
                return this._request.get(url, [], {
                    retries: 2,
                    retryDelay: 10000,
                    followRedirects: false,
                    retryWithConnectionEvents: true
                }).then(response => {
                    try {
                        this._rawConfig = JsonParser.parse(response.response);
                        return this._rawConfig;
                    } catch (error) {
                        Diagnostics.trigger('config_parsing_failed', {
                            configUrl: url,
                            configResponse: response.response
                        });
                        this._core.Sdk.logError('Config request failed ' + JSON.stringify(error));
                        throw new Error(error);
                    }
                }).catch(error => {
                    let modifiedError = error;
                    if (modifiedError instanceof RequestError) {
                        const requestError = modifiedError;
                        if (requestError.nativeResponse && requestError.nativeResponse.response) {
                            const responseObj = JsonParser.parse<{ error: string }>(requestError.nativeResponse.response);
                            modifiedError = new ConfigError((new Error(responseObj.error)));
                        }
                    }
                    throw modifiedError;
                });
            });
        }
    }

    private createConfigUrl(connectionType: string | undefined, screenHeight: number, screenWidth: number, framework: FrameworkMetaData | undefined, adapter: AdapterMetaData | undefined, configIosDeviceParams: IConfigIosDeviceParam): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            this._clientInfo.getGameId(),
            'configuration'
        ].join('/');

        let abGroup;
        if (ConfigManager.AbGroup !== undefined) {
            abGroup = ConfigManager.AbGroup;
        }

        url = Url.addParameters(url, {
            bundleId: this._clientInfo.getApplicationName(),
            encrypted: !this._clientInfo.isDebuggable(),
            rooted: this._deviceInfo.isRooted(),
            platform: Platform[this._platform].toLowerCase(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            osVersion: this._deviceInfo.getOsVersion(),
            deviceModel: this._deviceInfo.getModel(),
            language: this._deviceInfo.getLanguage(),
            connectionType: connectionType,
            screenHeight: screenHeight,
            screenWidth: screenWidth,
            test: this._clientInfo.getTestMode(),
            analyticsUserId: this._unityInfo.getAnalyticsUserId(),
            analyticsSessionId: this._unityInfo.getAnalyticsSessionId(),
            forceAbGroup: abGroup
        });

        if (this._platform === Platform.ANDROID) {
            url = Url.addParameters(url, {
                deviceMake: (<AndroidDeviceInfo> this._deviceInfo).getManufacturer(),
                screenDensity: (<AndroidDeviceInfo> this._deviceInfo).getScreenDensity(),
                screenSize: (<AndroidDeviceInfo> this._deviceInfo).getScreenLayout()
            });
        }

        // Additional signals added for iOS 14 signal mapping suppport
        if (this._platform === Platform.IOS) {
            url = Url.addParameters(url, {
                ...configIosDeviceParams,
                totalSpace: this._deviceInfo.getTotalSpace(),
                totalMemory: this._deviceInfo.getTotalMemory(),
                deviceName: (<IosDeviceInfo> this._deviceInfo).getDeviceName(),
                vendorIdentifier: (<IosDeviceInfo> this._deviceInfo).getVendorIdentifier(),
                localeList: (<IosDeviceInfo> this._deviceInfo).getLocaleList().toString(),
                currentUiTheme: (<IosDeviceInfo> this._deviceInfo).getCurrentUiTheme(),
                adNetworkPlist: (<IosDeviceInfo> this._deviceInfo).getAdNetworksPlist().toString(),
                systemBootTime: (<IosDeviceInfo> this._deviceInfo).getSystemBootTime(),
                trackingAuthStatus: (<IosDeviceInfo> this._deviceInfo).getTrackingAuthorizationStatus()
            });
        }

        const trackingIDs = TrackingIdentifierFilter.getDeviceTrackingIdentifiers(this._platform, this._deviceInfo);
        url = Url.addParameters(url, trackingIDs);

        if (framework) {
            url = Url.addParameters(url, framework.getDTO());
        }

        if (adapter) {
            url = Url.addParameters(url, adapter.getDTO());
        }

        if (ConfigManager.Country !== undefined) {
            url = Url.addParameters(url, {
                force_country: ConfigManager.Country
            });
        }

        return url;
    }

    private fetchValue(key: string): Promise<string | undefined> {
        return this._core.Storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }

    private storeValue(key: string, value: string): Promise<void[]> {
        return Promise.all([
            this._core.Storage.set(StorageType.PRIVATE, key, value),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private deleteValue(key: string): Promise<void[]> {
        return Promise.all([
            this._core.Storage.delete(StorageType.PRIVATE, key),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private fetchGamerToken(): Promise<string | undefined> {
        return this.fetchValue('gamerToken');
    }

    public storeGamerToken(gamerToken: string): Promise<void[]> {
        return this.storeValue('gamerToken', gamerToken);
    }

    private deleteGamerToken(): Promise<void[]> {
        return this.deleteValue('gamerToken');
    }

    private getConfigDeviceDTO(): Promise<IConfigIosDeviceParam> {
        return Promise.all([
            this._deviceInfo.getNetworkOperator(),
            this._deviceInfo.getFreeMemory(),
            this._deviceInfo.getBatteryStatus(),
            this._deviceInfo.getBatteryLevel(),
            this._deviceInfo.getScreenBrightness(),
            this._deviceInfo.getDeviceVolume(),
            this._deviceInfo.getFreeSpace()
        ]).then(([networkOperator, freeMemory, batteryStatus, batteryLevel, screenBrightness, volume, deviceFreeSpace]) => {
            return {
                networkOperator,
                freeMemory,
                batteryStatus,
                batteryLevel,
                screenBrightness,
                volume,
                deviceFreeSpace
            };
        });
    }
}
