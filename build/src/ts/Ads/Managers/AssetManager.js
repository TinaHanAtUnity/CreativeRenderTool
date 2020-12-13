import { Video } from 'Ads/Models/Assets/Video';
import { CacheDiagnostics } from 'Ads/Utilities/CacheDiagnostics';
import { ErrorMetric, SDKMetrics, CachingMetric } from 'Ads/Utilities/SDKMetrics';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoFileInfo } from 'Ads/Utilities/VideoFileInfo';
import { WebViewError } from 'Core/Errors/WebViewError';
import { CacheStatus } from 'Core/Managers/CacheManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
var CacheType;
(function (CacheType) {
    CacheType[CacheType["REQUIRED"] = 0] = "REQUIRED";
    CacheType[CacheType["OPTIONAL"] = 1] = "OPTIONAL";
})(CacheType || (CacheType = {}));
export class AssetManager {
    constructor(platform, core, cache, cacheMode, deviceInfo, cacheBookkeeping) {
        this._sendCacheDiagnostics = false;
        this._platform = platform;
        this._core = core;
        this._cache = cache;
        this._cacheMode = cacheMode;
        this._cacheBookkeeping = cacheBookkeeping;
        this._deviceInfo = deviceInfo;
        this._stopped = false;
        this._caching = false;
        this._fastConnectionDetected = false;
        this._requiredQueue = [];
        this._optionalQueue = [];
        this._campaignQueue = {};
        this._queueId = 0;
    }
    overrideCacheMode(cacheMode) {
        this._cacheMode = cacheMode;
    }
    setCacheDiagnostics(value) {
        this._sendCacheDiagnostics = value;
    }
    setup(campaign) {
        if (this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }
        return this.selectAssets(campaign).then(([requiredAssets, optionalAssets]) => {
            const requiredChain = this.cache(requiredAssets, campaign, CacheType.REQUIRED).then(() => {
                return this.validateVideos(requiredAssets, campaign);
            });
            if (this._cacheMode === CacheMode.FORCED) {
                return requiredChain.then(() => {
                    this.cache(optionalAssets, campaign, CacheType.OPTIONAL).catch(() => {
                        // allow optional assets to fail caching when in CacheMode.FORCED
                    });
                    return campaign;
                });
            }
            else {
                requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL)).catch(() => {
                    // allow optional assets to fail caching when not in CacheMode.FORCED
                });
            }
            return Promise.resolve(campaign);
        });
    }
    selectAssets(campaign) {
        const requiredAssets = campaign.getRequiredAssets();
        const optionalAssets = campaign.getOptionalAssets();
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            return this.getOrientedVideo(campaign).then(video => {
                return [[video, ...requiredAssets], optionalAssets];
            });
        }
        return Promise.resolve([
            requiredAssets,
            optionalAssets
        ]);
    }
    enableCaching() {
        this._stopped = false;
    }
    stopCaching() {
        this._stopped = true;
        this._fastConnectionDetected = false;
        this._cache.stop();
        this._requiredQueue.forEach(o => o.reject(CacheStatus.STOPPED));
        this._requiredQueue = [];
        this._optionalQueue.forEach(o => o.reject(CacheStatus.STOPPED));
        this._optionalQueue = [];
    }
    checkFreeSpace() {
        if (this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve();
        }
        return this._cache.getFreeSpace().then(freeSpace => {
            // disable caching if there is less than 20 megabytes free space in cache directory
            if (freeSpace < 20480) {
                this._cacheMode = CacheMode.DISABLED;
                SDKMetrics.reportMetricEvent(CachingMetric.CachingModeForcedToDisabled);
            }
            return;
        }).catch(error => {
            Diagnostics.trigger('cache_space_check_failed', {});
        });
    }
    cache(assets, campaign, cacheType) {
        return assets.reduce((chain, asset) => chain.then(() => this.cacheAsset(asset, campaign, cacheType)), Promise.resolve());
    }
    cacheAsset(asset, campaign, cacheType) {
        if (this._stopped) {
            return Promise.reject(CacheStatus.STOPPED);
        }
        const promise = this.queueAsset(asset.getOriginalUrl(), cacheType, this.getCacheDiagnostics(asset, campaign)).then(([fileId, fileUrl]) => {
            asset.setFileId(fileId);
            asset.setCachedUrl(fileUrl);
            return fileId;
        }).then((fileId) => {
            if (cacheType === CacheType.REQUIRED) {
                return this._cacheBookkeeping.writeFileForCampaign(campaign.getId(), fileId);
            }
            return Promise.resolve();
        });
        this.executeAssetQueue(campaign);
        return promise;
    }
    queueAsset(url, cacheType, diagnostics) {
        return new Promise((resolve, reject) => {
            const queueObject = {
                url: url,
                diagnostics: diagnostics,
                resolve: resolve,
                reject: reject
            };
            if (cacheType === CacheType.REQUIRED) {
                this._requiredQueue.push(queueObject);
            }
            else {
                this._optionalQueue.push(queueObject);
            }
        });
    }
    executeAssetQueue(campaign) {
        if (!this._caching) {
            let currentAsset = this._requiredQueue.shift();
            if (!currentAsset) {
                currentAsset = this._optionalQueue.shift();
            }
            if (currentAsset) {
                const asset = currentAsset;
                this._caching = true;
                const tooLargeFileObserver = this._cache.onTooLargeFile.subscribe((callback, size, totalSize, responseCode, headers) => {
                    this.handleTooLargeFile(asset.url, campaign, size, totalSize, responseCode, headers);
                });
                let cacheDiagnostics;
                if (currentAsset.diagnostics) {
                    cacheDiagnostics = new CacheDiagnostics(this._cache, currentAsset.diagnostics);
                }
                this._cache.cache(asset.url).then(([fileId, fileUrl]) => {
                    this._cache.onTooLargeFile.unsubscribe(tooLargeFileObserver);
                    if (cacheDiagnostics) {
                        cacheDiagnostics.stop();
                    }
                    asset.resolve([fileId, fileUrl]);
                    this._caching = false;
                    this.executeAssetQueue(campaign);
                }).catch(error => {
                    this._cache.onTooLargeFile.unsubscribe(tooLargeFileObserver);
                    if (cacheDiagnostics) {
                        cacheDiagnostics.stop();
                    }
                    asset.reject(error);
                    this._caching = false;
                    this.executeAssetQueue(campaign);
                });
            }
        }
    }
    validateVideos(assets, campaign) {
        const promises = [];
        for (const asset of assets) {
            if (asset instanceof Video) {
                promises.push(VideoFileInfo.isVideoValid(this._platform, this._core.Cache, asset, campaign).then(valid => {
                    if (!valid) {
                        throw new Error('Video failed to validate: ' + asset.getOriginalUrl());
                    }
                }));
            }
        }
        return Promise.all(promises);
    }
    getOrientedVideo(campaign) {
        return Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const landscape = screenWidth >= screenHeight;
            const portrait = screenHeight > screenWidth;
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if (landscape) {
                if (landscapeVideo) {
                    return landscapeVideo;
                }
                if (portraitVideo) {
                    return portraitVideo;
                }
            }
            if (portrait) {
                if (portraitVideo) {
                    return portraitVideo;
                }
                if (landscapeVideo) {
                    return landscapeVideo;
                }
            }
            throw new WebViewError('Unable to select oriented video for caching');
        });
    }
    registerCampaign(campaign, id) {
        return new Promise((resolve, reject) => {
            const queueObject = {
                campaign: campaign,
                resolved: false,
                resolve: resolve,
                reject: reject
            };
            this._campaignQueue[id] = queueObject;
        });
    }
    getCacheDiagnostics(asset, campaign) {
        if (this._sendCacheDiagnostics) {
            return {
                creativeType: asset.getDescription(),
                targetGameId: campaign instanceof PerformanceCampaign ? campaign.getGameId() : 0,
                targetCampaignId: campaign.getId()
            };
        }
        return undefined;
    }
    handleTooLargeFile(url, campaign, size, totalSize, responseCode, headers) {
        SessionDiagnostics.trigger('too_large_file', {
            url: url,
            size: size,
            totalSize: totalSize,
            responseCode: responseCode,
            headers: headers
        }, campaign.getSession());
        const seatId = campaign.getSeatId();
        SDKMetrics.reportMetricEvent(ErrorMetric.TooLargeFile);
        CreativeBlocking.report(campaign.getCreativeId(), seatId, campaign.getId(), BlockingReason.FILE_TOO_LARGE, {
            fileSize: Math.floor(totalSize / (1024 * 1024))
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9Bc3NldE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWhELE9BQU8sRUFBRSxnQkFBZ0IsRUFBcUIsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNyRixPQUFPLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQXVCLE1BQU0sMEJBQTBCLENBQUM7QUFDdkcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTVELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUd4RCxPQUFPLEVBQWdCLFdBQVcsRUFBZSxNQUFNLDRCQUE0QixDQUFDO0FBQ3BGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUUxRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUduRixJQUFLLFNBR0o7QUFIRCxXQUFLLFNBQVM7SUFDVixpREFBUSxDQUFBO0lBQ1IsaURBQVEsQ0FBQTtBQUNaLENBQUMsRUFISSxTQUFTLEtBQVQsU0FBUyxRQUdiO0FBc0JELE1BQU0sT0FBTyxZQUFZO0lBa0JyQixZQUFZLFFBQWtCLEVBQUUsSUFBYyxFQUFFLEtBQW1CLEVBQUUsU0FBb0IsRUFBRSxVQUFzQixFQUFFLGdCQUF5QztRQUZwSiwwQkFB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