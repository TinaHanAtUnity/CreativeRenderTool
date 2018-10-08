import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/Core';
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
import { Request } from 'Core/Managers/Request';

export class ConfigManager {

    public static fetch(platform: Platform, core: ICoreApi, metaDataManager: MetaDataManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, request: Request, jaegerSpan: JaegerSpan): Promise<any> {
        return Promise.all([
            metaDataManager.fetch(FrameworkMetaData),
            metaDataManager.fetch(AdapterMetaData),
            ConfigManager.fetchGamerToken(core)
        ]).then(([framework, adapter, storedGamerToken]) => {
            let gamerToken: string | undefined;

            if(platform === Platform.IOS && core.DeviceInfo.getLimitAdTrackingFlag()) {
                // only use stored gamerToken for iOS when ad tracking is limited
                gamerToken = storedGamerToken;
            } else if(storedGamerToken) {
                // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                ConfigManager.deleteGamerToken(core);
            }

            const url: string = ConfigManager.createConfigUrl(platform, core, clientInfo, deviceInfo, framework, adapter, gamerToken);
            jaegerSpan.addTag(JaegerTags.DeviceType, Platform[platform]);
            core.Sdk.logInfo('Requesting configuration from ' + url);
            return request.get(url, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                jaegerSpan.addTag(JaegerTags.StatusCode, response.responseCode.toString());
                try {
                    return JsonParser.parse(response.response);
                } catch(error) {
                    Diagnostics.trigger('config_parsing_failed', {
                        configUrl: url,
                        configResponse: response.response
                    });
                    core.Sdk.logError('Config request failed ' + error);
                    throw new Error(error);
                }
            }).catch(error => {
                if (error instanceof RequestError) {
                    const requestError = error;
                    if (requestError.nativeResponse && requestError.nativeResponse.responseCode) {
                        jaegerSpan.addTag(JaegerTags.StatusCode, requestError.nativeResponse.responseCode.toString());
                    }
                    if (requestError.nativeResponse && requestError.nativeResponse.response) {
                        const responseObj = JsonParser.parse(requestError.nativeResponse.response);
                        error = new ConfigError((new Error(responseObj.error)));
                    }
                }
                throw error;
            });
        });
    }

    public static setTestBaseUrl(baseUrl: string): void {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: ABGroup) {
        ConfigManager.AbGroup = abGroup;
    }

    private static ConfigBaseUrl: string = 'https://publisher-config.unityads.unity3d.com/games';
    private static AbGroup: ABGroup | undefined;

    private static createConfigUrl(platform: Platform, core: ICoreApi, clientInfo: ClientInfo, deviceInfo: DeviceInfo, framework?: FrameworkMetaData, adapter?: AdapterMetaData, gamerToken?: string): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            clientInfo.getGameId(),
            'configuration'
        ].join('/');

        let abGroup;
        if (ConfigManager.AbGroup) {
            abGroup = ConfigManager.AbGroup.toNumber();
        }

        url = Url.addParameters(url, {
            bundleId: clientInfo.getApplicationName(),
            encrypted: !clientInfo.isDebuggable(),
            rooted: core.DeviceInfo.isRooted(),
            platform: Platform[platform].toLowerCase(),
            sdkVersion: clientInfo.getSdkVersion(),
            osVersion: core.DeviceInfo.getOsVersion(),
            deviceModel: core.DeviceInfo.getModel(),
            language: deviceInfo.getLanguage(),
            test: clientInfo.getTestMode(),
            gamerToken: gamerToken,
            forceAbGroup: abGroup
        });

        if(platform === Platform.ANDROID) {
            url = Url.addParameters(url, {
                deviceMake: (<AndroidDeviceInfo>deviceInfo).getManufacturer()
            });
        }

        if(deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: deviceInfo.getLimitAdTracking()
            });
        } else if(platform === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: (<AndroidDeviceInfo>deviceInfo).getAndroidId()
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

    private static fetchValue(core: ICoreApi, key: string): Promise<string | undefined> {
        return core.Storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }

    private static storeValue(core: ICoreApi, key: string, value: string): Promise<void[]> {
        return Promise.all([
            core.Storage.set(StorageType.PRIVATE, key, value),
            core.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static deleteValue(core: ICoreApi, key: string): Promise<void[]> {
        return Promise.all([
            core.Storage.delete(StorageType.PRIVATE, key),
            core.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static fetchGamerToken(core: ICoreApi): Promise<string | undefined> {
        return this.fetchValue(core, 'gamerToken');
    }

    public static storeGamerToken(core: ICoreApi, gamerToken: string): Promise<void[]> {
        return this.storeValue(core, 'gamerToken', gamerToken);
    }

    private static deleteGamerToken(core: ICoreApi): Promise<void[]> {
        return this.deleteValue(core, 'gamerToken');
    }
}
