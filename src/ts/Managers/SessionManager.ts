import { Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
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
            'gamerId': adUnit.getCampaign().getGamerId(),
            'campaignId': adUnit.getCampaign().getId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'networkType': this._deviceInfo.getNetworkType(),
            'cached': true, // todo: get actual value
            'advertisingId': this._deviceInfo.getAdvertisingIdentifier(),
            'trackingEnabled': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'connectionType': this._deviceInfo.getConnectionType(),
            'sid': gamerSid,
            'deviceMake': this._deviceInfo.getManufacturer(),
            'deviceModel': this._deviceInfo.getModel()
        };

        return MetaDataManager.fetchMediationMetaData(this._nativeBridge).then(mediation => {
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

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;
    private _eventMetadataCreator: SessionManagerEventMetadataCreator;

    private _currentSession: Session;

    private _gamerServerId: string;

    public static setTestBaseUrl(baseUrl: string): void {
        SessionManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        SessionManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager, eventMetadataCreator?: SessionManagerEventMetadataCreator) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
        this._eventMetadataCreator = eventMetadataCreator || new SessionManagerEventMetadataCreator(this._eventManager, this._deviceInfo, this._nativeBridge);
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

    public sendShow(adUnit: AbstractAdUnit): Promise<void> {

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('show', id, infoJson.sessionId, this.createShowEventUrl(adUnit), JSON.stringify(infoJson));
            adUnit.sendImpressionEvent(this._eventManager, infoJson.sessionId);
            adUnit.sendTrackingEvent(this._eventManager, 'creativeView', infoJson.sessionId);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendStart(adUnit: AbstractAdUnit): Promise<void> {

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('start', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
            adUnit.sendTrackingEvent(this._eventManager, 'start', infoJson.sessionId);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendProgress(adUnit: AbstractAdUnit, session: Session, position: number, oldPosition: number): void {
        if (session) {
            adUnit.sendProgressEvents(this._eventManager, session.getId(), position, oldPosition);
        }
    }

    public sendFirstQuartile(adUnit: AbstractAdUnit): Promise<void> {
        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'first_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendMidpoint(adUnit: AbstractAdUnit): Promise<void> {
        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'midpoint'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendThirdQuartile(adUnit: AbstractAdUnit): Promise<void> {
        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'third_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): void {

        const fulfilled = ([id, infoJson]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
            }
            this._eventManager.operativeEvent('skip', id, this._currentSession.getId(), this.createVideoEventUrl(adUnit, 'video_skip'), JSON.stringify(infoJson));
        };

        this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendView(adUnit: AbstractAdUnit): Promise<void> {

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('view', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
            adUnit.sendTrackingEvent(this._eventManager, 'complete', infoJson.sessionId);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<INativeResponse> {
        let campaign = adUnit.getCampaign();

        const fulfilled = ([id, infoJson]) => {
            this._eventManager.operativeEvent('click', id, this._currentSession.getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        };

        this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._currentSession, this._gamerServerId).then(fulfilled);

        if(campaign.getClickAttributionUrl()) {
            return this._eventManager.clickAttributionEvent(this._currentSession.getId(), campaign.getClickAttributionUrl(), campaign.getClickAttributionUrlFollowsRedirects());
        }
        return Promise.reject('Missing click attribution url');
    }

    public sendMute(adUnit: AbstractAdUnit, session: Session, muted: boolean): void {
        if (muted) {
            adUnit.sendTrackingEvent(this._eventManager, 'mute', session.getId());
        } else {
            adUnit.sendTrackingEvent(this._eventManager, 'unmute', session.getId());
        }
    }

    public setGamerServerId(serverId: string): void {
        this._gamerServerId = serverId;
    }

    private createShowEventUrl(adUnit: AbstractAdUnit): string {
        const campaign = adUnit.getCampaign();
        return [
            SessionManager.VideoEventBaseUrl,
            campaign.getGamerId(),
            'show',
            campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
        const campaign = adUnit.getCampaign();
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
        const campaign = adUnit.getCampaign();
        let url = [
            SessionManager.ClickEventBaseUrl,
            campaign.getId(),
            'click',
            campaign.getGamerId(),
        ].join('/');
        return Url.addParameters(url, {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        });
    }

}
