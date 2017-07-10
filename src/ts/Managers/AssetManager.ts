import { Cache, ICacheDiagnostics, CacheStatus } from 'Utilities/Cache';
import { Campaign } from 'Models/Campaign';
import { CacheMode } from 'Models/Configuration';
import { Asset } from 'Models/Assets/Asset';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Video } from 'Models/Assets/Video';
import { DeviceInfo } from 'Models/DeviceInfo';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { WebViewError } from 'Errors/WebViewError';

enum CacheType {
    REQUIRED,
    OPTIONAL
}

interface ICampaignQueueObject {
    campaign: Campaign;
    ready: boolean;
    resolve: (campaign: Campaign) => void;
    reject: (reason?: any) => void;
}

interface IAssetQueueObject {
    url: string;
    diagnostics: ICacheDiagnostics;
    resolve: (value: string[]) => void;
    reject: (reason?: any) => void;
}

export class AssetManager {

    private _cache: Cache;
    private _cacheMode: CacheMode;
    private _deviceInfo: DeviceInfo;
    private _stopped: boolean;
    private _caching: boolean;
    private _fastConnectionDetected: boolean;
    private _requiredQueue: IAssetQueueObject[];
    private _optionalQueue: IAssetQueueObject[];
    private _campaignQueue: { [id: number]: ICampaignQueueObject };
    private _campaignId: number;

    constructor(cache: Cache, cacheMode: CacheMode, deviceInfo: DeviceInfo) {
        this._cache = cache;
        this._cacheMode = cacheMode;
        this._deviceInfo = deviceInfo;
        this._stopped = false;
        this._caching = false;
        this._fastConnectionDetected = false;
        this._requiredQueue = [];
        this._optionalQueue = [];
        this._campaignQueue = {};
        this._campaignId = 0;

        if(cacheMode === CacheMode.ADAPTIVE) {
            this._cache.onFastConnectionDetected.subscribe(() => this.onFastConnectionDetected());
        }
    }

    public setup(campaign: Campaign): Promise<Campaign> {
        if(!this.validateAssets(campaign)) {
            throw new Error('Invalid required assets in campaign ' + campaign.getId());
        }

        if(this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }

        return this.selectAssets(campaign).then(([requiredAssets, optionalAssets]) => {
            const requiredChain = this.cache(requiredAssets, campaign, CacheType.REQUIRED).then(() => {
                return this.validateVideos(requiredAssets);
            });

            if(this._cacheMode === CacheMode.FORCED) {
                return requiredChain.then(() => {
                    this.cache(optionalAssets, campaign, CacheType.OPTIONAL).catch(() => {
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
                    const id: number = this._campaignId;
                    const promise = this.registerCampaign(campaign, id);
                    this._campaignId++;

                    requiredChain.then(() => {
                        const campaignObject = this._campaignQueue[id];

                        if(campaignObject) {
                            if(!campaignObject.ready) {
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
                            if(!campaignObject.ready) {
                                campaignObject.reject(error);
                            }

                            delete this._campaignQueue[id];
                        }
                    });

                    return promise;
                }
            } else {
                requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL)).catch(() => {
                    // allow optional assets to fail caching when not in CacheMode.FORCED
                });
            }

            return Promise.resolve(campaign);
        });
    }

    public selectAssets(campaign: Campaign): Promise<Asset[][]> {
        const requiredAssets = campaign.getRequiredAssets();
        const optionalAssets = campaign.getOptionalAssets();

        if(campaign instanceof PerformanceCampaign) {
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

    private cache(assets: Asset[], campaign: Campaign, cacheType: CacheType): Promise<void> {
        let chain = Promise.resolve();
        for(const asset of assets) {
            chain = chain.then(() => {
                if(this._stopped) {
                    throw new Error('Caching stopped');
                }

                const promise = this.queueAsset(asset.getUrl(), this.getCacheDiagnostics(asset, campaign), cacheType).then(([fileId, fileUrl]) => {
                    asset.setFileId(fileId);
                    asset.setCachedUrl(fileUrl);
                    return fileId;
                }).then((fileId) => {
                    if (cacheType === CacheType.REQUIRED) {
                        return this._cache.writeCachedFileForCampaign(campaign.getId(), fileId);
                    }

                    return Promise.resolve();
                });
                this.executeAssetQueue();
                return promise;
            });
        }
        return chain;
    }

    private queueAsset(url: string, diagnostics: ICacheDiagnostics, cacheType: CacheType): Promise<string[]> {
        return new Promise<string[]>((resolve,reject) => {
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

    private executeAssetQueue(): void {
        if(!this._caching) {
            let currentAsset: IAssetQueueObject | undefined = this._requiredQueue.shift();
            if(!currentAsset) {
                currentAsset = this._optionalQueue.shift();
            }

            if(currentAsset) {
                const asset: IAssetQueueObject = currentAsset;
                this._caching = true;
                this._cache.cache(asset.url, asset.diagnostics).then(([fileId, fileUrl]) => {
                    asset.resolve([fileId, fileUrl]);
                    this._caching = false;
                    this.executeAssetQueue();
                }).catch(error => {
                    asset.reject(error);
                    this._caching = false;
                    this.executeAssetQueue();
                });
            }
        }
    }

    private validateAssets(campaign: Campaign): boolean {
        const optionalAssets = campaign.getOptionalAssets();
        for(const optionalAsset of optionalAssets) {
            if(!Url.isValid(optionalAsset.getUrl())) {
                this.reportInvalidUrl(campaign, optionalAsset, false);
            }
        }

        const requiredAssets = campaign.getRequiredAssets();
        for(const requiredAsset of requiredAssets) {
            if(!Url.isValid(requiredAsset.getUrl())) {
                this.reportInvalidUrl(campaign, requiredAsset, true);
                return false;
            }
        }

        return true;
    }

    private validateVideos(assets: Asset[]): Promise<void[]> {
        const promises = [];
        for(const asset of assets) {
            if(asset instanceof Video) {
                promises.push(this._cache.isVideoValid(asset).then(valid => {
                    if(!valid) {
                        Diagnostics.trigger('video_validation_failed', {
                            url: asset.getOriginalUrl()
                        });
                        throw new Error('Video failed to validate: ' + asset.getOriginalUrl());
                    }
                }));
            }
        }

        return Promise.all(promises);
    }

    private reportInvalidUrl(campaign: Campaign, asset: Asset, required: boolean): void {
        Diagnostics.trigger('invalid_asset_url', {
            url: asset.getUrl(),
            assetType: asset.getDescription(),
            assetDTO: asset.getDTO(),
            required: required,
            id: campaign.getId(),
            campaignDTO: campaign.getDTO()
        });
    }

    private getOrientedVideo(campaign: PerformanceCampaign): Promise<Video> {
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
                if(!campaignObject.ready) {
                    campaignObject.ready = true;
                    campaignObject.resolve(campaignObject.campaign);
                }
            }
        }
    }

    private registerCampaign(campaign: Campaign, id: number): Promise<Campaign> {
        return new Promise<Campaign>((resolve,reject) => {
            const queueObject: ICampaignQueueObject = {
                campaign: campaign,
                ready: false,
                resolve: resolve,
                reject: reject
            };
            this._campaignQueue[id] = queueObject;
        });
    }

    private getCacheDiagnostics(asset: Asset, campaign: Campaign): ICacheDiagnostics {
        return {
            creativeType: asset.getDescription(),
            gamerId: campaign.getGamerId(),
            targetGameId: campaign instanceof PerformanceCampaign ? (<PerformanceCampaign>campaign).getGameId() : 0,
            targetCampaignId: campaign.getId()
        };
    }
}
