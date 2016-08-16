import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';

export class ConfigManager {

    private static ConfigBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';

    public static fetch(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<Configuration> {
        return MetaDataManager.fetchAdapterMetaData(nativeBridge).then(adapter => {
            let url: string = ConfigManager.createConfigUrl(clientInfo, deviceInfo, adapter);
            nativeBridge.Sdk.logInfo('Requesting configuration from ' + url);
            return request.get(url, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            }).then(response => {
                try {
                    let configJson = JsonParser.parse(response.response);
                    let config: Configuration = new Configuration(configJson);
                    nativeBridge.Sdk.logInfo('Received configuration with ' + config.getPlacementCount() + ' placements');
                    return config;
                } catch(error) {
                    nativeBridge.Sdk.logError('Config request failed ' + error);
                    throw new Error(error);
                }
            });
        });
    }

    public static setTestBaseUrl(baseUrl: string): void {
        ConfigManager.ConfigBaseUrl = baseUrl + '/games';
    }

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo, adapter: AdapterMetaData): string {
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

        if(adapter) {
            url = Url.addParameters(url, adapter.getDTO());
        }

        return url;
    }

}
