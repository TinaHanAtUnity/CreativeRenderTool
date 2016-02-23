import { NativeBridge } from 'NativeBridge';

export enum StorageType {
    PRIVATE,
    PUBLIC
}

export class StorageManager {

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public read(type: StorageType): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'read', [StorageType[type]]);
    }

    public write(type: StorageType): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'write', [StorageType[type]]);
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        return this._nativeBridge.invoke('Storage', 'get', [StorageType[type], key]).then(([value]) => {
            return value;
        });
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'set', [StorageType[type], key, value]);
    }

    public delete(type: StorageType, key: string): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'delete', [StorageType[type], key]);
    }

    public clear(type: StorageType): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'clear', [StorageType[type]]);
    }

}