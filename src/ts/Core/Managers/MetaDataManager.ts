import { ICoreApi } from 'Core/ICore';
import { BaseMetaData } from 'Core/Models/MetaData/BaseMetaData';

export class MetaDataManager {
    private _metaDataCache: { [key: string]: any } = {};
    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
    }

    public fetch<T extends BaseMetaData>(MetaDataConstructor: { new(): T}, cache: boolean = true, keys?: string[]): Promise<T | undefined> {
        let metaData: T = new MetaDataConstructor();

        if (this._metaDataCache[metaData.getCategory()]) {
            metaData = this._metaDataCache[metaData.getCategory()];
            if(!keys) {
                return Promise.resolve(metaData);
            }
        }

        return metaData.fetch(this._core, keys).then((success) => {
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
        if(category) {
            if(this._metaDataCache[category]) {
                this._metaDataCache[category] = undefined;
            }
            return;
        }
        this._metaDataCache = {};
    }
}
