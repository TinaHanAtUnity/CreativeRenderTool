import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Configuration } from 'Models/Configuration';

export class ConfigManager {

    private static ConfigBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    private _request: Request;
    private _clientInfo: ClientInfo;
    private _configuration: Configuration;

    constructor(request: Request, clientInfo: ClientInfo) {
        this._request = request;
        this._clientInfo = clientInfo;
    }

    public fetch(): Promise<Configuration> {
        return this._request.get(this.createConfigUrl()).then(response => {
            try {
                let configJson = JSON.parse(response.response);
                return new Configuration(configJson);
            } catch(error) {
                throw new Error(error);
            }
        });
    }

    public getConfiguration(): Configuration {
        return this._configuration;
    }

    private createConfigUrl(): string {
        let url: string = [
            ConfigManager.ConfigBaseUrl,
            this._clientInfo.getGameId(),
            'configuration'
        ].join('/');

        return Url.addParameters(url, {
            encrypted: !this._clientInfo.isDebuggable()
        });
    }

}
