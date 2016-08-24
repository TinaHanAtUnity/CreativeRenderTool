import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageError } from 'Native/Api/Storage';

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
        }).catch(([error]) => {
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
}