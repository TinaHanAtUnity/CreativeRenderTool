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

    public createForceQuitKey(data: IForceQuitData): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey, data).then(() => {
           return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public getForceQuitData(): Promise<IForceQuitData | undefined> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, ForceQuitManager.ForceQuitKey).then(data => {
            return Promise.resolve(<IForceQuitData>data);
        }).catch(() => {
            return Promise.resolve(undefined);
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
