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

export class ConfigManager {

    public static fetch(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<Configuration> {
        return Promise.all<FrameworkMetaData, AdapterMetaData>([
            MetaDataManager.fetchFrameworkMetaData(nativeBridge),
            MetaDataManager.fetchAdapterMetaData(nativeBridge)
        ]).then(([framework, adapter]) => {
            const url: string = ConfigManager.createConfigUrl(clientInfo, deviceInfo, framework, adapter);
            nativeBridge.Sdk.logInfo('Requesting configuration from ' + url);
            return request.get(url, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                try {
                    const configJson = JsonParser.parse(response.response);
                    const config: Configuration = new Configuration(configJson);
                    nativeBridge.Sdk.logInfo('Received configuration with ' + config.getPlacementCount() + ' placements');
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

    public static setProxyUrl(proxyUrl: string): void {
        ConfigManager.ConfigBaseUrl = proxyUrl + '/games';
    }

    private static ConfigBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo, framework: FrameworkMetaData, adapter: AdapterMetaData): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            clientInfo.getGameId(),
            'configuration'
        ].join('/');

        url = Url.addParameters(url, {
            bundleId: clientInfo.getApplicationName(),
            encrypted: !clientInfo.isDebuggable(),
            rooted: deviceInfo.isRooted()
        });

        if(framework) {
            url = Url.addParameters(url, framework.getDTO());
        }

        if(adapter) {
            url = Url.addParameters(url, adapter.getDTO());
        }

        return url;
    }

}
