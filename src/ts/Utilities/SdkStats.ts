import { Request } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';
import { Configuration, CacheMode } from 'Models/Configuration';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { SessionManager } from 'Managers/SessionManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { CampaignManager } from 'Managers/CampaignManager';
import { Asset } from 'Models/Assets/Asset';
import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo } from 'Native/Api/Cache';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { ClientInfo } from 'Models/ClientInfo';

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
    gamerId: string;
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
    public static initialize(nativeBridge: NativeBridge, request: Request, configuration: Configuration, sessionManager: SessionManager, campaignManager: CampaignManager, metaDataManager: MetaDataManager, clientInfo: ClientInfo) {
        SdkStats._nativeBridge = nativeBridge;
        SdkStats._request = request;
        SdkStats._configuration = configuration;
        SdkStats._sessionManager = sessionManager;
        SdkStats._campaignManager = campaignManager;
        SdkStats._metaDataManager = metaDataManager;
        SdkStats._clientInfo = clientInfo;

        SdkStats._initialized = true;
    }

    public static sendReadyEvent(placementId: string): void {
        if(SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('ready', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, event);
            });
        }
    }

    public static sendShowEvent(placementId: string): void {
        if(SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('show', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, event);
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

    public static setCachingStartTimestamp(fileId: string): void {
        SdkStats._cachingStarted[fileId] = Date.now();
    }

    public static setCachingFinishTimestamp(fileId: string): void {
        SdkStats._cachingFinished[fileId] = Date.now();
    }

    public static setParseDuration(placementId: string, duration: number): void {
        SdkStats._parseDuration[placementId] = duration;
    }

    private static _nativeBridge: NativeBridge;
    private static _request: Request;
    private static _configuration: Configuration;
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

    private static isTestActive(): boolean {
        const gameSessionId: number = SdkStats._sessionManager.getGameSessionId();

        if(gameSessionId % 1000 === 0) {
            return true;
        }

        return false;
    }

    private static getSdkStatsEvent(eventType: string, placementId: string): Promise<ISdkStatsEvent> {
        const placement: Placement = SdkStats._configuration.getPlacement(placementId);
        const campaign: Campaign = <Campaign>(placement.getCurrentCampaign());

        const eventTimestamp: number = Date.now();

        return Promise.all([SdkStats._campaignManager.getFullyCachedCampaigns(),
            SdkStats.getAssetSize(campaign),
            SdkStats._metaDataManager.fetch(MediationMetaData)]).then(([cachedCampaigns, assetSize, mediationMetaData]: [string[], number, MediationMetaData | undefined]) => {
            const userInfo: IUserInfo = {
                gamerId: SdkStats._configuration.getGamerId(),
                abGroup: SdkStats._configuration.getAbGroup()
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
                cachingMode: CacheMode[SdkStats._configuration.getCacheMode()],
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

            const statsEvent: ISdkStatsEvent = {
                eventTimestamp: eventTimestamp,
                userInfo: userInfo,
                placementInfo: placementInfo,
                campaignInfo: campaignInfo,
                cacheInfo: cacheInfo,
                mediationInfo: mediationInfo,
                eventInfo: eventInfo
            };

            return statsEvent;
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
        const asset: Asset | undefined = SdkStats.getMainAsset(campaign);
        if(asset && asset.isCached()) {
            return true;
        }
        return false;
    }

    private static getAssetSize(campaign: Campaign): Promise<number> {
        if(SdkStats.isCampaignCached(campaign)) {
            const asset: Asset | undefined = SdkStats.getMainAsset(campaign);

            if(asset) {
                return SdkStats._nativeBridge.Cache.getFileInfo(<string>asset.getFileId()).then((fileInfo: IFileInfo) => {
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
        const asset: Asset | undefined = SdkStats.getMainAsset(campaign);

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
        const asset: Asset | undefined = SdkStats.getMainAsset(campaign);

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

    // todo: fragile method that breaks when we add new campaign types
    private static getMainAsset(campaign: Campaign): Asset | undefined {
        if(campaign instanceof PerformanceCampaign) {
            const video = (<PerformanceCampaign>campaign).getVideo();
            const portraitVideo = (<PerformanceCampaign>campaign).getPortraitVideo();
            if(video && video.isCached()) {
                return video;
            } else if(portraitVideo && portraitVideo.isCached()) {
                return portraitVideo;
            }
        } else if(campaign instanceof VastCampaign) {
            const video = (<VastCampaign>campaign).getVideo();
            if(video && video.isCached()) {
                return video;
            }
        } else if(campaign instanceof MRAIDCampaign) {
            const resource = (<MRAIDCampaign>campaign).getResourceUrl();
            if(resource && resource.isCached()) {
                return resource;
            }
        }

        return undefined;
    }
}
