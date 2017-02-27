import { Cache } from 'Utilities/Cache';
import { Campaign } from 'Models/Campaign';
import { CacheMode } from 'Models/Configuration';
import { Asset } from 'Models/Asset';
import { Url } from 'Utilities/Url';
import { Diagnostics } from 'Utilities/Diagnostics';

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

        const requiredChain = this.cache(campaign.getRequiredAssets());

        if(this._cacheMode === CacheMode.FORCED) {
            return requiredChain.then(() => this.cache(campaign.getOptionalAssets()));
        } else {
            requiredChain.then(() => this.cache(campaign.getOptionalAssets()));
        }

        return Promise.resolve(campaign);
    }

    private cache(assets: Asset[]): Promise<any> {
        let chain = Promise.resolve();
        for(const asset of assets) {
            chain = chain.then(() => {
                return this._cache.cache(asset.getUrl()).then(fileUrl => asset.setCachedUrl(fileUrl));
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

    private reportInvalidUrl(campaign: Campaign, asset: Asset, required: boolean): void {
        Diagnostics.trigger('invalid_asset_url', {
            url: asset.getUrl(),
            required: required,
            id: campaign.getId()
        });
    }
}
