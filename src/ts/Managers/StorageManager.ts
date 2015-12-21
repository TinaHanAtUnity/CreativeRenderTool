import { NativeBridge } from 'NativeBridge';

export enum StorageType {
    PUBLIC,
    PRIVATE
}

export class StorageManager {

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public read(type: StorageType): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'read', [StorageType[type]]);
    }

    public get(type: StorageType, key: string): Promise<any[]> {
        return this._nativeBridge.invoke('Storage', 'get', [StorageType[type], key]);
    }

}