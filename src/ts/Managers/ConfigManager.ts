import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DeviceInfo } from 'Models/DeviceInfo';

export class ConfigManager {

    private static ConfigBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    private _enabled: boolean;
    private _country: string;
    private _placements: { [id: string]: Placement } = {};
    private _defaultPlacement: Placement = null;

    constructor(request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public fetch(): Promise<void> {
        return this._request.get(this.createConfigUrl()).then(([response]) => {
            let configJson = JSON.parse(response);

            this._enabled = configJson.enabled;
            this._country = configJson.country;

            let placements = configJson.placements;

            placements.forEach((rawPlacement: any): void => {
                let placement: Placement = new Placement(rawPlacement);
                this._placements[placement.getId()] = placement;
                if(placement.isDefault()) {
                    this._defaultPlacement = placement;
                }
            });
        });
    }

    public isEnabled(): boolean {
        return this._enabled;
    }

    public getCountry(): string {
        return this._country;
    }

    public getPlacement(placementId: string): Placement {
        return this._placements[placementId];
    }

    public getPlacements(): Object {
        return this._placements;
    }

    public getDefaultPlacement(): Placement {
        return this._defaultPlacement;
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
