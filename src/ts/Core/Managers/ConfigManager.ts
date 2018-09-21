import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/Core';
import { ConfigError } from 'Core/Errors/ConfigError';
import { RequestError } from 'Core/Errors/RequestError';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { ABGroup } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Logger } from 'Core/Utilities/Logger';
import { Url } from 'Core/Utilities/Url';

export class ConfigManager {

    public static fetch(core: Core, jaegerSpan: JaegerSpan): Promise<any> {
        return Promise.all([
            core.MetaDataManager.fetch(FrameworkMetaData),
            core.MetaDataManager.fetch(AdapterMetaData),
            ConfigManager.fetchGamerToken(core.Api.Storage)
        ]).then(([framework, adapter, storedGamerToken]) => {
            let gamerToken: string | undefined;

            if(core.getPlatform() === Platform.IOS && core.Api.DeviceInfo.getLimitAdTrackingFlag()) {
                // only use stored gamerToken for iOS when ad tracking is limited
                gamerToken = storedGamerToken;
            } else if(storedGamerToken) {
                // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                ConfigManager.deleteGamerToken(storage);
            }

            const url: string = ConfigManager.createConfigUrl(core.clientInfo, deviceInfo, framework, adapter, gamerToken);
            jaegerSpan.addTag(JaegerTags.DeviceType, Platform[core.getPlatform()]);
            Logger.Info('Requesting configuration from ' + url);
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
                    Logger.Error('Config request failed ' + error);
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

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo, framework?: FrameworkMetaData, adapter?: AdapterMetaData, gamerToken?: string): string {
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
            rooted: deviceInfo.isRooted(),
            platform: Platform[clientInfo.getPlatform()].toLowerCase(),
            sdkVersion: clientInfo.getSdkVersion(),
            osVersion: deviceInfo.getOsVersion(),
            deviceModel: deviceInfo.getModel(),
            language: deviceInfo.getLanguage(),
            test: clientInfo.getTestMode(),
            gamerToken: gamerToken,
            forceAbGroup: abGroup
        });

        if(clientInfo.getPlatform() === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                deviceMake: deviceInfo.getManufacturer()
            });
        }

        if(deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: deviceInfo.getLimitAdTracking()
            });
        } else if(clientInfo.getPlatform() === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            url = Url.addParameters(url, {
                androidId: deviceInfo.getAndroidId()
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

    private static fetchValue(storage: StorageApi, key: string): Promise<string | undefined> {
        return storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }

    private static storeValue(storage: StorageApi, key: string, value: string): Promise<void[]> {
        return Promise.all([
            storage.set(StorageType.PRIVATE, key, value),
            storage.write(StorageType.PRIVATE)
        ]);
    }

    private static deleteValue(storage: StorageApi, key: string): Promise<void[]> {
        return Promise.all([
            storage.delete(StorageType.PRIVATE, key),
            storage.write(StorageType.PRIVATE)
        ]);
    }

    private static fetchGamerToken(storage: StorageApi): Promise<string | undefined> {
        return this.fetchValue(storage, 'gamerToken');
    }

    public static storeGamerToken(storage: StorageApi, gamerToken: string): Promise<void[]> {
        return this.storeValue(storage, 'gamerToken', gamerToken);
    }

    private static deleteGamerToken(storage: StorageApi): Promise<void[]> {
        return this.deleteValue(storage, 'gamerToken');
    }
}
