import { Zone } from 'Models/Zone';
import { ClientInfo } from 'Models/ClientInfo';
import { Request } from 'Utilities/Request';
import { Url } from 'Utilities/Url';

export class ConfigManager {

    private static ConfigBaseUrl = 'http://impact.applifier.com/games/';

    private _request: Request;
    private _clientInfo: ClientInfo;

    private _zones: { [id: string]: Zone } = {};
    private _defaultZone: Zone = null;

    constructor(request: Request, clientInfo: ClientInfo) {
        this._request = request;
        this._clientInfo = clientInfo;
    }

    public fetch(): Promise<void> {
        return this._request.get(this.createConfigUrl()).then(([response]) => {
            let configJson = JSON.parse(response);

            let zones = configJson.placements;

            zones.forEach((rawZone: any): void => {
                let zone: Zone = new Zone(rawZone);
                this._zones[zone.getId()] = zone;
                if(zone.isDefault()) {
                    this._defaultZone = zone;
                }
            });
        });
    }

    public getZone(zoneId: string): Zone {
        return this._zones[zoneId];
    }

    public getZones(): Object {
        return this._zones;
    }

    public getDefaultZone(): Zone {
        return this._defaultZone;
    }

    private createConfigUrl(): string {
        let configUrl: string = ConfigManager.ConfigBaseUrl + this._clientInfo.getGameId() + '/configuration';
        configUrl = Url.addParameters(configUrl, {
            encrypted: false
        });
        return configUrl;
    }

}
