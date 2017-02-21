import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';
import { Model } from 'Models/Model';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';
import { MetaData } from 'Utilities/MetaData';

interface IMetaDataCaches {
    framework: Model | undefined;
    adapter: Model | undefined;
    mediation: Model | undefined;
    player: Model | undefined;
}

export class MetaDataManager {

    public static getValues(category: string, keys: string[], nativeBridge: NativeBridge) {
        const metaData: MetaData = new MetaData(nativeBridge);
        return metaData.hasCategory(category).then(exists => {
            if(!exists) {
                return Promise.resolve([]);
            }
            return Promise.all(keys.map((key) => metaData.get<string>(category + '.' + key, false).then(([found, value]) => {
                if(found) {
                    return value;
                } else {
                    return undefined;
                }
            })));
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

    // this method is for getting metadata object but it does not update the ordinal
    public static fetchMediationMetaData(nativeBridge: NativeBridge, cache = true): Promise<MediationMetaData> {
        return MetaDataManager.fetch(MediationMetaData.getCategory(), MediationMetaData.getStaticKeys(), nativeBridge, cache)
            .then(result => {
                return Promise.resolve(<MediationMetaData>result);
            });
    }

    // this method needs to be invoked when show is called to refresh mediation ordinal
    public static updateMediationMetaData(nativeBridge: NativeBridge): Promise<void> {
        const metaDataUtility: MetaData = new MetaData(nativeBridge);
        let mediationObject: MediationMetaData;

        return MetaDataManager.fetchMediationMetaData(nativeBridge, true).then(result => {
            mediationObject = result;
            return metaDataUtility.get(MediationMetaData.getCategory() + '.' + MediationMetaData.getOrdinalKey(), true);
        }).then(([found, value]) => {
            if(found) {
                mediationObject.setOrdinal(parseInt(<string>value, 10));
            }
            return;
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
        if (!data.length) {
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

    private static caches: IMetaDataCaches = {
        framework: undefined,
        adapter: undefined,
        mediation: undefined,
        player: undefined,
    };

}
