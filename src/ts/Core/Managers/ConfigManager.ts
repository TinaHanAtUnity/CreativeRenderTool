import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/Core';
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

export class ConfigManager {

    public static fetch(core: Core, jaegerSpan: JaegerSpan): Promise<any> {
        return Promise.all([
            core.MetaDataManager.fetch(FrameworkMetaData),
            core.MetaDataManager.fetch(AdapterMetaData),
            ConfigManager.fetchGamerToken(core)
        ]).then(([framework, adapter, storedGamerToken]) => {
            let gamerToken: string | undefined;

            if(core.NativeBridge.getPlatform() === Platform.IOS && core.Api.DeviceInfo.getLimitAdTrackingFlag()) {
                // only use stored gamerToken for iOS when ad tracking is limited
                gamerToken = storedGamerToken;
            } else if(storedGamerToken) {
                // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                ConfigManager.deleteGamerToken(core);
            }

            const url: string = ConfigManager.createConfigUrl(core, framework, adapter, gamerToken);
            jaegerSpan.addTag(JaegerTags.DeviceType, Platform[core.NativeBridge.getPlatform()]);
            core.Api.Sdk.logInfo('Requesting configuration from ' + url);
            return core.Request.get(url, [], {
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
                    core.Api.Sdk.logError('Config request failed ' + error);
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

    private static createConfigUrl(core: Core, framework?: FrameworkMetaData, adapter?: AdapterMetaData, gamerToken?: string): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            core.ClientInfo.getGameId(),
            'configuration'
        ].join('/');

        let abGroup;
        if (ConfigManager.AbGroup) {
            abGroup = ConfigManager.AbGroup.toNumber();
        }

        url = Url.addParameters(url, {
            bundleId: core.ClientInfo.getApplicationName(),
            encrypted: !core.ClientInfo.isDebuggable(),
            rooted: core.DeviceInfo.isRooted(),
            platform: Platform[core.NativeBridge.getPlatform()].toLowerCase(),
            sdkVersion: core.ClientInfo.getSdkVersion(),
            osVersion: core.DeviceInfo.getOsVersion(),
            deviceModel: core.DeviceInfo.getModel(),
            language: core.DeviceInfo.getLanguage(),
            test: core.ClientInfo.getTestMode(),
            gamerToken: gamerToken,
            forceAbGroup: abGroup
        });

        if(core.NativeBridge.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                deviceMake: (<AndroidDeviceInfo>core.DeviceInfo).getManufacturer()
            });
        }

        if(core.DeviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: core.DeviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: core.DeviceInfo.getLimitAdTracking()
            });
        } else if(core.NativeBridge.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: (<AndroidDeviceInfo>core.DeviceInfo).getAndroidId()
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

    private static fetchValue(core: Core, key: string): Promise<string | undefined> {
        return core.Api.Storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }

    private static storeValue(core: Core, key: string, value: string): Promise<void[]> {
        return Promise.all([
            core.Api.Storage.set(StorageType.PRIVATE, key, value),
            core.Api.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static deleteValue(core: Core, key: string): Promise<void[]> {
        return Promise.all([
            core.Api.Storage.delete(StorageType.PRIVATE, key),
            core.Api.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static fetchGamerToken(core: Core): Promise<string | undefined> {
        return this.fetchValue(core, 'gamerToken');
    }

    public static storeGamerToken(core: Core, gamerToken: string): Promise<void[]> {
        return this.storeValue(core, 'gamerToken', gamerToken);
    }

    private static deleteGamerToken(core: Core): Promise<void[]> {
        return this.deleteValue(core, 'gamerToken');
    }
}
