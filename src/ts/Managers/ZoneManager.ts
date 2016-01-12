import { Zone } from 'Models/Zone';

export class ZoneManager {

    private _zones: Object = {};
    private _defaultZone: Zone = null;

    constructor(config: any) {
        let zones: Object[] = config.zones;
        zones.forEach((rawZone: any): void => {
            let zone: Zone = new Zone(rawZone);
            this._zones[zone.getId()] = zone;
            if(zone.isDefault()) {
                this._defaultZone = zone;
            }
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
}
