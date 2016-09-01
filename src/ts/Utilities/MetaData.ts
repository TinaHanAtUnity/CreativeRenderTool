import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageError } from 'Native/Api/Storage';
import { Platform } from 'Constants/Platform';

export class MetaData {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public get<T>(key: string, deleteValue: boolean): Promise<[boolean, T]> {
        return this._nativeBridge.Storage.get<T>(StorageType.PUBLIC, key + '.value').then((value: T) => {
            if(value && deleteValue) {
                this._nativeBridge.Storage.delete(StorageType.PUBLIC, key);
                this._nativeBridge.Storage.write(StorageType.PUBLIC);
            }

            return [true, value];
        }).catch(error => {
            // hack to work around API differences
            // android returns error and key, ios returns only error
            if(this._nativeBridge.getPlatform() !== Platform.IOS) {
                error = error[0];
            }

            switch(error) {
                case StorageError[StorageError.COULDNT_GET_VALUE]:
                    // it is normal that a value is not found
                    return [false, <T>null];

                case StorageError[StorageError.COULDNT_GET_STORAGE]:
                    // it is normal that public metadata storage might not exist
                    return [false, <T>null];

                default:
                    throw new Error(error);
            }
        });
    }

    public hasCategory(category: string): Promise<boolean> {
        return this._nativeBridge.Storage.getKeys(StorageType.PUBLIC, category, false).then(results => {
            return results.length > 0;
        }).catch(error => {
            // hack to work around API differences
            // android returns error, storage type and key, ios returns only error
            if(this._nativeBridge.getPlatform() !== Platform.IOS) {
                error = error[0];
            }

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