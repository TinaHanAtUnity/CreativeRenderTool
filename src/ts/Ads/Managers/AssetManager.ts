import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { CacheDiagnostics, ICacheDiagnostics } from 'Ads/Utilities/CacheDiagnostics';
import { ProgrammaticTrackingError, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
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

enum CacheType {
    REQUIRED,
    OPTIONAL
}

type ICampaignQueueResolveFunction = (campaign: Campaign) => void;
type ICampaignQueueRejectFunction = (reason?: any) => void;

interface ICampaignQueueObject {
    campaign: Campaign;
    resolved: boolean;
    resolve: ICampaignQueueResolveFunction;
    reject: ICampaignQueueRejectFunction;
}

type IAssetQueueResolveFunction = (value: string[]) => void;
type IAssetQueueRejectFunction = (reason?: any) => void;

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
    private _pts: ProgrammaticTrackingService;
    private _deviceInfo: DeviceInfo;
    private _stopped: boolean;
    private _caching: boolean;
    private _fastConnectionDetected: boolean;
    private _requiredQueue: IAssetQueueObject[];
    private _optionalQueue: IAssetQueueObject[];
    private _campaignQueue: { [id: number]: ICampaignQueueObject };
    private _queueId: number;
    private _backupCampaignManager: BackupCampaignManager;

    private _sendCacheDiagnostics = false;

    constructor(platform: Platform, core: ICoreApi, cache: CacheManager, cacheMode: CacheMode, deviceInfo: DeviceInfo, cacheBookkeeping: CacheBookkeepingManager, pts: ProgrammaticTrackingService, backupCampaignManager: BackupCampaignManager) {
        this._platform = platform;
        this._core = core;
        this._cache = cache;
        this._cacheMode = cacheMode;
        this._cacheBookkeeping = cacheBookkeeping;
        this._pts = pts;
        this._deviceInfo = deviceInfo;
        this._stopped = false;
        this._caching = false;
        this._fastConnectionDetected = false;
        this._requiredQueue = [];
        this._optionalQueue = [];
        this._campaignQueue = {};
        this._queueId = 0;
        this._backupCampaignManager = backupCampaignManager;

        if(cacheMode === CacheMode.ADAPTIVE) {
            this._cache.onFastConnectionDetected.subscribe(() => this.onFastConnectionDetected());
        }
    }

    public setCacheDiagnostics(value: boolean) {
        this._sendCacheDiagnostics = value;
    }

    public setup(campaign: Campaign): Promise<Campaign> {
        if(this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }

        return this.selectAssets(campaign).then(([requiredAssets, optionalAssets]) => {
            const requiredChain = this.cache(requiredAssets, campaign, CacheType.REQUIRED).then(() => {
                return this.validateVideos(requiredAssets, campaign);
            });

            if(this._cacheMode === CacheMode.FORCED) {
                return requiredChain.then(() => {
                    this.cache(optionalAssets, campaign, CacheType.OPTIONAL).then(() => {
                        // store as backup campaign only when all required and optional assets are cached
                        this._backupCampaignManager.storeCampaign(campaign);
                    }).catch(() => {
                        // allow optional assets to fail caching when in CacheMode.FORCED
                    });
                    return campaign;
                });
            } else if(this._cacheMode === CacheMode.ADAPTIVE) {
                if(this._fastConnectionDetected) {
                    // if fast connection has been detected, set campaign ready immediately and start caching (like CacheMode.ALLOWED)
                    requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL)).catch(() => {
                        // allow optional assets to fail
                    });
                    return Promise.resolve(campaign);
                } else {
                    const id: number = this._queueId;
                    const promise = this.registerCampaign(campaign, id);
                    this._queueId++;

                    requiredChain.then(() => {
                        const campaignObject = this._campaignQueue[id];

                        if(campaignObject) {
                            if(!campaignObject.resolved) {
                                campaignObject.resolved = true;
                                campaignObject.resolve(campaign);
                            }

                            delete this._campaignQueue[id];
                        }

                        this.cache(optionalAssets, campaign, CacheType.OPTIONAL).catch(() => {
                            // allow optional assets to fail caching when in CacheMode.FORCED
                        });
                        return campaign;
                    }).catch(error => {
                        const campaignObject = this._campaignQueue[id];

                        if(campaignObject) {
                            if(!campaignObject.resolved) {
                                campaignObject.resolved = true;
                                campaignObject.reject(error);
                            }

                            delete this._campaignQueue[id];
                        }
                    });

                    return promise;
                }
            } else {
                requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL)).then(() => {
                    // store as backup campaign only when all required and optional assets are cached
                    this._backupCampaignManager.storeCampaign(campaign);
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

        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
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

        while(this._requiredQueue.length) {
            const object: IAssetQueueObject | undefined = this._requiredQueue.shift();
            if(object) {
                object.reject(CacheStatus.STOPPED);
            }
        }

        while(this._optionalQueue.length) {
            const object: IAssetQueueObject | undefined = this._optionalQueue.shift();
            if(object) {
                object.reject(CacheStatus.STOPPED);
            }
        }
    }

    public checkFreeSpace(): Promise<void> {
        if(this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve();
        }

        return this._cache.getFreeSpace().then(freeSpace => {
            // disable caching if there is less than 20 megabytes free space in cache directory
            if(freeSpace < 20480) {
                this._cacheMode = CacheMode.DISABLED;

                Diagnostics.trigger('caching_disabled', {
                    freeCacheSpace: freeSpace
                });
            }

            return;
        }).catch(error => {
            Diagnostics.trigger('cache_space_check_failed', {});
        });
    }

    private cache(assets: Asset[], campaign: Campaign, cacheType: CacheType): Promise<void> {
        let chain = Promise.resolve();
        for(const asset of assets) {
            chain = chain.then(() => {
                if(this._stopped) {
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
            });
        }
        return chain;
    }

    private queueAsset(url: string, cacheType: CacheType, diagnostics?: ICacheDiagnostics): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const queueObject: IAssetQueueObject = {
                url: url,
                diagnostics: diagnostics,
                resolve: resolve,
                reject: reject
            };
            if(cacheType === CacheType.REQUIRED) {
                this._requiredQueue.push(queueObject);
            } else {
                this._optionalQueue.push(queueObject);
            }
        });
    }

    private executeAssetQueue(campaign: Campaign): void {
        if(!this._caching) {
            let currentAsset: IAssetQueueObject | undefined = this._requiredQueue.shift();
            if(!currentAsset) {
                currentAsset = this._optionalQueue.shift();
            }

            if(currentAsset) {
                const asset: IAssetQueueObject = currentAsset;
                this._caching = true;
                const tooLargeFileObserver = this._cache.onTooLargeFile.subscribe((callback, size, totalSize, responseCode, headers) => {
                    this.handleTooLargeFile(asset.url, campaign, size, totalSize, responseCode, headers);
                });
                let cacheDiagnostics: CacheDiagnostics | undefined;
                if(currentAsset.diagnostics) {
                    cacheDiagnostics = new CacheDiagnostics(this._cache, currentAsset.diagnostics);
                }
                this._cache.cache(asset.url).then(([fileId, fileUrl]) => {
                    this._cache.onTooLargeFile.unsubscribe(tooLargeFileObserver);
                    if(cacheDiagnostics) {
                        cacheDiagnostics.stop();
                    }
                    asset.resolve([fileId, fileUrl]);
                    this._caching = false;
                    this.executeAssetQueue(campaign);
                }).catch(error => {
                    this._cache.onTooLargeFile.unsubscribe(tooLargeFileObserver);
                    if(cacheDiagnostics) {
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
        for(const asset of assets) {
            if(asset instanceof Video) {
                promises.push(VideoFileInfo.isVideoValid(this._platform, this._core.Cache, asset, campaign).then(valid => {
                    if(!valid) {
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

            if(landscape) {
                if(landscapeVideo) {
                    return landscapeVideo;
                }
                if(portraitVideo) {
                    return portraitVideo;
                }
            }

            if(portrait) {
                if(portraitVideo) {
                    return portraitVideo;
                }
                if(landscapeVideo) {
                    return landscapeVideo;
                }
            }

            throw new WebViewError('Unable to select oriented video for caching');
        });
    }

    private onFastConnectionDetected(): void {
        this._fastConnectionDetected = true;

        for(const id in this._campaignQueue) {
            if(this._campaignQueue.hasOwnProperty(id)) {
                const campaignObject = this._campaignQueue[id];
                if(!campaignObject.resolved) {
                    campaignObject.resolved = true;
                    campaignObject.resolve(campaignObject.campaign);
                }
            }
        }
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
        if(this._sendCacheDiagnostics) {
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
        if (seatId !== undefined) {
            let adType: string = '';
            const maybeAdType: string | undefined = campaign.getAdType();
            if (maybeAdType !== undefined) {
                adType = maybeAdType;
            }
            const errorData = this._pts.buildErrorData(ProgrammaticTrackingError.TooLargeFile, adType, seatId);
            this._pts.reportError(errorData);
        }
    }
}
