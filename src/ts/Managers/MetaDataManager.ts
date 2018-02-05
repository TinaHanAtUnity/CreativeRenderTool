import { NativeBridge } from 'Native/NativeBridge';
import { BaseMetaData } from 'Models/MetaData/BaseMetaData';

export class MetaDataManager {
    private _metaDataCache: { [key: string]: any } = {};
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public fetch<T extends BaseMetaData>(MetaDataConstructor: { new(): T; }, cache: boolean = true, keys?: string[]): Promise<T | undefined> {
        let metaData: T = new MetaDataConstructor();

        if (this._metaDataCache[metaData.getCategory()]) {
            metaData = this._metaDataCache[metaData.getCategory()];
            if(!keys) {
                return Promise.resolve(metaData);
            }
        }

        return metaData.fetch(this._nativeBridge, keys).then((success) => {
            if (success) {
                if(cache) {
                    this._metaDataCache[metaData.getCategory()] = metaData;
                }
                return metaData;
            }
            return undefined;
        });
    }

    public clearCache(category?: string): void {
        if(category && this._metaDataCache[category]) {
            this._metaDataCache[category] = undefined;
            return;
        }
        this._metaDataCache = {};
    }
}
