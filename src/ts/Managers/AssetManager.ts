import { Cache } from 'Utilities/Cache';
import { Campaign } from 'Models/Campaign';
import { CacheMode } from 'Models/Configuration';
import { Asset } from 'Models/Asset';

export class AssetManager {

    private _cache: Cache;
    private _cacheMode: CacheMode;

    constructor(cache: Cache, cacheMode: CacheMode) {
        this._cache = cache;
        this._cacheMode = cacheMode;
    }

    public setup(campaign: Campaign): Promise<Campaign> {
        if(this._cacheMode === CacheMode.DISABLED) {
            return Promise.resolve(campaign);
        }
        return this.cache(campaign.getRequiredAssets()).then(() => {
            const optionalChain = this.cache(campaign.getOptionalAssets());
            if(this._cacheMode === CacheMode.FORCED) {
                return optionalChain;
            }
            return Promise.resolve();
        }).catch(error => {
            if(this._cacheMode !== CacheMode.ALLOWED) {
                throw error;
            }
        });
    }

    private cache(assets: Asset[]): Promise<any> {
        let chain = Promise.resolve();
        for(let i = 0; i < assets.length; ++i) {
            chain = chain.then(() => {
                const asset = assets[i];
                return this._cache.cache(asset.getUrl()).then(fileUrl => asset.setCachedUrl(fileUrl));
            });
        }
        return chain;
    }

}
