import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageError } from 'Native/Api/Storage';

export class MetaData {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public get<T>(key: string, deleteValue: boolean): Promise<[boolean, T | null]> {
        return this._nativeBridge.Storage.get<T>(StorageType.PUBLIC, key + '.value').then((value: T): Promise<[boolean, T | null]> => {
            if(value && deleteValue) {
                this._nativeBridge.Storage.delete(StorageType.PUBLIC, key);
                this._nativeBridge.Storage.write(StorageType.PUBLIC);
            }
            return Promise.resolve<[boolean, T]>([true, value]);
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

    public hasCategory(category: string): Promise<boolean> {
        return this._nativeBridge.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
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
