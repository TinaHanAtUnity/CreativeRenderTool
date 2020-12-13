import { Platform } from 'Core/Constants/Platform';
import { ConfigError } from 'Core/Errors/ConfigError';
import { RequestError } from 'Core/Errors/RequestError';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Url } from 'Core/Utilities/Url';
import { TrackingIdentifierFilter } from 'Ads/Utilities/TrackingIdentifierFilter';
import { SDKMetrics, MiscellaneousMetric } from 'Ads/Utilities/SDKMetrics';
export class ConfigManager {
    constructor(platform, core, metaDataManager, clientInfo, deviceInfo, unityInfo, request) {
        this._platform = platform;
        this._core = core;
        this._metaDataManager = metaDataManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._unityInfo = unityInfo;
        this._request = request;
    }
    static setTestBaseUrl(baseUrl) {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }
    static setAbGroup(abGroup) {
        ConfigManager.AbGroup = abGroup;
    }
    static setCountry(country) {
        ConfigManager.Country = country;
    }
    getConfig() {
        if (this._rawConfig) {
            return Promise.resolve(this._rawConfig);
        }
        else {
            return Promise.all([
                this._deviceInfo.getConnectionType(),
                this._deviceInfo.getScreenHeight(),
                this._deviceInfo.getScreenWidth(),
                this._metaDataManager.fetch(FrameworkMetaData),
                this._metaDataManager.fetch(AdapterMetaData),
                this.fetchGamerToken(),
                this.getConfigDeviceDTO()
            ]).then(([connectionType, screenHeight, screenWidth, framework, adapter, storedGamerToken, configIosDeviceParams]) => {
                let gamerToken;
                // TODO: Fix or remove following code
                if (this._platform === Platform.IOS && this._core.DeviceInfo.getLimitAdTrackingFlag()) {
                    // only use stored gamerToken for iOS when ad tracking is limited
                    gamerToken = storedGamerToken;
                }
                else if (storedGamerToken) {
                    // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                    this.deleteGamerToken();
                    SDKMetrics.reportMetricEvent(MiscellaneousMetric.IOSDeleteStoredGamerToken);
                }
                const url = this.createConfigUrl(connectionType, screenHeight, screenWidth, framework, adapter, configIosDeviceParams);
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
                    }
                    catch (error) {
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
                            const responseObj = JsonParser.parse(requestError.nativeResponse.response);
                            modifiedError = new ConfigError((new Error(responseObj.error)));
                        }
                    }
                    throw modifiedError;
                });
            });
        }
    }
    createConfigUrl(connectionType, screenHeight, screenWidth, framework, adapter, configIosDeviceParams) {
        let url = [
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
                deviceMake: this._deviceInfo.getManufacturer(),
                screenDensity: this._deviceInfo.getScreenDensity(),
                screenSize: this._deviceInfo.getScreenLayout()
            });
        }
        // Additional signals added for iOS 14 signal mapping suppport
        if (this._platform === Platform.IOS) {
            url = Url.addParameters(url, Object.assign({}, configIosDeviceParams, { totalSpace: this._deviceInfo.getTotalSpace(), totalMemory: this._deviceInfo.getTotalMemory(), deviceName: this._deviceInfo.getDeviceName(), vendorIdentifier: this._deviceInfo.getVendorIdentifier(), localeList: this._deviceInfo.getLocaleList().toString(), currentUiTheme: this._deviceInfo.getCurrentUiTheme(), adNetworkPlist: this._deviceInfo.getAdNetworksPlist().toString(), systemBootTime: this._deviceInfo.getSystemBootTime(), trackingAuthStatus: this._deviceInfo.getTrackingAuthorizationStatus() }));
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
    fetchValue(key) {
        return this._core.Storage.get(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }
    storeValue(key, value) {
        return Promise.all([
            this._core.Storage.set(StorageType.PRIVATE, key, value),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }
    deleteValue(key) {
        return Promise.all([
            this._core.Storage.delete(StorageType.PRIVATE, key),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }
    fetchGamerToken() {
        return this.fetchValue('gamerToken');
    }
    storeGamerToken(gamerToken) {
        return this.storeValue('gamerToken', gamerToken);
    }
    deleteGamerToken() {
        return this.deleteValue('gamerToken');
    }
    getConfigDeviceDTO() {
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
ConfigManager.ConfigBaseUrl = 'https://publisher-config.unityads.unity3d.com/games';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01hbmFnZXJzL0NvbmZpZ01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFReEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV6QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNsRixPQUFPLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFjM0UsTUFBTSxPQUFPLGFBQWE7SUE0QnRCLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsZUFBZ0MsRUFBRSxVQUFzQixFQUFFLFVBQXNCLEVBQUUsU0FBb0IsRUFBRSxPQUF1QjtRQUMzSyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxX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