import { Request } from 'Utilities/Request';
// import { HttpKafka } from 'Utilities/HttpKafka';
import { Configuration, CacheMode } from 'Models/Configuration';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { SessionManager } from 'Managers/SessionManager';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { CampaignManager } from 'Managers/CampaignManager';
import { Asset } from 'Models/Assets/Asset';
import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo } from 'Native/Api/Cache';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';

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
    delayInitToReady: number;
    delayReadyToShow?: number;
    delayInitToShow?: number;
}

export class SdkStats {
    public static initialize(nativeBridge: NativeBridge, request: Request, configuration: Configuration, sessionManager: SessionManager, campaignManager: CampaignManager, metaDataManager: MetaDataManager) {
        SdkStats._nativeBridge = nativeBridge;
        SdkStats._request = request;
        SdkStats._configuration = configuration;
        SdkStats._sessionManager = sessionManager;
        SdkStats._campaignManager = campaignManager;
        SdkStats._metaDataManager = metaDataManager;
    }

    public static sendReadyEvent(placementId: string): void {
        if(!SdkStats.isTestActive()) {
            return;
        }

        SdkStats.getSdkStatsEvent('ready', placementId).then(event => {
            // todo: once Kafka topic is available, send event instead of printing it to log
            // HttpKafka.sendEvent(SdkStats._topic, event);
            SdkStats._nativeBridge.Sdk.logInfo('READY EVENT FOR ' + placementId + ': ' + JSON.stringify(event));
        });
    }

    public static sendShowEvent(placementId: string): void {
        if(!SdkStats.isTestActive()) {
            return;
        }

        SdkStats.getSdkStatsEvent('show', placementId).then(event => {
            // todo: once Kafka topic is available, send event instead of printing it to log
            // HttpKafka.sendEvent(SdkStats._topic, event);
            SdkStats._nativeBridge.Sdk.logInfo('SHOW EVENT FOR ' + placementId + ': ' + JSON.stringify(event));
        });
    }

    public static increaseAdRequestOrdinal(): void {
        SdkStats._adRequestOrdinal++;
    }

    public static setInitTimestamp(): void {
        SdkStats._initTimestamp = Date.now();
    }

    public static setAdRequestTimestamp(): void {
        SdkStats._latestAdRequestTimestamp = Date.now();
    }

    public static setAdRequestDuration(duration: number): void {
        SdkStats._latestAdRequestDuration = duration;
    }

    public static setReadyEventTimestamp(placementId: string): void {
        SdkStats._readyEventSent[placementId] = Date.now();
    }

    private static _nativeBridge: NativeBridge;
    private static _request: Request;
    private static _configuration: Configuration;
    private static _sessionManager: SessionManager;
    private static _campaignManager: CampaignManager;
    private static _metaDataManager: MetaDataManager;
    // private static _topic = 'sdk.cachestudy.stats'; todo: get proper name for Kafka topic

    private static _adRequestOrdinal: number = 0;
    private static _initTimestamp: number;
    private static _latestAdRequestTimestamp: number;
    private static _latestAdRequestDuration: number;
    private static _readyEventSent: { [id: string]: number } = {};

    private static isTestActive(): boolean {
        return true; // todo: always true for testing, needs a proper A/B group
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
                videoCachedMsAgo: undefined, // todo: this would be available only for assets cached in the same game session
                cacheDuration: undefined, // todo: this would be available only for assets cached in the same game session
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
                eventType: eventType, // primary: ready delegate event has been called, other events: "show"
                adRequestOrdinal: SdkStats._adRequestOrdinal, // primary: Order number of the latest adrequest in this session, starting from 0
                delayInitToRequest: SdkStats._latestAdRequestTimestamp - SdkStats._initTimestamp, // secondary: how many milliseconds from first sdk init to starting the latest adrequest
                requestDuration: SdkStats._latestAdRequestDuration, // secondary: how many milliseconds did the latest adrequest take from starting adrequest to receiving adplan, including network delays
                delayInitToReady: SdkStats._readyEventSent[placementId] - SdkStats._initTimestamp, // primary: how many milliseconds from first sdk init to sending the latest ready delegate event (sent for both ready and show events)
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
        } else {
            return 'unknown';
        }
    }

    // todo: fragile method that breaks when we add new campaign types
    private static isCampaignCached(campaign: Campaign): boolean {
        if(campaign instanceof PerformanceCampaign) {
            const video = (<PerformanceCampaign>campaign).getVideo();
            const portraitVideo = (<PerformanceCampaign>campaign).getPortraitVideo();
            if(video && video.isCached()) {
                return true;
            }
            if(portraitVideo && portraitVideo.isCached()) {
                return true;
            }
            return false;
        } else if(campaign instanceof VastCampaign) {
            const video = (<VastCampaign>campaign).getVideo();
            if(video && video.isCached()) {
                return true;
            }
            return false;
        } else if(campaign instanceof MRAIDCampaign) {
            const resource = (<MRAIDCampaign>campaign).getResourceUrl();
            if(resource && resource.isCached()) {
                return true;
            }
            return false;
        } else {
            return false;
        }
    }

    // todo: fragile method that breaks when we add new campaign types
    private static getAssetSize(campaign: Campaign): Promise<number> {
        if(SdkStats.isCampaignCached(campaign)) {
            let asset: Asset | undefined;
            if(campaign instanceof PerformanceCampaign) {
                const video = (<PerformanceCampaign>campaign).getVideo();
                const portraitVideo = (<PerformanceCampaign>campaign).getPortraitVideo();
                if(video && video.isCached()) {
                    asset = video;
                } else if(portraitVideo && portraitVideo.isCached()) {
                    asset = portraitVideo;
                }
            } else if(campaign instanceof VastCampaign) {
                const video = (<VastCampaign>campaign).getVideo();
                if(video && video.isCached()) {
                    asset = video;
                }
            } else if(campaign instanceof MRAIDCampaign) {
                const resource = (<MRAIDCampaign>campaign).getResourceUrl();
                if(resource && resource.isCached()) {
                    asset = resource;
                }
            }

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
}
