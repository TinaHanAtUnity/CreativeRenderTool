import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { EventType } from 'Models/Session';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { HttpKafka } from 'Utilities/HttpKafka';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { StorageType } from 'Native/Api/Storage';
import { INativeResponse, Request } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

export class OperativeEventManager {

    public static setTestBaseUrl(baseUrl: string): void {
        OperativeEventManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        OperativeEventManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/gamers';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    private static getEventKey(sessionId: string, eventId: string): string {
        return SessionManager.getSessionKey(sessionId) + '.operative.' + eventId;
    }

    private static getUrlKey(sessionId: string, eventId: string): string {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.url';
    }

    private static getDataKey(sessionId: string, eventId: string): string {
        return OperativeEventManager.getEventKey(sessionId, eventId) + '.data';
    }

    private _gamerServerId: string;
    private _nativeBridge: NativeBridge;
    private _metaDataManager: MetaDataManager;
    private _sessionManager: SessionManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _previousPlacementId: string | undefined;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, request: Request, metaDataManager: MetaDataManager, sessionManager: SessionManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._metaDataManager = metaDataManager;
        this._sessionManager = sessionManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._request = request;
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
            return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId());
        }).then(([id, infoJson]) => {
            return this.sendEvent('start', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_start'), JSON.stringify(infoJson));
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
            this.sendEvent('first_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'first_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendMidpoint(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void(0));
        }

        adUnit.getCampaign().getSession().setEventSent(EventType.MIDPOINT);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('midpoint', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'midpoint'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendThirdQuartile(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        adUnit.getCampaign().getSession().setEventSent(EventType.THIRD_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('third_quartile', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'third_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
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

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendView(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.VIEW);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('view', id, infoJson.sessionId, this.createVideoEventUrl(adUnit, 'video_end'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendClick(adUnit: AbstractAdUnit): Promise<void> {
        if(adUnit.getCampaign().getSession().getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        adUnit.getCampaign().getSession().setEventSent(EventType.CLICK);

        const fulfilled = ([id, infoJson]: [string, any]) => {
            this.sendEvent('click', id, adUnit.getCampaign().getSession().getId(), this.createClickEventUrl(adUnit), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(adUnit, this._sessionManager.getGameSessionId(), this._gamerServerId, this.getPreviousPlacementId()).then(fulfilled);
    }

    public sendUnsentEvents(sessionId: string): Promise<any[]> {
        return this.getUnsentEvents(sessionId).then(events => {
            return Promise.all(events.map(eventId => {
                return this.resendEvent(sessionId, eventId);
            }));
        });
    }

    public setGamerServerId(serverId: string): void {
        this._gamerServerId = serverId;
    }

    public setPreviousPlacementId(id: string | undefined) {
        this._previousPlacementId = id;
    }

    public getPreviousPlacementId(): string | undefined {
        return this._previousPlacementId;
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

    private createUniqueEventMetadata(adUnit: AbstractAdUnit, gameSession: number, gamerSid: string, previousPlacementId?: string): Promise<[string, any]> {
        return this._nativeBridge.DeviceInfo.getUniqueEventId().then(id => {
            return this.getInfoJson(adUnit, id, gameSession, gamerSid, previousPlacementId);
        });
    }

    private getUnsentEvents(sessionId: string): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, 'session.' + sessionId + '.operative', false);
    }

    private resendEvent(sessionId: string, eventId: string): Promise<void | void[]> {
        return this.getStoredEvent(sessionId, eventId).then(([url, data]) => {
            this._nativeBridge.Sdk.logInfo('Unity Ads operative event: resending operative event to ' + url + ' (session ' + sessionId + ', event ' + eventId + ')');
            return this._request.post(url, data);
        }).then(() => {
            return Promise.all([
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, OperativeEventManager.getEventKey(sessionId, eventId)),
                this._nativeBridge.Storage.write(StorageType.PRIVATE)
            ]);
        }).catch(() => {
            // ignore failed resends, they will be retried later
        });
    }

    private getStoredEvent(sessionId: string, eventId: string): Promise<string[]> {
        return Promise.all([
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, OperativeEventManager.getUrlKey(sessionId, eventId)),
            this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, OperativeEventManager.getDataKey(sessionId, eventId))
        ]);
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
            'platform': Platform[this._clientInfo.getPlatform()].toLowerCase(),
            'language': this._deviceInfo.getLanguage()
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
        } else if(campaign instanceof DisplayInterstitialCampaign) {
            infoJson.cached = false;
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

    private createVideoEventUrl(adUnit: AbstractAdUnit, type: string): string {
        const campaign = adUnit.getCampaign();
        if(campaign instanceof PerformanceCampaign || campaign instanceof MRAIDCampaign) {
            const url = campaign.getVideoEventUrl(type);
            if(url) {
                return url;
            }
        }
        return [
            OperativeEventManager.VideoEventBaseUrl,
            campaign.getGamerId(),
            'video',
            type,
            campaign.getId(),
            this._clientInfo.getGameId()
        ].join('/');
    }

    private createClickEventUrl(adUnit: AbstractAdUnit): string {
        const campaign = adUnit.getCampaign();
        let url: string | undefined;
        let parameters: any = {};

        if(campaign instanceof PerformanceCampaign || campaign instanceof MRAIDCampaign) {
            const clickUrl = campaign.getClickUrl();
            if(clickUrl) {
                parameters = { redirect: false };
                url = clickUrl;
            }
        }
        if(!url) {
            url = [
                OperativeEventManager.ClickEventBaseUrl,
                campaign.getId(),
                'click',
                campaign.getGamerId(),
            ].join('/');
            parameters = {
                gameId: this._clientInfo.getGameId(),
                redirect: false
            };
        }

        return Url.addParameters(url, parameters);
    }
}
