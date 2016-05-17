import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { INativeResponse } from 'Utilities/Request';

export class SessionManager {

    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;

    private _currentSession: Session;

    private _gamerSid: string;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
    }

    public create(): Promise<void[]> {
        return this._eventManager.getUniqueEventId().then(id => {
            this._currentSession = new Session(id);
            return this._eventManager.startNewSession(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public sendShow(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('show', id, this._currentSession.getId(), this.createShowEventUrl(adUnit), JSON.stringify(infoJson));
        });
    }

    public sendStart(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('start', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
        });
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
            }
            this._eventManager.operativeEvent('skip', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_skip'), JSON.stringify(infoJson));
        });
    }

    public sendView(adUnit: AbstractAdUnit): void {
        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('view', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
        });
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<INativeResponse> {
        let campaign = adUnit.getCampaign();

        this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id);
        }).then(([id, infoJson]) => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        });

        if(campaign.getClickAttributionUrl()) {
            return this._eventManager.clickAttributionEvent(this._currentSession.getId(), campaign.getClickAttributionUrl(), campaign.getClickAttributionUrlFollowsRedirects());
        }
        return Promise.reject('Missing click attribution url');
    }

    public setGamerSid(sid: string): void {
        this._gamerSid = sid;
    }

    private createShowEventUrl(adUnit: AbstractAdUnit): string {
        let campaign = adUnit.getCampaign();
        return [
            SessionManager.VideoEventBaseUrl,
            campaign.getGamerId(),
            'show',
            campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
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

    private createClickEventUrl(adUnit: AbstractAdUnit): string {
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

    private getInfoJson(adUnit: AbstractAdUnit, id: string): Promise<[string, any]> {
        let infoJson: any = {
            'eventId': id,
            'sessionId': this._currentSession.getId(),
            'gamerId': adUnit.getCampaign().getGamerId(),
            'campaignId': adUnit.getCampaign().getId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'networkType': this._deviceInfo.getNetworkType(),
            'cached': true,
            'advertisingId': this._deviceInfo.getAdvertisingIdentifier(),
            'trackingEnabled': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'connectionType': this._deviceInfo.getConnectionType(),
            'sid': this._gamerSid,
            'deviceMake': this._deviceInfo.getManufacturer(),
            'deviceModel': this._deviceInfo.getModel()
        };

        return MediationMetaData.fetch(this._nativeBridge).then(mediation => {
            if(mediation) {
                infoJson.mediationName = mediation.getName();
                infoJson.mediationVersion = mediation.getVersion();
                infoJson.mediationOrdinal = mediation.getOrdinal();
            }
            return [id, infoJson];
        });
    }

}
