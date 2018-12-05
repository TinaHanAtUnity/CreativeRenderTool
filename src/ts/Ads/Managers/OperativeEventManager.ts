import { IAdsApi } from 'Ads/IAds';
import { FailedOperativeEventManager } from 'Ads/Managers/FailedOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { EventType } from 'Ads/Models/Session';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { GameSessionCounters, IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { SessionUtils } from 'Ads/Utilities/SessionUtils';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export interface IOperativeEventManagerParams<T extends Campaign> {
    request: RequestManager;
    metaDataManager: MetaDataManager;
    sessionManager: SessionManager;
    clientInfo: ClientInfo;
    deviceInfo: DeviceInfo;
    coreConfig: CoreConfiguration;
    adsConfig: AdsConfiguration;
    platform: Platform;
    core: ICoreApi;
    ads: IAdsApi;
    storageBridge: StorageBridge;
    campaign: T;
    playerMetadataServerId: string | undefined;
}

export interface IOperativeEventParams {
    placement: Placement;
    videoOrientation?: string;
    adUnitStyle?: AdUnitStyle;
    asset?: Asset;
}

export interface IOperativeSkipEventParams extends IOperativeEventParams {
    videoProgress?: number;
}

export interface IInfoJson {
    eventId: string;
    auctionId: string;
    gameSessionId: number;
    campaignId: string;
    adType?: string;
    correlationId?: string;
    seatId?: number;
    placementId: string;
    advertisingTrackingId?: string | null;
    limitAdTracking?: boolean;
    osVersion: string;
    sid?: string;
    deviceModel: string;
    sdkVersion: number;
    previousPlacementId?: string;
    bundleId: string;
    meta?: string;
    platform: string;
    language: string;
    cached: boolean;
    cachedOrientation?: 'landscape' | 'portrait';
    token: string;
    gdprEnabled: boolean;
    optOutEnabled: boolean;
    optOutRecorded: boolean;
    gameSessionCounters: IGameSessionCounters;
    apiLevel?: number;
    deviceMake?: string;
    screenDensity?: number;
    screenSize?: number;
    androidId?: string;
    videoOrientation?: string;
    webviewUa?: string;
    adUnitStyle?: { [key: string]: unknown };
    networkType: number;
    connectionType: string;
    screenWidth: number;
    screenHeight: number;
    mediationName?: string;
    mediationVersion?: string;
    mediationOrdinal?: number;
    frameworkName?: string;
    frameworkVersion?: string;
    skippedAt?: number;
}

export class OperativeEventManager {

    public static getEventKey(sessionId: string, eventId: string): string {
        return SessionUtils.getSessionStorageKey(sessionId) + '.operative.' + eventId;
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

    private static PreviousPlacementId: string | undefined;

    protected _sessionManager: SessionManager;
    protected _clientInfo: ClientInfo;
    protected _campaign: Campaign;
    protected _metaDataManager: MetaDataManager;
    protected _storageBridge: StorageBridge;
    private _deviceInfo: DeviceInfo;
    private _request: RequestManager;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    protected _platform: Platform;
    protected _core: ICoreApi;
    protected _ads: IAdsApi;
    private _playerMetadataServerId: string | undefined;

    constructor(params: IOperativeEventManagerParams<Campaign>) {
        this._storageBridge = params.storageBridge;
        this._metaDataManager = params.metaDataManager;
        this._sessionManager = params.sessionManager;
        this._clientInfo = params.clientInfo;
        this._deviceInfo = params.deviceInfo;
        this._request = params.request;
        this._coreConfig = params.coreConfig;
        this._adsConfig = params.adsConfig;
        this._campaign = params.campaign;
        this._platform = params.platform;
        this._core = params.core;
        this._ads = params.ads;
        this._playerMetadataServerId = params.playerMetadataServerId;
    }

    public sendStart(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.START)) {
            return Promise.resolve();
        }

        session.setEventSent(EventType.START);

        GameSessionCounters.addStart(this._campaign);

