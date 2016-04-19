import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';

export class ConfigManager {

    private static ConfigBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    public static fetch(request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<Configuration> {
        return request.get(ConfigManager.createConfigUrl(clientInfo, deviceInfo)).then(response => {
            try {
                let configJson = JSON.parse(response.response);
                return new Configuration(configJson);
            } catch(error) {
                throw new Error(error);
            }
        });
    }

    private static createConfigUrl(clientInfo: ClientInfo, deviceInfo: DeviceInfo): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            clientInfo.getGameId(),
            'configuration'
        ].join('/');

        return Url.addParameters(url, {
            encrypted: !clientInfo.isDebuggable(),
            rooted: deviceInfo.isRooted()
        });
    }

}
