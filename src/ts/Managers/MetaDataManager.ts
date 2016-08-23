import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Model } from 'Models/Model';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { AdapterMetaData } from 'Models/MetaData//AdapterMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';

interface IMetaDataCaches {
    framework: Model | undefined;
    adapter: Model | undefined;
    mediation: Model | undefined;
    player: Model | undefined;
}

export class MetaDataManager {

    private static caches: IMetaDataCaches = {
        framework: undefined,
        adapter: undefined,
        mediation: undefined,
        player: undefined,
    };

    public static getValues(category: string, keys: string[], nativeBridge: NativeBridge) {
        return MetaDataManager.categoryExists(category, nativeBridge).then(exists => {
            if(!exists) {
                return Promise.resolve([]);
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

    public static fetchAdapterMetaData(nativeBridge: NativeBridge, cache = true): Promise<AdapterMetaData> {
        return MetaDataManager.fetch(AdapterMetaData.getCategory(), AdapterMetaData.getKeys(), nativeBridge, cache)
            .then(result => {
                return Promise.resolve(<AdapterMetaData>result);
            });
    }

    public static fetchMediationMetaData(nativeBridge: NativeBridge, cache = true): Promise<MediationMetaData> {
        return MetaDataManager.fetch(MediationMetaData.getCategory(), MediationMetaData.getKeys(), nativeBridge, cache)
            .then(result => {
                return Promise.resolve(<MediationMetaData>result);
            });
    }

    public static fetchPlayerMetaData(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return MetaDataManager.fetch(PlayerMetaData.getCategory(), PlayerMetaData.getKeys(), nativeBridge, false)
            .then(result => {
                if (result != null) {
                    MetaDataManager.caches.player = undefined;
                    return nativeBridge.Storage.delete(StorageType.PUBLIC, PlayerMetaData.getCategory()).then(() => <PlayerMetaData>result);
                }
                return Promise.resolve(<PlayerMetaData>result);
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
        if (data === undefined) {
            return undefined;
        }
        if(cache && !MetaDataManager.caches[category]) {
            MetaDataManager.caches[category] = MetaDataManager.createByCategory(category, data);
        }
        if(cache) {
            return MetaDataManager.caches[category];
        }
        return MetaDataManager.createByCategory(category, data);
    }

    public static createByCategory(category: string, data: string[]): Model | undefined {
        switch(category) {
            case 'framework':
                return new FrameworkMetaData(data);
            case 'adapter':
                return new AdapterMetaData(data);
            case 'mediation':
                return new MediationMetaData(data);
            case 'player':
                return new PlayerMetaData(data);
            default:
                return undefined;
        }
    }

    public static clearCaches() {
        MetaDataManager.caches = {
            framework: undefined,
            adapter: undefined,
            mediation: undefined,
            player: undefined,
        };
    }

    private static categoryExists(rootkey: string, nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.getKeys(StorageType.PUBLIC, rootkey, false).then(keys => {
            return keys.length > 0;
        });
    }
}
