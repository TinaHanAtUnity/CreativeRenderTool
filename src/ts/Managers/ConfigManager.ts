import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { NativeBridge } from 'Native/NativeBridge';

export class ConfigManager {

    private static ConfigBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    public static fetch(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<Configuration> {
        return AdapterMetaData.fetch(nativeBridge).then(adapter => {
            return request.get(ConfigManager.createConfigUrl(clientInfo, deviceInfo, adapter)).then(response => {
                try {
                    let configJson = JSON.parse(response.response);
                    return new Configuration(configJson);
                } catch(error) {
                    throw new Error(error);
                }
            });
        });
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
