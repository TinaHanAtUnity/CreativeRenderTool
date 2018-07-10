import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable2 } from 'Utilities/Observable';

export enum StorageType {
    PRIVATE,
    PUBLIC
}

export enum StorageError {
    COULDNT_SET_VALUE,
    COULDNT_GET_VALUE,
    COULDNT_WRITE_STORAGE_TO_CACHE,
    COULDNT_CLEAR_STORAGE,
    COULDNT_GET_STORAGE,
    COULDNT_DELETE_VALUE
}

export enum StorageEvent {
    SET
}

export class StorageApi extends NativeApi {
    public onSet: Observable2<string, object> = new Observable2();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Storage');
    }

    public read(type: StorageType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'read', [StorageType[type]]);
    }

    public write(type: StorageType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'write', [StorageType[type]]);
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        return this._nativeBridge.invoke<T>(this._apiClass, 'get', [StorageType[type], key]);
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'set', [StorageType[type], key, value]);
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'delete', [StorageType[type], key]);
    }

    public clear(type: StorageType): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'clear', [StorageType[type]]);
    }

    public getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getKeys', [StorageType[type], key, recursive]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case StorageEvent[StorageEvent.SET]:
                this.onSet.trigger(parameters[0], parameters[1]);
                break;

            default:
        }
    }
}
