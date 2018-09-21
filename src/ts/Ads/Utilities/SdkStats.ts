import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IFileInfo } from 'Core/Native/Cache';
import { Cache } from 'Core/Utilities/Cache';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Request } from 'Core/Managers/Request';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { AdsConfiguration } from '../Models/AdsConfiguration';

interface ISdkStatsEvent {
    eventTimestamp: number;
    userInfo: IUserInfo;
    placementInfo: IPlacementInfo;
    campaignInfo: ICampaignInfo;
    cacheInfo: ICacheInfo;
    mediationInfo?: IMediationInfo;
    eventInfo: IEventInfo;
}

interface IUserInfo {
    abGroup: number;
}

interface IPlacementInfo {
    auctionId: string;
    gameSessionId: number;
    placementId: string;
    allowSkipVideoInSeconds?: number;
}

interface ICampaignInfo {
    campaignId: string;
    targetGameId?: number;
    campaignType: string;
}

interface ICacheInfo {
    cachedCampaigns: string[];
    isVideoCached: boolean;
    cachingMode: string;
    videoCachedMsAgo?: number;
    cacheDuration?: number;
    size?: number;
}

interface IMediationInfo {
    mediationName?: string;
    mediationVersion?: string;
    mediationOrdinal?: number;
}

interface IEventInfo {
    eventType: string;
    adRequestOrdinal: number;
    delayInitToRequest: number;
    requestDuration: number;
    parseDuration: number;
    delayInitToReady: number;
    delayReadyToShow?: number;
    delayInitToShow?: number;
    delaySDKInitToWebViewInit?: number;
    reinitializedSDK?: boolean;
}

export class SdkStats {
    public static initialize(nativeBridge: NativeBridge, request: Request, coreConfig: CoreConfiguration, adsConfig: AdsConfiguration, sessionManager: SessionManager, campaignManager: CampaignManager, metaDataManager: MetaDataManager, clientInfo: ClientInfo, cache: Cache) {
        SdkStats._nativeBridge = nativeBridge;
        SdkStats._request = request;
        SdkStats._coreConfig = coreConfig;
        SdkStats._adsConfig = adsConfig;
        SdkStats._sessionManager = sessionManager;
        SdkStats._campaignManager = campaignManager;
        SdkStats._metaDataManager = metaDataManager;
        SdkStats._clientInfo = clientInfo;

        cache.onFinish.subscribe((event) => SdkStats.setCachingFinishTimestamp(event.fileId));
        cache.onStart.subscribe((event, size) => {
            if(size === 0) {
                SdkStats.setCachingStartTimestamp(event.fileId);
            }
        });

        SdkStats._initialized = true;
    }

