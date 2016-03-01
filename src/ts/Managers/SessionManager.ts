import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { AdUnit } from 'Models/AdUnit';
import { Url } from 'Utilities/Url';
import { EventHandler } from 'Utilities/EventHandler';

export class SessionManager {

    private static SessionUrl = 'https://adserver.unityads.unity3d.com';
    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventHandler: EventHandler;

    private _currentSession: Session;

    constructor(clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventHandler: EventHandler) {
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventHandler = eventHandler;
    }

    public create(): Promise<void> {
        return this._eventHandler.getUniqueEventId().then(id => {
            this._currentSession = new Session(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public sendShow(adUnit: AdUnit): void {
        this._eventHandler.operativeEvent('show', this._currentSession.getId(), SessionManager.SessionUrl + '/show', this.getInfoJson(adUnit));
    }

    public sendStart(adUnit: AdUnit): void {
        this._eventHandler.operativeEvent('start', this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_start'), this.getInfoJson(adUnit));
    }

    public sendSkip(adUnit: AdUnit): void {
        this._eventHandler.operativeEvent('skip', this._currentSession.getId(), SessionManager.SessionUrl + '/skip', this.getInfoJson(adUnit));
    }

    public sendView(adUnit: AdUnit): void {
        this._eventHandler.operativeEvent('view', this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_end'), this.getInfoJson(adUnit));
    }

    public sendClick(adUnit: AdUnit): void {
        let campaign = adUnit.getCampaign();
        if(campaign.getClickAttributionUrl()) {
            this._eventHandler.thirdPartyEvent('click attribution', this._currentSession.getId(), campaign.getClickAttributionUrl());
        }

        this._eventHandler.operativeEvent('click', this._currentSession.getId(), this.createClickEventUrl(adUnit), this.getInfoJson(adUnit));
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

    private getInfoJson(adUnit: AdUnit): any {
        return {
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