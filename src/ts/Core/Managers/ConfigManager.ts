import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ConfigError } from 'Core/Errors/ConfigError';
import { RequestError } from 'Core/Errors/RequestError';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Url } from 'Core/Utilities/Url';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';

export class ConfigManager {

    public static setTestBaseUrl(baseUrl: string): void {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: ABGroup) {
        ConfigManager.AbGroup = abGroup;
    }

    private static ConfigBaseUrl: string = 'https://publisher-config.unityads.unity3d.com/games';
    private static AbGroup: ABGroup | undefined;

    private _platform: Platform;
    private _core: ICoreApi;
    private _metaDataManager: MetaDataManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _request: RequestManager;

    private _rawConfig?: any;

    constructor(platform: Platform, core: ICoreApi, metaDataManager: MetaDataManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, request: RequestManager) {
        this._platform = platform;
        this._core = core;
        this._metaDataManager = metaDataManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._request = request;
    }

    public getConfig(jaegerSpan: JaegerSpan): any | Promise<any> {
        if(this._rawConfig) {
            return this._rawConfig;
        } else {
            return Promise.all([
                this._metaDataManager.fetch(FrameworkMetaData),
                this._metaDataManager.fetch(AdapterMetaData),
                this.fetchGamerToken()
            ]).then(([framework, adapter, storedGamerToken]) => {
                let gamerToken: string | undefined;

                if(this._platform === Platform.IOS && this._core.DeviceInfo.getLimitAdTrackingFlag()) {
                    // only use stored gamerToken for iOS when ad tracking is limited
                    gamerToken = storedGamerToken;
                } else if(storedGamerToken) {
                    // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                    this.deleteGamerToken();
                }

                const url: string = this.createConfigUrl(framework, adapter, gamerToken);
                jaegerSpan.addTag(JaegerTags.DeviceType, Platform[this._platform]);
                this._core.Sdk.logInfo('Requesting configuration from ' + url);
                return this._request.get(url, [], {
                    retries: 2,
                    retryDelay: 10000,
                    followRedirects: false,
                    retryWithConnectionEvents: true
                }).then(response => {
                    jaegerSpan.addTag(JaegerTags.StatusCode, response.responseCode.toString());
                    try {
                        this._rawConfig = JsonParser.parse(response.response);
                        return this._rawConfig;
                    } catch(error) {
                        Diagnostics.trigger('config_parsing_failed', {
                            configUrl: url,
                            configResponse: response.response
                        });
                        this._core.Sdk.logError('Config request failed ' + JSON.stringify(error));
                        throw new Error(error);
                    }
                }).catch(error => {
                    if(error instanceof RequestError) {
                        const requestError = error;
                        if(requestError.nativeResponse && requestError.nativeResponse.responseCode) {
                            jaegerSpan.addTag(JaegerTags.StatusCode, requestError.nativeResponse.responseCode.toString());
                        }
                        if(requestError.nativeResponse && requestError.nativeResponse.response) {
                            const responseObj = JsonParser.parse(requestError.nativeResponse.response);
                            error = new ConfigError((new Error(responseObj.error)));
                        }
                    }
                    throw error;
                });
            });
        }
    }

    private createConfigUrl(framework?: FrameworkMetaData, adapter?: AdapterMetaData, gamerToken?: string): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            this._clientInfo.getGameId(),
            'configuration'
        ].join('/');

        let abGroup;
        if (ConfigManager.AbGroup) {
            abGroup = ConfigManager.AbGroup.toNumber();
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
            test: this._clientInfo.getTestMode(),
            gamerToken: gamerToken,
            forceAbGroup: abGroup
        });

        if(this._platform === Platform.ANDROID) {
            url = Url.addParameters(url, {
                deviceMake: (<AndroidDeviceInfo>this._deviceInfo).getManufacturer()
            });
        }

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if(this._platform === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: (<AndroidDeviceInfo>this._deviceInfo).getAndroidId()
            });
        }

        if(framework) {
            url = Url.addParameters(url, framework.getDTO());
        }

        if(adapter) {
            url = Url.addParameters(url, adapter.getDTO());
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
}