    public static sendReadyEvent(placementId: string): void {
        if(SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('ready', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, KafkaCommonObjectType.ANONYMOUS, event);
            });
        }
    }

    public static sendShowEvent(placementId: string): void {
        if(SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('show', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, KafkaCommonObjectType.ANONYMOUS, event);
            });
        }
    }

    public static increaseAdRequestOrdinal(): void {
        SdkStats._adRequestOrdinal++;
    }

    public static getAdRequestOrdinal(): number {
        return SdkStats._adRequestOrdinal;
    }

    public static setInitTimestamp(): void {
        SdkStats._initTimestamp = Date.now();
    }

    public static setAdRequestTimestamp(): void {
        SdkStats._latestAdRequestTimestamp = Date.now();
        SdkStats._parseDuration = {};
    }

    public static getAdRequestTimestamp(): number {
        return SdkStats._latestAdRequestTimestamp;
    }

    public static setAdRequestDuration(duration: number): void {
        SdkStats._latestAdRequestDuration = duration;
    }

    public static setReadyEventTimestamp(placementId: string): void {
        SdkStats._readyEventSent[placementId] = Date.now();
    }

    public static getReadyEventTimestamp(placementId: string): number {
        return SdkStats._readyEventSent[placementId];
    }

    public static getRequestToReadyTime(placementId: string): number {
        return SdkStats.getReadyEventTimestamp(placementId) - SdkStats.getAdRequestTimestamp();
    }

    public static setCachingStartTimestamp(fileId: string): void {
        SdkStats._cachingStarted[fileId] = Date.now();
    }

    public static setCachingFinishTimestamp(fileId: string): void {
        SdkStats._cachingFinished[fileId] = Date.now();
    }

    public static setParseDuration(placementId: string, duration: number): void {
        SdkStats._parseDuration[placementId] = duration;
    }

    public static setFrameSetStartTimestamp(placementId: string): void {
        SdkStats._frameSetStarted[placementId] = Date.now();
    }

    public static getFrameSetStartTimestamp(placementId: string): number {
        return SdkStats._frameSetStarted[placementId];
    }

    private static _cache: CacheApi;
    private static _request: Request;
    private static _coreConfig: CoreConfiguration;
    private static _adsConfig: AdsConfiguration;
    private static _sessionManager: SessionManager;
    private static _campaignManager: CampaignManager;
    private static _metaDataManager: MetaDataManager;
    private static _clientInfo: ClientInfo;
    private static _topic: string = 'ads.sdk2.events.sdktimeline.json';

    private static _initialized: boolean = false;
    private static _adRequestOrdinal: number = 0;
    private static _initTimestamp: number;
    private static _latestAdRequestTimestamp: number;
    private static _latestAdRequestDuration: number;
    private static _parseDuration: { [id: string]: number } = {};
    private static _readyEventSent: { [id: string]: number } = {};
    private static _cachingStarted: { [id: string]: number } = {};
    private static _cachingFinished: { [id: string]: number } = {};
    private static _frameSetStarted: { [id: string]: number } = {};

    private static isTestActive(): boolean {
        const gameSessionId: number = SdkStats._sessionManager.getGameSessionId();

        if(gameSessionId % 1000 === 0) {
            return true;
        }

        return false;
    }

    private static getSdkStatsEvent(eventType: string, placementId: string): Promise<ISdkStatsEvent> {
        const placement: Placement = SdkStats._adsConfig.getPlacement(placementId);
        const campaign: Campaign = <Campaign>(placement.getCurrentCampaign());

        const eventTimestamp: number = Date.now();

        return Promise.all([SdkStats._campaignManager.getFullyCachedCampaigns(),
            SdkStats.getAssetSize(campaign),
            SdkStats._metaDataManager.fetch(MediationMetaData)]).then(([cachedCampaigns, assetSize, mediationMetaData]: [string[], number, MediationMetaData | undefined]) => {
            const userInfo: IUserInfo = {
                abGroup: SdkStats._coreConfig.getAbGroup().toNumber()
            };

            const placementInfo: IPlacementInfo = {
                auctionId: campaign.getSession().getId(),
                gameSessionId: SdkStats._sessionManager.getGameSessionId(),
                placementId: placementId,
                allowSkipVideoInSeconds: placement.allowSkip() ? placement.allowSkipInSeconds() : undefined
            };

            const campaignInfo: ICampaignInfo = {
                campaignId: campaign.getId(),
                targetGameId: undefined, // todo: not defined in the current campaign or performance campaign models
                campaignType: SdkStats.getCampaignType(campaign)
            };

            const cacheInfo: ICacheInfo = {
                cachedCampaigns: cachedCampaigns,
                isVideoCached: SdkStats.isCampaignCached(campaign),
                cachingMode: CacheMode[SdkStats._coreConfig.getCacheMode()],
                videoCachedMsAgo: SdkStats.getCachedMsAgo(campaign),
                cacheDuration: SdkStats.getCachingDuration(campaign),
                size: assetSize > 0 ? assetSize : undefined
            };

            let mediationInfo: IMediationInfo | undefined;
            if(mediationMetaData) {
                mediationInfo = {
                    mediationName: mediationMetaData.getName(),
                    mediationVersion: mediationMetaData.getVersion(),
                    mediationOrdinal: mediationMetaData.getOrdinal()
                };
            }

            const eventInfo: IEventInfo = {
                eventType: eventType,
                adRequestOrdinal: SdkStats._adRequestOrdinal,
                delayInitToRequest: SdkStats._latestAdRequestTimestamp - SdkStats._initTimestamp,
                parseDuration: SdkStats._parseDuration[placementId],
                requestDuration: SdkStats._latestAdRequestDuration,
                delayInitToReady: SdkStats._readyEventSent[placementId] - SdkStats._initTimestamp,
                delaySDKInitToWebViewInit: SdkStats._initTimestamp - SdkStats._clientInfo.getInitTimestamp(),
                reinitializedSDK: SdkStats._clientInfo.isReinitialized()
            };

            if(eventType === 'show') {
                eventInfo.delayReadyToShow = eventTimestamp - SdkStats._readyEventSent[placementId];
                eventInfo.delayInitToShow = eventTimestamp - SdkStats._initTimestamp;
            }

            return {
                eventTimestamp: eventTimestamp,
                userInfo: userInfo,
                placementInfo: placementInfo,
                campaignInfo: campaignInfo,
                cacheInfo: cacheInfo,
                mediationInfo: mediationInfo,
                eventInfo: eventInfo
            };
        });
    }

    // todo: fragile method that breaks when we add new campaign types
    private static getCampaignType(campaign: Campaign): string {
        if(campaign instanceof PerformanceCampaign) {
            return 'perf';
        } else if(campaign instanceof VastCampaign) {
            return 'vast';
        } else if(campaign instanceof MRAIDCampaign) {
            return 'mraid';
        } else if(campaign instanceof DisplayInterstitialCampaign) {
            return 'display';
        } else if(campaign instanceof VPAIDCampaign) {
            return 'vpaid';
        } else {
            return 'unknown';
        }
    }

    private static isCampaignCached(campaign: Campaign): boolean {
        const asset: Asset | undefined = CampaignAssetInfo.getCachedAsset(campaign);
        if(asset && asset.isCached()) {
            return true;
        }
        return false;
    }

    private static getAssetSize(campaign: Campaign): Promise<number> {
        if(SdkStats.isCampaignCached(campaign)) {
            const asset: Asset | undefined = CampaignAssetInfo.getCachedAsset(campaign);

            if(asset) {
                return SdkStats._cache.getFileInfo(<string>asset.getFileId()).then((fileInfo: IFileInfo) => {
                    if(fileInfo.found) {
                        return fileInfo.size;
                    } else {
                        return 0;
                    }
                }).catch(() => {
                    return 0;
                });
            } else {
                return Promise.resolve(0);
            }
        } else {
            return Promise.resolve(0);
        }
    }

    private static getCachedMsAgo(campaign: Campaign): number | undefined {
        const asset: Asset | undefined = CampaignAssetInfo.getCachedAsset(campaign);

        if(asset) {
            const fileId: string | undefined = asset.getFileId();
            if(fileId) {
                // check that asset was fully cached within this game session (not resumed from earlier sessions)
                if(SdkStats._cachingStarted[fileId] && SdkStats._cachingFinished[fileId]) {
                    return Date.now() - SdkStats._cachingFinished[fileId];
                }
            }
        }

        return undefined;
    }

    private static getCachingDuration(campaign: Campaign): number | undefined {
        const asset: Asset | undefined = CampaignAssetInfo.getCachedAsset(campaign);

        if(asset) {
            const fileId: string | undefined = asset.getFileId();
            if(fileId) {
                // check that asset was fully cached within this game session (not resumed from earlier sessions)
                if(SdkStats._cachingStarted[fileId] && SdkStats._cachingFinished[fileId]) {
                    return SdkStats._cachingFinished[fileId] - SdkStats._cachingStarted[fileId];
                }
            }
        }

        return undefined;
    }
}
