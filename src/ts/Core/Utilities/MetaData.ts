import { StorageError, StorageType } from 'Core/Native/Storage';
import { Core, ICoreApi } from '../Core';

export class MetaData {
    private _core: ICoreApi;

    constructor(core: ICoreApi) {
        this._core = core;
    }

    public get<T>(key: string, deleteValue: boolean) {
        return this._core.Storage.get<T>(StorageType.PUBLIC, key + '.value').then((value: T) => {
            if(deleteValue) {
                this._core.Storage.delete(StorageType.PUBLIC, key);
                this._core.Storage.write(StorageType.PUBLIC);
            }
            return Promise.resolve([true, value]);
        }).catch(([error]) => {
            switch(error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    // it is normal that a value is not found
                    return Promise.resolve([false, null]);

                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return Promise.resolve([false, null]);

                default:
                    throw new Error(error);
            }
        });
    }

    public getKeys(category: string): Promise<string[]> {
        return this._core.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
            return results;
        }).catch(([error]) => {
            switch(error) {
                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return [];

                default:
                    throw new Error(error);
            }
        });
    }

    public hasCategory(category: string): Promise<boolean> {
        return this._core.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
            return results.length > 0;
        }).catch(([error]) => {
            switch(error) {
                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return false;

                default:
                    throw new Error(error);
            }
        });
    }
}
