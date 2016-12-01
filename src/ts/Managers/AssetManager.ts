import { Cache } from 'Utilities/Cache';
import { Campaign } from 'Models/Campaign';
import { CacheMode } from 'Models/Configuration';

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
        return campaign.getRequiredAssets().reduce((previous, current) => {
            return previous.then(() => {
                return this._cache.cache(current.getUrl()).then(fileUrl => current.setCachedUrl(fileUrl));
            });
        }, Promise.resolve()).then(() => {
            const optionalChain = campaign.getOptionalAssets().reduce((previous, current) => {
                return this._cache.cache(current.getUrl()).then(fileUrl => current.setCachedUrl(fileUrl));
            }, Promise.resolve());
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

}
