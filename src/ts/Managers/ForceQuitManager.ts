import { Session } from 'Models/Session';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

export interface IForceQuitData {
    adSessionId: string;
}

export class ForceQuitManager {

    private static ForceQuitKey = 'ForceQuitManager.ForceQuitKey';
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public createForceQuitKey(data: IForceQuitData): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey, data).then(() => {
           return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public getForceQuitData(): Promise<Session | undefined> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(data => {
            return new Session((<IForceQuitData>data).adSessionId);
        }).catch(() => {
            return undefined;
        });
    }

    public destroyForceQuitKey(): Promise<boolean> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(() => {
            return true;
        }).catch(() => {
            return false;
        });
    }
}
