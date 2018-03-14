import { EventType, Session } from 'Models/Session';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { HttpKafka } from 'Utilities/HttpKafka';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { StorageType } from 'Native/Api/Storage';
import { INativeResponse, Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { AdUnitStyle } from 'Models/AdUnitStyle';

export interface IOperativeEventManagerParams {
    nativeBridge: NativeBridge;
    request: Request;
    metaDataManager: MetaDataManager;
    sessionManager: SessionManager;
    clientInfo: ClientInfo;
    deviceInfo: DeviceInfo;
    campaign: Campaign;
}

export class OperativeEventManager {

    public static setTestBaseUrl(baseUrl: string): void {
        OperativeEventManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        OperativeEventManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    public static getEventKey(sessionId: string, eventId: string): string {
        return SessionManager.getSessionKey(sessionId) + '.operative.' + eventId;
    }

    public static getUrlKey(sessionId: string, eventId: string): string {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.url';
    }

    public static getDataKey(sessionId: string, eventId: string): string {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.data';
    }

    public static setPreviousPlacementId(id: string | undefined) {
        OperativeEventManager.PreviousPlacementId = id;
    }

    public static getPreviousPlacementId(): string | undefined {
        return OperativeEventManager.PreviousPlacementId;
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';
    private static PreviousPlacementId: string | undefined;

    private _gamerServerId: string | undefined;
    private _nativeBridge: NativeBridge;
    private _metaDataManager: MetaDataManager;
    private _sessionManager: SessionManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _request: Request;
    private _campaign: Campaign;

    constructor(params: IOperativeEventManagerParams) {
        this._nativeBridge = params.nativeBridge;
        this._metaDataManager = params.metaDataManager;
        this._sessionManager = params.sessionManager;
        this._clientInfo = params.clientInfo;
        this._deviceInfo = params.deviceInfo;
        this._request = params.request;
        this._campaign = params.campaign;
    }

    public sendStart(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }

        session.setEventSent(EventType.START);

        return this._metaDataManager.fetch(PlayerMetaData, false).then(player => {
            if(player) {
                this.setGamerServerId(player.getServerId());
            } else {
                this.setGamerServerId(undefined);
            }

            return this._metaDataManager.fetch(MediationMetaData, true, ['ordinal']);
        }).then(() => {
            return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle);
        }).then(([id, infoJson]) => {
            return this.sendEvent('start', id, infoJson.sessionId, this.createVideoEventUrl('video_start'), JSON.stringify(infoJson));
        }).then(() => {
            return;
        });
    }

    public sendFirstQuartile(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.FIRST_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.FIRST_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl('first_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendMidpoint(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.MIDPOINT);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl('midpoint'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendThirdQuartile(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.THIRD_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl('third_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendSkip(session: Session, placement: Placement, videoProgress?: number, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.SKIP)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.SKIP);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            if(videoProgress) {
                infoJson.skippedAt = videoProgress;
            }

            // todo: clears duplicate data for httpkafka, should be cleaned up
            delete infoJson.eventId;
            delete infoJson.apiLevel;
            delete infoJson.advertisingTrackingId;
            delete infoJson.limitAdTracking;
            delete infoJson.osVersion;
            delete infoJson.sid;
            delete infoJson.deviceMake;
            delete infoJson.deviceModel;
            delete infoJson.sdkVersion;
            delete infoJson.webviewUa;
            delete infoJson.networkType;
            delete infoJson.connectionType;

            infoJson.id = id;
            infoJson.ts = (new Date()).toISOString();

            HttpKafka.sendEvent('ads.sdk2.events.skip.json', infoJson);
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendView(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.VIEW);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('view', id, infoJson.sessionId, this.createVideoEventUrl('video_end'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendClick(session: Session, placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        if(session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.CLICK);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('click', id, session.getId(), this.createClickEventUrl(), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public setGamerServerId(serverId: string | undefined): void {
        this._gamerServerId = serverId;
    }

    public getClientInfo(): ClientInfo {
        return this._clientInfo;
    }

    public sendEvent(event: string, eventId: string, sessionId: string, url: string, data: string): Promise<INativeResponse | void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads event: sending ' + event + ' event to ' + url);

        return this._request.post(url, data, [], {
            retries: 2,
            retryDelay: 10000,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).catch(() => {
            this._nativeBridge.Storage.set(StorageType.PRIVATE, OperativeEventManager.getUrlKey(sessionId, eventId), url);
            this._nativeBridge.Storage.set(StorageType.PRIVATE, OperativeEventManager.getDataKey(sessionId, eventId), data);
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public sendHttpKafkaEvent(kafkaType: string, eventType: string, session: Session, placement: Placement, videoOrientation?: string) {
        const fulfilled = ([id, infoJson]: [string, any]) => {

            // todo: clears duplicate data for httpkafka, should be cleaned up
            delete infoJson.eventId;
            delete infoJson.apiLevel;
            delete infoJson.advertisingTrackingId;
            delete infoJson.limitAdTracking;
            delete infoJson.osVersion;
            delete infoJson.sid;
            delete infoJson.deviceMake;
            delete infoJson.deviceModel;
            delete infoJson.sdkVersion;
            delete infoJson.webviewUa;
            delete infoJson.networkType;
            delete infoJson.connectionType;

            infoJson.id = id;
            infoJson.ts = (new Date()).toISOString();
            infoJson.event_type = eventType;
            infoJson.sourceGameId = this._clientInfo.getGameId();
            if(campaign instanceof XPromoCampaign) {
                infoJson.targetGameId = campaign.getGameId().toString();
            }

            HttpKafka.sendEvent(kafkaType, infoJson);
        };

        return this.createUniqueEventMetadata(session, placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation).then(fulfilled);
    }

    protected getInfoJson(session: Session, placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        let infoJson: any = {
            'eventId': eventId,
            'auctionId': session.getId(),
            'gameSessionId': gameSession,
            'gamerId': this._campaign.getGamerId(),
            'campaignId': this._campaign.getId(),
            'adType': this._campaign.getAdType(),
            'correlationId': this._campaign.getCorrelationId(),
            'creativeId': this._campaign.getCreativeId(),
            'seatId': this._campaign.getSeatId(),
            'placementId': placement.getId(),
            'advertisingTrackingId': this._deviceInfo.getAdvertisingIdentifier(),
            'limitAdTracking': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'sid': gamerSid,
            'deviceModel': this._deviceInfo.getModel(),
            'sdkVersion': this._clientInfo.getSdkVersion(),
            'previousPlacementId': previousPlacementId,
            'bundleId': this._clientInfo.getApplicationName(),
            'meta': this._campaign.getMeta(),
            'platform': Platform[this._clientInfo.getPlatform()].toLowerCase(),
            'language': this._deviceInfo.getLanguage()
        };

        if(this._clientInfo.getPlatform() === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            infoJson = {
                ... infoJson,
                'apiLevel': this._deviceInfo.getApiLevel(),
                'deviceMake': this._deviceInfo.getManufacturer(),
                'screenDensity': this._deviceInfo.getScreenDensity(),
                'screenSize': this._deviceInfo.getScreenLayout()
            };
        }

        infoJson.videoOrientation = videoOrientation;

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            infoJson.webviewUa = navigator.userAgent;
        }

        if(adUnitStyle) {
            infoJson.adUnitStyle = adUnitStyle.getDTO();
        }

        return Promise.all([
            this._deviceInfo.getNetworkType(),
            this._deviceInfo.getConnectionType(),
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._metaDataManager.fetch(MediationMetaData),
            this._metaDataManager.fetch(FrameworkMetaData)
        ]).then(([networkType, connectionType, screenWidth, screenHeight, mediation, framework]: [number, string, number, number, MediationMetaData | undefined, FrameworkMetaData | undefined]) => {
            infoJson.networkType = networkType;
            infoJson.connectionType = connectionType;
            infoJson.screenWidth = screenWidth;
            infoJson.screenHeight = screenHeight;

            if(mediation) {
                infoJson.mediationName = mediation.getName();
                infoJson.mediationVersion = mediation.getVersion();
                infoJson.mediationOrdinal = mediation.getOrdinal();
            }

            if(framework) {
                infoJson.frameworkName = framework.getName();
                infoJson.frameworkVersion = framework.getVersion();
            }

            return <[string, any]>[eventId, infoJson];
        });
    }

    protected createVideoEventUrl(type: string): string {
        return [
            OperativeEventManager.VideoEventBaseUrl,
            this._campaign.getGamerId(),
            'video',
            type,
            this._campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    protected createClickEventUrl(): string {
        let url: string | undefined;
        let parameters: any;

        url = [
            OperativeEventManager.ClickEventBaseUrl,
            this._campaign.getId(),
            'click',
            this._campaign.getGamerId(),
        ].join('/');
        parameters = {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        };

        return Url.addParameters(url, parameters);
    }

    private createUniqueEventMetadata(session: Session, placement: Placement, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
            return this.getInfoJson(session, placement, id, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle);
        });
    }
}
