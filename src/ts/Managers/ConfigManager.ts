import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';
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

export class ConfigManager {

    public static fetch(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<Configuration> {
        return Promise.all<FrameworkMetaData, AdapterMetaData, string>([
            MetaDataManager.fetchFrameworkMetaData(nativeBridge),
            MetaDataManager.fetchAdapterMetaData(nativeBridge),
            ConfigManager.fetchGamerId(nativeBridge)
        ]).then(([framework, adapter, gamerId]) => {
            const url: string = ConfigManager.createConfigUrl(clientInfo, deviceInfo, framework, adapter, gamerId);
            nativeBridge.Sdk.logInfo('Requesting configuration from ' + url);
            return request.get(url, [], {
                retries: 2,
                retryDelay: 10000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                try {
                    const configJson = JsonParser.parse(response.response);
                    const config: Configuration = new Configuration(configJson);
                    if(config.isPlacementLevelControl()) {
                        nativeBridge.Sdk.logInfo('Received configuration with ' + config.getPlacementCount() + ' placements for gamer ' + config.getGamerId() + ' (A/B group ' + config.getAbGroup() + ')');
                        if(config.getGamerId()) {
                            ConfigManager.storeGamerId(nativeBridge, config.getGamerId());
                        } else {
                            Diagnostics.trigger('plc_config_failure', {
                                configUrl: url,
                                configResponse: response.response
                            });

                            throw new Error('gamerId missing in PLC config');
                        }
                    } else {
                        nativeBridge.Sdk.logInfo('Received configuration with ' + config.getPlacementCount() + ' placements');
                    }
                    return config;
                } catch(error) {
                    nativeBridge.Sdk.logError('Config request failed ' + error);
                    throw new Error(error);
                }
            }).catch(error => {
                if (error instanceof RequestError) {
                    const requestError = <RequestError>error;
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

    public static setAbGroup(abGroup: number) {
        ConfigManager.AbGroup = abGroup;
    }

    private static ConfigBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AbGroup: number | undefined;

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo, framework: FrameworkMetaData, adapter: AdapterMetaData, gamerId: string): string {
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
            gamerId: gamerId,
            forceAbGroup: ConfigManager.AbGroup
        });

        if(clientInfo.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                deviceMake: deviceInfo.getManufacturer()
            });
        }

        if(deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: deviceInfo.getLimitAdTracking()
            });
        } else if(clientInfo.getPlatform() === Platform.ANDROID) {
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

    private static fetchGamerId(nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'gamerId').then(gamerId => {
            return gamerId;
        }).catch(error => {
            return undefined;
        });
    }

    private static storeGamerId(nativeBridge: NativeBridge, gamerId: string): Promise<void[]> {
        return Promise.all([
            nativeBridge.Storage.set(StorageType.PRIVATE, 'gamerId', gamerId),
            nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }
}
