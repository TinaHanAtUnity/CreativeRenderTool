import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

export enum StorageType {
    PRIVATE,
    PUBLIC
}

export class StorageApi extends NativeApi {

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

}
