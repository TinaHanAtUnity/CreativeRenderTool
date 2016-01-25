import { NativeBridge } from 'NativeBridge';
import { Session } from 'Models/Session';
import { Request } from 'Utilities/Request';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Campaign } from 'Models/Campaign';
import { Zone } from 'Models/Zone';

export class SessionManager {

    private static SessionUrl = 'http://impact.applifier.com/session';

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    private _currentSession: Session;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    public create(): Promise<void> {
        return this.getUniqueEventId().then(id => {
            this._currentSession = new Session(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public sendShow(zone: Zone, campaign: Campaign): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(zone, campaign);
            infoJson.uuid = id;
            return this._request.post(SessionManager.SessionUrl + '/show', infoJson);
        });
    }

    public sendStart(zone: Zone, campaign: Campaign): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(zone, campaign);
            infoJson.uuid = id;
            return this._request.post(SessionManager.SessionUrl + '/start', infoJson);
        });
    }

    public sendSkip(zone: Zone, campaign: Campaign): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(zone, campaign);
            infoJson.uuid = id;
            return this._request.post(SessionManager.SessionUrl + '/skip', infoJson);
        });
    }

    public sendView(zone: Zone, campaign: Campaign): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(zone, campaign);
            infoJson.uuid = id;
            return this._request.post(SessionManager.SessionUrl + '/view', infoJson);
        });
    }

    public sendClick(zone: Zone, campaign: Campaign): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(zone, campaign);
            infoJson.uuid = id;
            return this._request.post(SessionManager.SessionUrl + '/click', infoJson);
        });
    }

    private getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            return id;
        });
    }

    private getInfoJson(zone: Zone, campaign: Campaign): any {
        return {
            'gamer_id': campaign.getGamerId(),
            'campaign_id': campaign.getId(),
            'zone_id': zone.getId(),
            'advertising_id': this._deviceInfo.getAdvertisingIdentifier(),
            'tracking_enabled': this._deviceInfo.getLimitAdTracking(),
            'software_version': this._deviceInfo.getSoftwareVersion(),
            'device_type': this._deviceInfo.getHardwareVersion(),
            'connection_type': this._deviceInfo.getNetworkType(),
            'sid': 'rikshot'
        };
    }

}