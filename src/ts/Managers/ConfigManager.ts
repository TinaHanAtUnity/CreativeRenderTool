import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { ConfigError } from 'Errors/ConfigError';
import { RequestError } from 'Errors/RequestError';
import { StorageType } from 'Native/Api/Storage';
import { Platform } from 'Constants/Platform';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { JaegerSpan, JaegerTags } from 'Jaeger/JaegerSpan';

export class ConfigManager {

    public static fetch(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, metaDataManager: MetaDataManager, jaegerSpan: JaegerSpan): Promise<Configuration> {
        return Promise.all([
            metaDataManager.fetch(FrameworkMetaData),
            metaDataManager.fetch(AdapterMetaData),
            ConfigManager.fetchGamerToken(nativeBridge)
        ]).then(([framework, adapter, storedGamerToken]) => {
            let gamerToken: string | undefined;

            if(nativeBridge.getPlatform() === Platform.IOS && deviceInfo.getLimitAdTracking()) {
                // only use stored gamerToken for iOS when ad tracking is limited
                gamerToken = storedGamerToken;
            } else if(storedGamerToken) {
                // delete saved token from all other devices, for example when user has toggled limit ad tracking flag to false
                ConfigManager.deleteGamerToken(nativeBridge);
            }

            const url: string = ConfigManager.createConfigUrl(clientInfo, deviceInfo, framework, adapter, gamerToken);
            jaegerSpan.addTag(JaegerTags.DeviceType, Platform[nativeBridge.getPlatform()]);
            nativeBridge.Sdk.logInfo('Requesting configuration from ' + url);
            return request.get(url, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                jaegerSpan.addTag(JaegerTags.StatusCode, response.responseCode.toString());
                try {
                    const configJson = JsonParser.parse(response.response);
                    const config: Configuration = ConfigurationParser.parse(configJson);
                    nativeBridge.Sdk.logInfo('Received configuration with ' + config.getPlacementCount() + ' placements for token ' + config.getToken() + ' (A/B group ' + config.getAbGroup() + ')');
                    if(config.getToken()) {
                        if(nativeBridge.getPlatform() === Platform.IOS && deviceInfo.getLimitAdTracking()) {
                            ConfigManager.storeGamerToken(nativeBridge, config.getToken());
                        }
                    } else {
                        Diagnostics.trigger('config_failure', {
                            configUrl: url,
                            configResponse: response.response
                        });

                        throw new Error('gamer token missing in PLC config');
                    }
                    if(!config.getDefaultPlacement()) {
                        Diagnostics.trigger('missing_default_placement', {
                            configUrl: url,
                            configResponse: response.response
                        });
                    }
                    return config;
                } catch(error) {
                    Diagnostics.trigger('config_parsing_failed', {
                        configUrl: url,
                        configResponse: response.response
                    });
                    nativeBridge.Sdk.logError('Config request failed ' + error);
                    throw new Error(error);
                }
            }).catch(error => {
                if (error instanceof RequestError) {
                    const requestError = <RequestError>error;
                    if (requestError.nativeResponse && requestError.nativeResponse.responseCode) {
                        jaegerSpan.addTag(JaegerTags.StatusCode, requestError.nativeResponse.responseCode.toString());
                    }
                    if (requestError.nativeResponse && requestError.nativeResponse.response) {
                        const responseObj = JsonParser.parse(requestError.nativeResponse.response);
                        error = new ConfigError((new Error(responseObj.error)));
                    }
                }
                jaegerSpan.addTag(JaegerTags.Error, 'true');
                jaegerSpan.addTag(JaegerTags.ErrorMessage, error.message);
                jaegerSpan.addAnnotation(error.message);
                throw error;
            });
        });
    }

    public static setTestBaseUrl(baseUrl: string): void {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: number) {
        ConfigManager.AbGroup = abGroup;
    }

    private static ConfigBaseUrl: string = 'https://publisher-config.unityads.unity3d.com/games';
    private static AbGroup: number | undefined;

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo, framework?: FrameworkMetaData, adapter?: AdapterMetaData, gamerToken?: string): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            clientInfo.getGameId(),
            'configuration'
        ].join('/');

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
            forceAbGroup: ConfigManager.AbGroup
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

    private static fetchValue(nativeBridge: NativeBridge, key: string): Promise<string | undefined> {
        return nativeBridge.Storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(error => {
            return undefined;
        });
    }

    private static storeValue(nativeBridge: NativeBridge, key: string, value: string): Promise<void[]> {
        return Promise.all([
            nativeBridge.Storage.set(StorageType.PRIVATE, key, value),
            nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static deleteValue(nativeBridge: NativeBridge, key: string): Promise<void[]> {
        return Promise.all([
            nativeBridge.Storage.delete(StorageType.PRIVATE, key),
            nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private static fetchGamerToken(nativeBridge: NativeBridge): Promise<string | undefined> {
        return this.fetchValue(nativeBridge, 'gamerToken');
    }

    private static storeGamerToken(nativeBridge: NativeBridge, gamerToken: string): Promise<void[]> {
        return this.storeValue(nativeBridge, 'gamerToken', gamerToken);
    }

    private static deleteGamerToken(nativeBridge: NativeBridge): Promise<void[]> {
        return this.deleteValue(nativeBridge, 'gamerToken');
    }
}
