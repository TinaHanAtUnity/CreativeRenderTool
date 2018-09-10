import { StorageApi, StorageError, StorageType } from 'Core/Native/Storage';

export class MetaData {
    private _storage: StorageApi;

    constructor(storage: StorageApi) {
        this._storage = storage;
    }

    public get<T>(key: string, deleteValue: boolean) {
        return this._storage.get<T>(StorageType.PUBLIC, key + '.value').then((value: T) => {
            if(deleteValue) {
                this._storage.delete(StorageType.PUBLIC, key);
                this._storage.write(StorageType.PUBLIC);
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
        return this._storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
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
        return this._storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
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
