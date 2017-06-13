import { Cache, ICacheDiagnostics } from 'Utilities/Cache';
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

export class AssetManager {

    private _cache: Cache;
    private _cacheMode: CacheMode;
    private _deviceInfo: DeviceInfo;
    private _stopped: boolean;

    constructor(cache: Cache, cacheMode: CacheMode, deviceInfo: DeviceInfo) {
        this._cache = cache;
        this._cacheMode = cacheMode;
        this._deviceInfo = deviceInfo;
        this._stopped = false;
    }

    public setup(campaign: Campaign, plc?: boolean): Promise<Campaign> {
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

            if(this._cacheMode === CacheMode.FORCED || plc) {
                return requiredChain.then(() => {
                    if(plc) {
                        // hack to avoid race conditions with plc when there are multiple different campaigns
                        // proper fix is to refactor AssetManager to trigger events instead of returning one promise
                        return this.cache(optionalAssets, campaign, CacheType.OPTIONAL).then(() => {
                            return campaign;
                        });
                    } else {
                        this.cache(optionalAssets, campaign, CacheType.OPTIONAL);
                        return campaign;
                    }
                });
            } else {
                requiredChain.then(() => this.cache(optionalAssets, campaign, CacheType.OPTIONAL));
            }

            return Promise.resolve(campaign);
        });
    }

    public selectAssets(campaign: Campaign): Promise<[Asset[], Asset[]]> {
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
        this._cache.stop();
    }

    private cache(assets: Asset[], campaign: Campaign, cacheType: CacheType): Promise<void> {
        let chain = Promise.resolve();
        for(const asset of assets) {
            chain = chain.then(() => {
                if(this._stopped) {
                    throw new Error('Caching stopped');
                }

                return this._cache.cache(asset.getUrl(), this.getCacheDiagnostics(asset, campaign)).then(([fileId, fileUrl]) => {
                    asset.setFileId(fileId);
                    asset.setCachedUrl(fileUrl);
                    return fileId;
                }).then((fileId) => {
                    if (cacheType === CacheType.REQUIRED) {
                        return this._cache.writeCachedFileForCampaign(campaign.getId(), fileId);
                    }

                    return Promise.resolve();
                });
            });
        }
        return chain;
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

    private getCacheDiagnostics(asset: Asset, campaign: Campaign): ICacheDiagnostics {
        return {
            creativeType: asset.getDescription(),
            gamerId: campaign.getGamerId(),
            targetGameId: campaign instanceof PerformanceCampaign ? (<PerformanceCampaign>campaign).getGameId() : 0,
            targetCampaignId: campaign.getId()
        };
    }
}
