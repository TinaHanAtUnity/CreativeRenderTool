import { EventType, Session } from 'Models/Session';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { Url } from 'Utilities/Url';
import { EventManager } from 'Managers/EventManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { HttpKafka } from 'Utilities/HttpKafka';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';

export class SessionManagerEventMetadataCreator {

    private _eventManager: EventManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _nativeBridge: NativeBridge;
    private _metaDataManager: MetaDataManager;

    constructor(eventManager: EventManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, nativeBridge: NativeBridge, metaDataManager: MetaDataManager) {
        this._eventManager = eventManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._nativeBridge = nativeBridge;
        this._metaDataManager = metaDataManager;
    }

    public createUniqueEventMetadata(adUnit: AbstractAdUnit, gameSession: number, gamerSid: string, previousPlacementId?: string): Promise<[string, any]> {
        return this._eventManager.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id, gameSession, gamerSid, previousPlacementId);
        });
    }

    private getInfoJson(adUnit: AbstractAdUnit, id: string, gameSession: number, gamerSid: string, previousPlacementId?: string): Promise<[string, any]> {
        const infoJson: any = {
            'eventId': id,
            'auctionId': adUnit.getCampaign().getSession().getId(),
            'gameSessionId': gameSession,
            'gamerId': adUnit.getCampaign().getGamerId(),
            'campaignId': adUnit.getCampaign().getId(),
            'adType': adUnit.getCampaign().getAdType(),
            'correlationId': adUnit.getCampaign().getCorrelationId(),
            'creativeId': adUnit.getCampaign().getCreativeId(),
            'seatId': adUnit.getCampaign().getSeatId(),
            'placementId': adUnit.getPlacement().getId(),
            'apiLevel': this._deviceInfo.getApiLevel(),
            'advertisingTrackingId': this._deviceInfo.getAdvertisingIdentifier(),
            'limitAdTracking': this._deviceInfo.getLimitAdTracking(),
            'osVersion': this._deviceInfo.getOsVersion(),
            'sid': gamerSid,
            'deviceMake': this._deviceInfo.getManufacturer(),
            'deviceModel': this._deviceInfo.getModel(),
            'sdkVersion': this._clientInfo.getSdkVersion(),
            'previousPlacementId': previousPlacementId,
            'bundleId': this._clientInfo.getApplicationName(),
            'meta': adUnit.getCampaign().getMeta(),
            'screenDensity': this._deviceInfo.getScreenDensity(),
            'screenSize': this._deviceInfo.getScreenLayout(),
            'platform': Platform[this._clientInfo.getPlatform()].toLowerCase()
        };

        const campaign = adUnit.getCampaign();
        if(campaign instanceof PerformanceCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if(landscapeVideo && landscapeVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'landscape';
            } else if(portraitVideo && portraitVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'portrait';
            } else {
                infoJson.cached = false;
            }
        } else if(campaign instanceof VastCampaign) {
            infoJson.cached = campaign.getVideo().isCached();
        } else if(campaign instanceof MRAIDCampaign) {
            const resouceUrl = campaign.getResourceUrl();
            if((resouceUrl && resouceUrl.isCached()) || campaign.getResource()) {
                infoJson.cached = true;
            } else {
                infoJson.cached = false;
            }
        }

        if(adUnit instanceof PerformanceAdUnit) {
            infoJson.videoOrientation = adUnit.getVideoOrientation();
        }

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            infoJson.webviewUa = navigator.userAgent;
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

            return <[string, any]>[id, infoJson];
        });
    }

}

export class SessionManager {

    public static setTestBaseUrl(baseUrl: string): void {
        SessionManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        SessionManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _eventManager: EventManager;
    private _eventMetadataCreator: SessionManagerEventMetadataCreator;
    private _metaDataManager: MetaDataManager;

    private _gameSessionId: number;

    private _gamerServerId: string;
    private _previousPlacementId: string | undefined;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, eventManager: EventManager, metaDataManager: MetaDataManager, eventMetadataCreator?: SessionManagerEventMetadataCreator) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._eventManager = eventManager;
        this._metaDataManager = metaDataManager;
        this._eventMetadataCreator = eventMetadataCreator || new SessionManagerEventMetadataCreator(this._eventManager, this._clientInfo, this._deviceInfo, this._nativeBridge, metaDataManager);
    }

    public create(): Promise<Session> {
        let session: Session;
        return this._eventManager.getUniqueEventId().then(id => {
            session = new Session(id);
            return this._eventManager.startNewSession(id);
        }).then(() => {
            return session;
        });
    }

    public getGameSessionId(): number {
        return this._gameSessionId;
    }

    public setGameSessionId(id: number) {
        this._gameSessionId = id;
    }

    public getEventManager() {
        return this._eventManager;
    }

    public getClientInfo() {
        return this._clientInfo;
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
    }

    public sendStart(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.START)) {
            return Promise.resolve();
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.START);

        return this._metaDataManager.fetch(PlayerMetaData).then(player => {
            if(player) {
                this.setGamerServerId(player.getServerId());
            }

            return this._metaDataManager.fetch(MediationMetaData, true, ['ordinal']);
        }).then(() => {
            return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId());
        }).then(([id, infoJson]) => {
            return this._eventManager.operativeEvent('start', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
        }).then(() => {
            adUnit.onStartProcessed.trigger();
            return;
        });
    }

    public sendFirstQuartile(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.FIRST_QUARTILE)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.FIRST_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'first_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendMidpoint(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.MIDPOINT);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'midpoint'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendThirdQuartile(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.THIRD_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'third_quartile'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendSkip(adUnit: AbstractAdUnit, videoProgress?: number): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.SKIP)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.SKIP);

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

            HttpKafka.sendEvent('events.skip.json', infoJson);
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendView(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.VIEW);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('view', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.CLICK);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this._eventManager.operativeEvent('click', id, adUnit.getCampaign().getSession().getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        };

        return this._eventMetadataCreator.createUniqueEventMetadata(adUnit, this._gameSessionId, this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public setGamerServerId(serverId: string): void {
        this._gamerServerId = serverId;
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
        const url = [
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
