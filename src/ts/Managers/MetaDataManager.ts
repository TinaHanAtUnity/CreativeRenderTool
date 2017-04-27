import { NativeBridge } from 'Native/NativeBridge';
import { FrameworkMetaData } from 'Models/MetaData/FrameworkMetaData';
import { AdapterMetaData } from 'Models/MetaData/AdapterMetaData';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';
import { PlayerMetaData } from 'Models/MetaData/PlayerMetaData';

export class MetaDataManager {

    public static getValues(category: string, keys: string[], nativeBridge: NativeBridge) {
        return Promise.resolve([]);
    }

    public static fetchFrameworkMetaData(nativeBridge: NativeBridge, cache = true): Promise<FrameworkMetaData> {
        return Promise.resolve(<FrameworkMetaData>{});
    }

    public static fetchAdapterMetaData(nativeBridge: NativeBridge, cache = true): Promise<AdapterMetaData> {
        return Promise.resolve(<AdapterMetaData>{});
    }

    // this method is for getting metadata object but it does not update the ordinal
    public static fetchMediationMetaData(nativeBridge: NativeBridge, cache = true): Promise<MediationMetaData> {
        return Promise.resolve(<MediationMetaData>{});
    }

    // this method needs to be invoked when show is called to refresh mediation ordinal
    public static updateMediationMetaData(nativeBridge: NativeBridge): Promise<void> {
        return Promise.resolve();
    }

    public static fetchPlayerMetaData(nativeBridge: NativeBridge): Promise<PlayerMetaData> {
        return Promise.resolve(<PlayerMetaData>{});
    }

    public static fetch(category: string, keys: string[], nativeBridge: NativeBridge, cache = true): Promise<void> {
        return Promise.resolve(undefined);
    }

    public static createAndCache(category: string, data: string[], cache = true) {
        return undefined;
    }

    public static createByCategory(category: string, data: string[]): undefined {
        return undefined;
    }

    public static clearCaches() {
    }
}