        return this._metaDataManager.fetch(MediationMetaData, true, ['ordinal']).then(() => {
            return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId());
        }).then(([id, infoJson]) => {
            return this.sendEvent('start', id, session.getId(), this.createVideoEventUrl('video_start'), JSON.stringify(infoJson));
        }).then(() => {
            return;
        });
    }

    public sendFirstQuartile(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.FIRST_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.FIRST_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            this.sendEvent('first_quartile', id, session.getId(), this.createVideoEventUrl('first_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public sendMidpoint(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.MIDPOINT)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.MIDPOINT);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            this.sendEvent('midpoint', id, session.getId(), this.createVideoEventUrl('midpoint'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public sendThirdQuartile(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.THIRD_QUARTILE)) {
            return Promise.resolve(void(0));
        }

        session.setEventSent(EventType.THIRD_QUARTILE);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            this.sendEvent('third_quartile', id, session.getId(), this.createVideoEventUrl('third_quartile'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public sendSkip(params: IOperativeSkipEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.SKIP)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.SKIP);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            if(params.videoProgress) {
                infoJson.skippedAt = params.videoProgress;
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

            HttpKafka.sendEvent('ads.sdk2.events.skip.json', KafkaCommonObjectType.ANONYMOUS, {
                id: id,
                ts: (new Date()).toISOString(),
                ...infoJson
            });
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public sendView(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.VIEW)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.VIEW);

        GameSessionCounters.addView(this._campaign);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            this.sendEvent('view', id, session.getId(), this.createVideoEventUrl('video_end'), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public sendClick(params: IOperativeEventParams): Promise<void> {
        const session = this._campaign.getSession();

        if(session.getEventSent(EventType.CLICK)) {
            return Promise.resolve(void(0));
        }
        session.setEventSent(EventType.CLICK);

        const fulfilled = ([id, infoJson]: [string, IInfoJson]) => {
            this.sendEvent('click', id, session.getId(), this.createClickEventUrl(), JSON.stringify(infoJson));
        };

        return this.createUniqueEventMetadata(params, this._sessionManager.getGameSessionId(), OperativeEventManager.getPreviousPlacementId()).then(fulfilled);
    }

    public getClientInfo(): ClientInfo {
        return this._clientInfo;
    }

    public sendEvent(event: string, eventId: string, sessionId: string, url: string | undefined, data: string): Promise<INativeResponse | void> {
        if(!url) {
            return Promise.resolve();
        }

        this._core.Sdk.logInfo('Unity Ads event: sending ' + event + ' event to ' + url);

        return this._request.post(url, data, [], {
            retries: 2,
            retryDelay: 10000,
            followRedirects: false,
            retryWithConnectionEvents: false
        }).catch(() => {
            new FailedOperativeEventManager(this._core, sessionId, eventId).storeFailedEvent(this._storageBridge, {
               url: url,
               data: data
            });
        });
    }

    protected createVideoEventUrl(type: string): string | undefined {
        Diagnostics.trigger('operative_event_manager_url_error', {
            message: 'Trying to use video-event url generation from base operative event manager',
            eventType: type
        });

        return undefined;
    }

    protected createClickEventUrl(): string | undefined {
        Diagnostics.trigger('operative_event_manager_url_error', {
            message: 'Trying to use click-event url generation from base operative event manager'
        });

        return undefined;
    }

    protected createUniqueEventMetadata(params: IOperativeEventParams, gameSession: number, previousPlacementId?: string): Promise<[string, IInfoJson]> {
        return this._core.DeviceInfo.getUniqueEventId().then(id => {
            return this.getInfoJson(params, id, gameSession, previousPlacementId);
        });
    }

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, previousPlacementId?: string): Promise<[string, IInfoJson]> {
        const session = this._campaign.getSession();
        return Promise.all([
            this._deviceInfo.getNetworkType(),
            this._deviceInfo.getConnectionType(),
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._metaDataManager.fetch(MediationMetaData),
            this._metaDataManager.fetch(FrameworkMetaData)
        ]).then(([networkType, connectionType, screenWidth, screenHeight, mediation, framework]: [number, string, number, number, MediationMetaData | undefined, FrameworkMetaData | undefined]) => {
            let infoJson: IInfoJson = {
                'eventId': eventId,
                'auctionId': session.getId(),
                'gameSessionId': gameSession,
                'campaignId': this._campaign.getId(),
                'adType': this._campaign.getAdType(),
                'correlationId': this._campaign.getCorrelationId(),
                'seatId': this._campaign.getSeatId(),
                'placementId': params.placement.getId(),
                'advertisingTrackingId': this._deviceInfo.getAdvertisingIdentifier(),
                'limitAdTracking': this._deviceInfo.getLimitAdTracking(),
                'osVersion': this._deviceInfo.getOsVersion(),
                'sid': this._playerMetadataServerId,
                'deviceModel': this._deviceInfo.getModel(),
                'sdkVersion': this._clientInfo.getSdkVersion(),
                'previousPlacementId': previousPlacementId,
                'bundleId': this._clientInfo.getApplicationName(),
                'meta': this._campaign.getMeta(),
                'platform': Platform[this._platform].toLowerCase(),
                'language': this._deviceInfo.getLanguage(),
                'cached': CampaignAssetInfo.isCached(this._campaign),
                'cachedOrientation': CampaignAssetInfo.getCachedVideoOrientation(this._campaign),
                'token': this._coreConfig.getToken(),
                'gdprEnabled': this._adsConfig.isGDPREnabled(),
                'optOutEnabled': this._adsConfig.isOptOutEnabled(),
                'optOutRecorded': this._adsConfig.isOptOutRecorded(),
                'gameSessionCounters': session.getGameSessionCounters(),
                'networkType': networkType,
                'connectionType': connectionType,
                'screenWidth': screenWidth,
                'screenHeight': screenHeight
            };

            if(this._platform === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
                infoJson = {
                    ... infoJson,
                    'apiLevel': this._deviceInfo.getApiLevel(),
                    'deviceMake': this._deviceInfo.getManufacturer(),
                    'screenDensity': this._deviceInfo.getScreenDensity(),
                    'screenSize': this._deviceInfo.getScreenLayout()
                };

                if(!this._deviceInfo.getAdvertisingIdentifier()) {
                    infoJson = {
                        ... infoJson,
                        'androidId': this._deviceInfo.getAndroidId()
                    };
                }
            }

            infoJson.videoOrientation = params.videoOrientation;

            if(typeof navigator !== 'undefined' && navigator.userAgent) {
                infoJson.webviewUa = navigator.userAgent;
            }

            if(params.adUnitStyle) {
                infoJson.adUnitStyle = params.adUnitStyle.getDTO();
            }

            if(mediation) {
                infoJson.mediationName = mediation.getName();
                infoJson.mediationVersion = mediation.getVersion();
                infoJson.mediationOrdinal = mediation.getOrdinal();
            }

            if(framework) {
                infoJson.frameworkName = framework.getName();
                infoJson.frameworkVersion = framework.getVersion();
            }

            return <[string, IInfoJson]>[eventId, infoJson];
        });
    }
}
