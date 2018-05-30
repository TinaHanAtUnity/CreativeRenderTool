import { EventType } from 'Models/Session';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';
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
import { CampaignAssetInfo } from 'Utilities/CampaignAssetInfo';
import { Configuration } from 'Models/Configuration';
import { GameSessionCounters } from 'Utilities/GameSessionCounters';
import { Enum } from 'protobufjs';

export interface IOperativeEventManagerParams<T extends Campaign> {
    nativeBridge: NativeBridge;
    request: Request;
    metaDataManager: MetaDataManager;
    sessionManager: SessionManager;
    clientInfo: ClientInfo;
    deviceInfo: DeviceInfo;
    configuration: Configuration;
    campaign: T;
}

export enum GDPREventSource {
    METADATA = 'metadata',
    USER = 'user'
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

    public static sendGDPREvent(action: string, source: GDPREventSource, deviceInfo: DeviceInfo, clientInfo: ClientInfo, configuration: Configuration): Promise<void> {
        const infoJson: any = {
            'adid': deviceInfo.getAdvertisingIdentifier(),
            'action': action,
            'projectId': configuration.getUnityProjectId(),
            'platform': Platform[clientInfo.getPlatform()].toLowerCase(),
            'gameId': clientInfo.getGameId(),
            'source': source
        };

        HttpKafka.sendEvent('ads.events.optout.v1.json', KafkaCommonObjectType.EMPTY, infoJson);
        return Promise.resolve();
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';
    private static PreviousPlacementId: string | undefined;

    protected _gamerServerId: string | undefined;
    protected _sessionManager: SessionManager;
    protected _clientInfo: ClientInfo;
    protected _campaign: Campaign;
    protected _metaDataManager: MetaDataManager;
    private _nativeBridge: NativeBridge;
    private _deviceInfo: DeviceInfo;
    private _request: Request;
    private _configuration: Configuration;

    constructor(params: IOperativeEventManagerParams<Campaign>) {
        this._nativeBridge = params.nativeBridge;
        this._metaDataManager = params.metaDataManager;
        this._sessionManager = params.sessionManager;
        this._clientInfo = params.clientInfo;
        this._deviceInfo = params.deviceInfo;
        this._request = params.request;
        this._configuration = params.configuration;
        this._campaign = params.campaign;
    }

    public sendStart(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }

        session.setEventSent(EventType.START);

        GameSessionCounters.addStart(this._campaign);

        return this._metaDataManager.fetch(PlayerMetaData, false).then(player => {
            if(player) {
                this.setGamerServerId(player.getServerId());
            } else {
                this.setGamerServerId(undefined);
            }

            return this._metaDataManager.fetch(MediationMetaData, true, ['ordinal']);
        }).then(() => {
            return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle);
        }).then(([id, infoJson]) => {
            return this.sendEvent('start', id, infoJson.sessionId, this.createVideoEventUrl('video_start'), JSON.stringify(infoJson));
        }).then(() => {
            return;
        });
    }

    public sendFirstQuartile(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.FIRST_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.FIRST_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl('first_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendMidpoint(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.MIDPOINT);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl('midpoint'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendThirdQuartile(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.THIRD_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl('third_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendSkip(placement: Placement, videoProgress?: number, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

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

            // drop game session counters from skip event payload
            delete infoJson.gameSessionCounters;

            infoJson.id = id;
            infoJson.ts = (new Date()).toISOString();

            HttpKafka.sendEvent('ads.sdk2.events.skip.json', KafkaCommonObjectType.ANONYMOUS, infoJson);
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendView(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.VIEW);

        GameSessionCounters.addView(this._campaign);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('view', id, infoJson.sessionId, this.createVideoEventUrl('video_end'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendClick(placement: Placement, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.CLICK);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('click', id, session.getId(), this.createClickEventUrl(), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(placement, this._sessionManager.getGameSessionId(), this._gamerServerId, OperativeEventManager.getPreviousPlacementId(), videoOrientation, adUnitStyle).then(fulfilled);
    }

    public sendGDPREvent(action: string): Promise<void> {
        return OperativeEventManager.sendGDPREvent(action, GDPREventSource.USER, this._deviceInfo, this._clientInfo, this._configuration);
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

    protected createUniqueEventMetadata(placement: Placement, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
            return this.getInfoJson(placement, id, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle);
        });
    }

    private getInfoJson(placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        let infoJson: any = {
            'eventId': eventId,
            'auctionId': this._campaign.getSession().getId(),
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
            'language': this._deviceInfo.getLanguage(),
            'cached': CampaignAssetInfo.isCached(this._campaign),
            'cachedOrientation': CampaignAssetInfo.getCachedVideoOrientation(this._campaign),
            'token': this._configuration.getToken(),
            'gdprEnabled': this._configuration.isGDPREnabled(),
            'optOutEnabled': this._configuration.isOptOutEnabled(),
            'optOutRecorded': this._configuration.isOptOutRecorded(),
            'gameSessionCounters': GameSessionCounters.getDTO()
        };

        if(this._clientInfo.getPlatform() === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
            infoJson = {
                ... infoJson,
                'apiLevel': this._deviceInfo.getApiLevel(),
                'deviceMake': this._deviceInfo.getManufacturer(),
                'screenDensity': this._deviceInfo.getScreenDensity(),
                'screenSize': this._deviceInfo.getScreenLayout(),
                'androidId': this._deviceInfo.getAndroidId()
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
}
