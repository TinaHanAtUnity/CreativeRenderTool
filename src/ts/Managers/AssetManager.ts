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
        return this.reduce<Asset>(assets, (previous, current) => {
            return previous.then(() => {
                return this._cache.cache(current.getUrl()).then(fileUrl => current.setCachedUrl(fileUrl));
            });
        }, Promise.resolve());
    }

    private reduce<T>(array: T[], callback: (previous: Promise<T>, current: T) => Promise<T>, initial?: Promise<T>): Promise<T> {
        let accumulator = initial ? initial : Promise.resolve(array[0]);
        for(let i = 0; i < array.length; ++i) {
            accumulator = callback.call(undefined, accumulator, array[i], i, array);
        }
        return accumulator;
    }

}
