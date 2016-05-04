import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { INativeResponse } from 'Utilities/Request';

export class SessionManagerEventMetadataCreator {

    private _eventManager: EventManager;
    private _deviceInfo: DeviceInfo;
    private _nativeBridge: NativeBridge;

    constructor(eventManager: EventManager, deviceInfo: DeviceInfo, nativeBridge: NativeBridge) {
        this._eventManager = eventManager;
        this._deviceInfo = deviceInfo;
        this._nativeBridge = nativeBridge;
    }

    public createUniqueEventMetadata(adUnit: AbstractAdUnit, session: Session, gamerSid: string): Promise<[string, any]> {
        return this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id, session, gamerSid);
        });
    };

    private getInfoJson(adUnit: AbstractAdUnit, id: string, currentSession: Session, gamerSid: string): Promise<[string, any]> {
        let infoJson: any = {
            'eventId': id,
            'sessionId': currentSession.getId(),
            'gamer_id': adUnit.getGamerId(),
            'campaign_id': adUnit.getCampaignId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'networkType': this._deviceInfo.getNetworkType(),
            'cached': true,
            'advertisingId': this._deviceInfo.getAdvertisingIdentifier(),
            'trackingEnabled': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'connectionType': this._deviceInfo.getConnectionType(),
            'sid': gamerSid,
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

export class SessionManager {

    private static VideoEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;
    private _eventMetadataCreator: SessionManagerEventMetadataCreator;

    private _currentSession: Session;

    private _gamerSid: string;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager, eventMetadataCreator: SessionManagerEventMetadataCreator) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
        this._eventMetadataCreator = eventMetadataCreator;
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

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('show', id, this._currentSession.getId(), this.createShowEventUrl(adUnit), JSON.stringify(infoJson));
            this.sendVastImpressionEvent(adUnit, this._currentSession.getId());
            this.sendVastTrackingEvent(adUnit, 'creativeView', infoJson.sessionId);
        };

        this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerSid).then(fulfilled);
    }

    public sendStart(adUnit: AbstractAdUnit): Promise<void> {

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('start', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
            this.sendVastTrackingEvent(adUnit, 'start', infoJson.sessionId);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerSid).then(fulfilled);
    }

    public sendProgress(adUnit: AbstractAdUnit, session: Session, position: number, oldPosition: number): void {
        this.sendVastQuartileEvent(adUnit, session, position, oldPosition, 1);
        this.sendVastQuartileEvent(adUnit, session, position, oldPosition, 2);
        this.sendVastQuartileEvent(adUnit, session, position, oldPosition, 3);
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): void {

        const fulfilled = ([id, infoJson]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
            }
            this._eventManager.operativeEvent('skip', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_skip'), JSON.stringify(infoJson));
        };

        this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerSid).then(fulfilled);
    }

    public sendView(adUnit: AbstractAdUnit): Promise<void> {

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('view', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
            this.sendVastTrackingEvent(adUnit, 'complete', infoJson.sessionId);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerSid).then(fulfilled);
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<INativeResponse> {
        let campaign = adUnit.getCampaign();

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        };

        this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerSid).then(fulfilled);

        return this._eventManager.clickAttributionEvent(this._currentSession.getId(), campaign.getClickAttributionUrl(), campaign.getClickAttributionUrlFollowsRedirects());
    }

    public sendMute(adUnit: AbstractAdUnit, muted: boolean): void {
        if (muted) {
            this.sendVastTrackingEvent(adUnit, 'mute', this._currentSession.getId());
        } else {
            this.sendVastTrackingEvent(adUnit, 'unmute', this._currentSession.getId());
        }
    }

    public setGamerSid(sid: string): void {
        this._gamerSid = sid;
    }

    private createShowEventUrl(adUnit: AbstractAdUnit): string {
        return [
            SessionManager.VideoEventBaseUrl,
            adUnit.getGamerId(),
            'show',
            adUnit.getCampaignId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
        return [
            SessionManager.VideoEventBaseUrl,
            adUnit.getGamerId(),
            'video',
            type,
            adUnit.getCampaignId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createClickEventUrl(adUnit: AbstractAdUnit): string {
        let url = [
            SessionManager.ClickEventBaseUrl,
            adUnit.getCampaignId(),
            'click',
            adUnit.getGamerId(),
        ].join('/');
        return Url.addParameters(url, {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        });
    }

    private sendVastImpressionEvent(adUnit, id) {
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getImpressionUrls()) {
            for (let impressionUrl of adUnit.getCampaign().getVast().getImpressionUrls()) {
                this._eventManager.thirdPartyEvent('vast impression', id, impressionUrl);
            }
        }
    };

    private sendVastTrackingEvent(adUnit: AbstractAdUnit, eventName: string, sessionId: string) {
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getTrackingEventUrls(eventName)) {
            for (let url of adUnit.getCampaign().getVast().getTrackingEventUrls(eventName)) {
                this._eventManager.thirdPartyEvent(`vast ${eventName}`, sessionId, url);
            }
        }
    }

    private sendVastQuartileEvent(adUnit: AbstractAdUnit, session: Session, position: number, oldPosition: number, quartile: number) {
        let quartileEventName: string;
        if (quartile === 1) {
            quartileEventName = 'firstQuartile';
        }
        if (quartile === 2) {
            quartileEventName = 'midpoint';
        }
        if (quartile === 3) {
            quartileEventName = 'thirdQuartile';
        }
        if (adUnit.getCampaign().getVast() && adUnit.getCampaign().getVast().getTrackingEventUrls(quartileEventName)) {
            let duration = adUnit.getCampaign().getVast().getDuration();
            if (duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                for (let quartileUrl of adUnit.getCampaign().getVast().getTrackingEventUrls(quartileEventName)) {
                    this._eventManager.thirdPartyEvent(`vast ${quartileEventName}`, session.getId(), quartileUrl);
                }
            }
        }
    }

}
