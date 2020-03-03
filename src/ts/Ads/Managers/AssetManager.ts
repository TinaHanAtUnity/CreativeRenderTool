import { Asset } from 'Ads/Models/Assets/Asset';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { CacheDiagnostics, ICacheDiagnostics } from 'Ads/Utilities/CacheDiagnostics';
import { ErrorMetric, SDKMetrics, CachingMetric, CacheMetric } from 'Ads/Utilities/SDKMetrics';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoFileInfo } from 'Ads/Utilities/VideoFileInfo';
import { Platform } from 'Core/Constants/Platform';
import { WebViewError } from 'Core/Errors/WebViewError';
import { ICoreApi } from 'Core/ICore';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager, CacheStatus, HeadersType } from 'Core/Managers/CacheManager';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
import { createMeasurementsInstance } from 'Core/Utilities/TimeMeasurements';

enum CacheType {
    REQUIRED,
    OPTIONAL
}

type ICampaignQueueResolveFunction = (campaign: Campaign) => void;
type ICampaignQueueRejectFunction = (reason?: unknown) => void;

interface ICampaignQueueObject {
    campaign: Campaign;
    resolved: boolean;
    resolve: ICampaignQueueResolveFunction;
    reject: ICampaignQueueRejectFunction;
}

type IAssetQueueResolveFunction = (value: string[]) => void;
type IAssetQueueRejectFunction = (reason?: unknown) => void;

interface IAssetQueueObject {
    url: string;
    diagnostics?: ICacheDiagnostics;
    resolve: IAssetQueueResolveFunction;
    reject: IAssetQueueRejectFunction;
}

export class AssetManager {

    private _platform: Platform;
    private _core: ICoreApi;
    private _cache: CacheManager;
    private _cacheMode: CacheMode;
    private _cacheBookkeeping: CacheBookkeepingManager;
    private _deviceInfo: DeviceInfo;
    private _stopped: boolean;
    private _caching: boolean;
    private _fastConnectionDetected: boolean;
    private _requiredQueue: IAssetQueueObject[];
    private _optionalQueue: IAssetQueueObject[];
    private _campaignQueue: { [id: number]: ICampaignQueueObject };
    private _queueId: number;

    private _sendCacheDiagnostics = false;

    constructor(platform: Platform, core: ICoreApi, cache: CacheManager, cacheMode: CacheMode, deviceInfo: DeviceInfo, cacheBookkeeping: CacheBookkeepingManager) {
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

    public setCacheDiagnostics(value: boolean) {
        this._sendCacheDiagnostics = value;
    }

    public setup(campaign: Campaign): Promise<Campaign> {
        if (this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }

        const measurement = createMeasurementsInstance(CacheMetric.CacheLatency, {
            'cmd': CacheMode[this._cacheMode],
            'cct': campaign.getContentType()
        });

        return this.selectAssets(campaign).then(([requiredAssets, optionalAssets]) => {
            measurement.measure('select_assets');
            const requiredChain = this.cache(requiredAssets, campaign, CacheType.REQUIRED).then(() => {
                measurement.measure('required_assets');
                return this.validateVideos(requiredAssets, campaign).then(() => {
                    measurement.measure('validate_videos');
                });
            });

            if (this._cacheMode === CacheMode.FORCED) {
                return requiredChain.then(() => {
                    this.cache(optionalAssets, campaign, CacheType.OPTIONAL).then(() => {
                        measurement.measure('optional_assets');
                    }).catch(() => {
                        // allow optional assets to fail caching when in CacheMode.FORCED
                    });
                    return campaign;
                });
            } else {
                requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL)).then(() => {
                    measurement.measure('optional_assets');
                }).catch(() => {
                    // allow optional assets to fail caching when not in CacheMode.FORCED
                });
            }

            return Promise.resolve(campaign);
        });
    }

    public selectAssets(campaign: Campaign): Promise<Asset[][]> {
        const requiredAssets = campaign.getRequiredAssets();
        const optionalAssets = campaign.getOptionalAssets();

        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            return this.getOrientedVideo(campaign).then(video => {
                return [[video], optionalAssets];
            });
        }

        return Promise.resolve([
            requiredAssets,
            optionalAssets
        ]);
    }

    public enableCaching(): void {
        this._stopped = false;
    }

    public stopCaching(): void {
        this._stopped = true;
        this._fastConnectionDetected = false;
        this._cache.stop();

        this._requiredQueue.forEach(o => o.reject(CacheStatus.STOPPED));
        this._requiredQueue = [];

        this._optionalQueue.forEach(o => o.reject(CacheStatus.STOPPED));
        this._optionalQueue = [];
    }

    public checkFreeSpace(): Promise<void> {
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

    private cache(assets: Asset[], campaign: Campaign, cacheType: CacheType): Promise<void> {
        return assets.reduce((chain, asset) => chain.then(() => this.cacheAsset(asset, campaign, cacheType)), Promise.resolve());
    }

    private cacheAsset(asset: Asset, campaign: Campaign, cacheType: CacheType): Promise<void> {
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

    private queueAsset(url: string, cacheType: CacheType, diagnostics?: ICacheDiagnostics): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const queueObject: IAssetQueueObject = {
                url: url,
                diagnostics: diagnostics,
                resolve: resolve,
                reject: reject
            };
            if (cacheType === CacheType.REQUIRED) {
                this._requiredQueue.push(queueObject);
            } else {
                this._optionalQueue.push(queueObject);
            }
        });
    }

    private executeAssetQueue(campaign: Campaign): void {
        if (!this._caching) {
            let currentAsset: IAssetQueueObject | undefined = this._requiredQueue.shift();
            if (!currentAsset) {
                currentAsset = this._optionalQueue.shift();
            }

            if (currentAsset) {
                const asset: IAssetQueueObject = currentAsset;
                this._caching = true;
                const tooLargeFileObserver = this._cache.onTooLargeFile.subscribe((callback, size, totalSize, responseCode, headers) => {
                    this.handleTooLargeFile(asset.url, campaign, size, totalSize, responseCode, headers);
                });
                let cacheDiagnostics: CacheDiagnostics | undefined;
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

    private validateVideos(assets: Asset[], campaign: Campaign): Promise<void[]> {
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

    private getOrientedVideo(campaign: PerformanceCampaign | XPromoCampaign): Promise<Video> {
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

    private registerCampaign(campaign: Campaign, id: number): Promise<Campaign> {
        return new Promise<Campaign>((resolve, reject) => {
            const queueObject: ICampaignQueueObject = {
                campaign: campaign,
                resolved: false,
                resolve: resolve,
                reject: reject
            };
            this._campaignQueue[id] = queueObject;
        });
    }

    private getCacheDiagnostics(asset: Asset, campaign: Campaign): ICacheDiagnostics | undefined {
        if (this._sendCacheDiagnostics) {
            return {
                creativeType: asset.getDescription(),
                targetGameId: campaign instanceof PerformanceCampaign ? campaign.getGameId() : 0,
                targetCampaignId: campaign.getId()
            };
        }
        return undefined;
    }

    private handleTooLargeFile(url: string, campaign: Campaign, size: number, totalSize: number, responseCode: number, headers: HeadersType) {
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
