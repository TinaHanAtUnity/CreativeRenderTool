import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
export class SdkStats {
    static initialize(core, request, coreConfig, adsConfig, sessionManager, campaignManager, metaDataManager, clientInfo, cache) {
        SdkStats._core = core;
        SdkStats._request = request;
        SdkStats._coreConfig = coreConfig;
        SdkStats._adsConfig = adsConfig;
        SdkStats._sessionManager = sessionManager;
        SdkStats._campaignManager = campaignManager;
        SdkStats._metaDataManager = metaDataManager;
        SdkStats._clientInfo = clientInfo;
        cache.onFinish.subscribe((event) => SdkStats.setCachingFinishTimestamp(event.fileId));
        cache.onStart.subscribe((event, size) => {
            if (size === 0) {
                SdkStats.setCachingStartTimestamp(event.fileId);
            }
        });
        SdkStats._initialized = true;
    }
    static sendReadyEvent(placementId) {
        if (SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('ready', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, KafkaCommonObjectType.ANONYMOUS, event);
            });
        }
    }
    static sendShowEvent(placementId) {
        if (SdkStats._initialized && SdkStats.isTestActive()) {
            SdkStats.getSdkStatsEvent('show', placementId).then(event => {
                HttpKafka.sendEvent(SdkStats._topic, KafkaCommonObjectType.ANONYMOUS, event);
            });
        }
    }
    static increaseAdRequestOrdinal() {
        SdkStats._adRequestOrdinal++;
    }
    static getAdRequestOrdinal() {
        return SdkStats._adRequestOrdinal;
    }
    static setInitTimestamp() {
        SdkStats._initTimestamp = Date.now();
    }
    static setAdRequestTimestamp() {
        SdkStats._latestAdRequestTimestamp = Date.now();
        SdkStats._parseDuration = {};
    }
    static getAdRequestTimestamp() {
        return SdkStats._latestAdRequestTimestamp;
    }
    static setAdRequestDuration(duration) {
        SdkStats._latestAdRequestDuration = duration;
    }
    static setReadyEventTimestamp(placementId) {
        SdkStats._readyEventSent[placementId] = Date.now();
    }
    static getReadyEventTimestamp(placementId) {
        return SdkStats._readyEventSent[placementId];
    }
    static getRequestToReadyTime(placementId) {
        return SdkStats.getReadyEventTimestamp(placementId) - SdkStats.getAdRequestTimestamp();
    }
    static setCachingStartTimestamp(fileId) {
        SdkStats._cachingStarted[fileId] = Date.now();
    }
    static setCachingFinishTimestamp(fileId) {
        SdkStats._cachingFinished[fileId] = Date.now();
    }
    static setParseDuration(placementId, duration) {
        SdkStats._parseDuration[placementId] = duration;
    }
    static setFrameSetStartTimestamp(placementId) {
        SdkStats._frameSetStarted[placementId] = Date.now();
    }
    static getFrameSetStartTimestamp(placementId) {
        return SdkStats._frameSetStarted[placementId];
    }
    static isTestActive() {
        const gameSessionId = SdkStats._sessionManager.getGameSessionId();
        if (typeof gameSessionId === 'number' && gameSessionId % 1000 === 0) {
            return true;
        }
        return false;
    }
    static getSdkStatsEvent(eventType, placementId) {
        const placement = SdkStats._adsConfig.getPlacement(placementId);
        const campaign = (placement.getCurrentCampaign());
        const eventTimestamp = Date.now();
        return Promise.all([CampaignManager.getFullyCachedCampaigns(this._core),
            SdkStats.getAssetSize(campaign),
            SdkStats._metaDataManager.fetch(MediationMetaData)]).then(([cachedCampaigns, assetSize, mediationMetaData]) => {
            const userInfo = {
                abGroup: SdkStats._coreConfig.getAbGroup()
            };
            const placementInfo = {
                auctionId: campaign.getSession().getId(),
                gameSessionId: SdkStats._sessionManager.getGameSessionId(),
                placementId: placementId,
                allowSkipVideoInSeconds: placement.allowSkip() ? placement.allowSkipInSeconds() : undefined
            };
            const campaignInfo = {
                campaignId: campaign.getId(),
                targetGameId: undefined,
                campaignType: SdkStats.getCampaignType(campaign)
            };
            const cacheInfo = {
                cachedCampaigns: cachedCampaigns,
                isVideoCached: SdkStats.isCampaignCached(campaign),
                cachingMode: CacheMode[SdkStats._adsConfig.getCacheMode()],
                videoCachedMsAgo: SdkStats.getCachedMsAgo(campaign),
                cacheDuration: SdkStats.getCachingDuration(campaign),
                size: assetSize > 0 ? assetSize : undefined
            };
            let mediationInfo;
            if (mediationMetaData) {
                mediationInfo = {
                    mediationName: mediationMetaData.getName(),
                    mediationVersion: mediationMetaData.getVersion(),
                    mediationOrdinal: mediationMetaData.getOrdinal()
                };
            }
            const eventInfo = {
                eventType: eventType,
                adRequestOrdinal: SdkStats._adRequestOrdinal,
                delayInitToRequest: SdkStats._latestAdRequestTimestamp - SdkStats._initTimestamp,
                parseDuration: SdkStats._parseDuration[placementId],
                requestDuration: SdkStats._latestAdRequestDuration,
                delayInitToReady: SdkStats._readyEventSent[placementId] - SdkStats._initTimestamp,
                delaySDKInitToWebViewInit: SdkStats._initTimestamp - SdkStats._clientInfo.getInitTimestamp(),
                reinitializedSDK: SdkStats._clientInfo.isReinitialized()
            };
            if (eventType === 'show') {
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
    static getCampaignType(campaign) {
        if (campaign instanceof PerformanceCampaign) {
            return 'perf';
        }
        else if (campaign instanceof VastCampaign) {
            return 'vast';
        }
        else if (campaign instanceof MRAIDCampaign) {
            return 'mraid';
        }
        else if (campaign instanceof DisplayInterstitialCampaign) {
            return 'display';
        }
        else if (campaign instanceof VPAIDCampaign) {
            return 'vpaid';
        }
        else {
            return 'unknown';
        }
    }
    static isCampaignCached(campaign) {
        const asset = CampaignAssetInfo.getCachedAsset(campaign);
        if (asset && asset.isCached()) {
            return true;
        }
        return false;
    }
    static getAssetSize(campaign) {
        if (SdkStats.isCampaignCached(campaign)) {
            const asset = CampaignAssetInfo.getCachedAsset(campaign);
            if (asset) {
                return SdkStats._core.Cache.getFileInfo(asset.getFileId()).then((fileInfo) => {
                    if (fileInfo.found) {
                        return fileInfo.size;
                    }
                    else {
                        return 0;
                    }
                }).catch(() => {
                    return 0;
                });
            }
            else {
                return Promise.resolve(0);
            }
        }
        else {
            return Promise.resolve(0);
        }
    }
    static getCachedMsAgo(campaign) {
        const asset = CampaignAssetInfo.getCachedAsset(campaign);
        if (asset) {
            const fileId = asset.getFileId();
            if (fileId) {
                // check that asset was fully cached within this game session (not resumed from earlier sessions)
                if (SdkStats._cachingStarted[fileId] && SdkStats._cachingFinished[fileId]) {
                    return Date.now() - SdkStats._cachingFinished[fileId];
                }
            }
        }
        return undefined;
    }
    static getCachingDuration(campaign) {
        const asset = CampaignAssetInfo.getCachedAsset(campaign);
        if (asset) {
            const fileId = asset.getFileId();
            if (fileId) {
                // check that asset was fully cached within this game session (not resumed from earlier sessions)
                if (SdkStats._cachingStarted[fileId] && SdkStats._cachingFinished[fileId]) {
                    return SdkStats._cachingFinished[fileId] - SdkStats._cachingStarted[fileId];
                }
            }
        }
        return undefined;
    }
}
SdkStats._topic = 'ads.sdk2.events.sdktimeline.json';
SdkStats._initialized = false;
SdkStats._adRequestOrdinal = 0;
SdkStats._parseDuration = {};
SdkStats._readyEventSent = {};
SdkStats._cachingStarted = {};
SdkStats._cachingFinished = {};
SdkStats._frameSetStarted = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2RrU3RhdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9TZGtTdGF0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFNL0QsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFNcEUsT0FBTyxFQUFFLFNBQVMsRUFBcUIsTUFBTSwrQkFBK0IsQ0FBQztBQUM3RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUUzRSxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDNUUsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDekYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUF5RDNELE1BQU0sT0FBTyxRQUFRO0lBQ1YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFjLEVBQUUsT0FBdUIsRUFBRSxVQUE2QixFQUFFLFNBQTJCLEVBQUUsY0FBOEIsRUFBRSxlQUFnQyxFQUFFLGVBQWdDLEVBQUUsVUFBc0IsRUFBRSxLQUFtQjtRQUN6USxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixRQUFRLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUM1QixRQUFRLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUNsQyxRQUFRLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUNoQyxRQUFRLENBQUMsZUFBZSxHQUFHLGNBQWMs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