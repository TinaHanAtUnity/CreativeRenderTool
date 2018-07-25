import { Session } from 'Models/Session';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

export interface IForceQuitData {
    adSession: Session;
}

export class ForceQuitManager {

    private static ForceQuitKey = 'ad.forcequit';
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public createForceQuitKey(adLog: IForceQuitData): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey, adLog).then(() => {
           return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public hasForceQuit(): Promise<boolean> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(data => {
            return Promise.resolve(typeof(data) !== 'undefined');
        }).catch(() => {
            return Promise.resolve(false);
        });
    }

    public getForceQuitStatus(): Promise<IForceQuitData> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(data => {
            return Promise.resolve(<IForceQuitData>data);
        });
    }

    public destroyForceQuitKey(): Promise<boolean> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(() => {
            return Promise.resolve(true);
        }).catch(() => {
            return Promise.resolve(false);
        });
    }
}
