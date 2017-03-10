import { Cache } from 'Utilities/Cache';
import { Campaign } from 'Models/Campaign';
import { CacheMode } from 'Models/Configuration';
import { Asset } from 'Models/Asset';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';
import { Video } from 'Models/Video';

export class AssetManager {

    private _cache: Cache;
    private _cacheMode: CacheMode;

    constructor(cache: Cache, cacheMode: CacheMode) {
        this._cache = cache;
        this._cacheMode = cacheMode;
    }

    public setup(campaign: Campaign): Promise<Campaign> {
        if(!this.validateAssets(campaign)) {
            throw new Error('Invalid required assets in campaign ' + campaign.getId());
        }

        if(this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }

        const requiredChain = this.cache(campaign.getRequiredAssets()).then(() => {
            return this.validateVideos(campaign.getRequiredAssets());
        });

        if(this._cacheMode === CacheMode.FORCED) {
            return requiredChain.then(() => {
                this.cache(campaign.getOptionalAssets());
                return campaign;
            });
        } else {
            requiredChain.then(() => this.cache(campaign.getOptionalAssets()));
        }

        return Promise.resolve(campaign);
    }

    private cache(assets: Asset[]): Promise<void> {
        let chain = Promise.resolve();
        for(let i = 0; i < assets.length; ++i) {
            chain = chain.then(() => {
                const asset = assets[i];
                return this._cache.cache(asset.getUrl()).then(([fileId, fileUrl]) => {
                    asset.setFileId(fileId);
                    asset.setCachedUrl(fileUrl);
                });
            });
        }
        return chain;
    }

    private validateAssets(campaign: Campaign): boolean {
        const optionalAssets = campaign.getOptionalAssets();
        for(let i = 0; i < optionalAssets.length; ++i) {
            if(!Url.isValid(optionalAssets[i].getUrl())) {
                this.reportInvalidUrl(campaign, optionalAssets[i], false);
            }
        }

        const requiredAssets = campaign.getRequiredAssets();
        for(let i = 0; i < requiredAssets.length; ++i) {
            if(!Url.isValid(requiredAssets[i].getUrl())) {
                this.reportInvalidUrl(campaign, requiredAssets[i], true);
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
            required: required,
            id: campaign.getId()
        });
    }
}
