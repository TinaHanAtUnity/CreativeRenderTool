import { NativeBridge } from 'NativeBridge';
import { Session } from 'Models/Session';
import { Request } from 'Utilities/Request';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { AdUnit } from 'Models/AdUnit';
import { Url } from 'Utilities/Url';

export class SessionManager {

    private static SessionUrl = 'https://adserver.unityads.unity3d.com';
    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

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

    public sendShow(adUnit: AdUnit): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(adUnit, id);
            return this._request.post(SessionManager.SessionUrl + '/show', JSON.stringify(infoJson));
        });
    }

    public sendStart(adUnit: AdUnit): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(adUnit, id);
            return this._request.post(this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
        });
    }

    public sendSkip(adUnit: AdUnit): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(adUnit, id);
            return this._request.post(SessionManager.SessionUrl + '/skip', JSON.stringify(infoJson));
        });
    }

    public sendView(adUnit: AdUnit): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let infoJson = this.getInfoJson(adUnit, id);
            return this._request.post(this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
        });
    }

    public sendClick(adUnit: AdUnit): Promise<any[]> {
        return this.getUniqueEventId().then(id => {
            let campaign = adUnit.getCampaign();
            if(campaign.getClickAttributionUrl()) {
                this._request.get(campaign.getClickAttributionUrl());
            }
            return this._request.get(this.createClickEventUrl(adUnit));
        });
    }

    private getUniqueEventId(): Promise<string> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            return id;
        });
    }

    private createVideoEventUrl(adUnit: AdUnit, type: string): string {
        let campaign = adUnit.getCampaign();
        return [
            SessionManager.VideoEventBaseUrl,
            campaign.getGamerId(),
            'video',
            type,
            campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createClickEventUrl(adUnit: AdUnit): string {
        let campaign = adUnit.getCampaign();
        let url = [
            SessionManager.ClickEventBaseUrl,
            campaign.getId(),
            'click',
            campaign.getGamerId()
        ].join('/');
        return Url.addParameters(url, {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        });
    }

    private getInfoJson(adUnit: AdUnit, id: string): { [key: string]: any } {
        return {
            'uuid': id,
            'gamer_id': adUnit.getCampaign().getGamerId(),
            'campaign_id': adUnit.getCampaign().getId(),
            'placement_id': adUnit.getPlacement().getId(),
            'advertising_id': this._deviceInfo.getAdvertisingIdentifier(),
            'tracking_enabled': this._deviceInfo.getLimitAdTracking(),
            'os_version': this._deviceInfo.getOsVersion(),
            'connection_type': this._deviceInfo.getNetworkType(),
            'sid': 'rikshot'
        };
    }

}
