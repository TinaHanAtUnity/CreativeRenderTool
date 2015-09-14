import Zone from 'Models/Zone';

export default class ZoneManager {

    private _zones: Object = {};

    constructor(config: any) {
        let zones: Object[] = config.zones;
        zones.forEach((rawZone: any): void => {
            let zone: Zone = new Zone(rawZone);
            this._zones[zone.getId()] = zone;
        });
    }

    public getZone(zoneId: string): Zone {
        return this._zones[zoneId];
    }

    public getZones(): Object {
        return this._zones;
    }

}
