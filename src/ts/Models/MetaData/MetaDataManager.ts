import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Model } from 'Models/Model';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';

export class MetaDataManager {

    private static caches = {
        framework: Model,

    };

    public static keyExists(rootkey: string, nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, rootkey, false).then(keys => {
            return keys.length > 0;
        });
    }

    public static getValues(category: string, keys: string[], nativeBridge: NativeBridge) {
        return MetaDataManager.keyExists(category, nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve(undefined);
            }
            return Promise.all(keys.map((key) => nativeBridge.Storage.get<string>(StorageType.PUBLIC, category + '.' + key).catch(() => undefined)));
        });
    }

    public static fetchFrameworkMetaData(nativeBridge: NativeBridge, cache = true): Promise<FrameworkMetaData> {
        return MetaDataManager.fetch(FrameworkMetaData.getCategory(), FrameworkMetaData.getKeys(), nativeBridge, cache)
            .then(result => {
                return Promise.resolve(<FrameworkMetaData>result);
            });
    }

    public static fetch(category: string, keys: string[], nativeBridge: NativeBridge, cache = true): Promise<Model> {
        if(cache && MetaDataManager.caches[category]) {
            return Promise.resolve(MetaDataManager.caches[category]);
        }
        return MetaDataManager.getValues(category, keys, nativeBridge)
            .then((params) => {
                return MetaDataManager.createAndCache(category, params, cache);
            });
    }

    public static createAndCache(category: string, data: string[], cache = true) {
        if(cache && !MetaDataManager.caches[category]) {
            MetaDataManager.caches[category] = MetaDataManager.createByCategory(category, data);
        }
        if(cache) {
            return MetaDataManager.caches[category];
        }
        if (data === undefined) {
            return undefined;
        }
        return MetaDataManager.createByCategory(category, data);
    }

    public static createByCategory(category: string, data: string[]) {
        switch(category) {
            case 'framework':
                return new FrameworkMetaData(data);
            default:
                return null;
        }
    }
}