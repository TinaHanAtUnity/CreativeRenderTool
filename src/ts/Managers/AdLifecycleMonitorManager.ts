import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Native/Backend/Api/DeviceInfo';
import { StorageType } from 'Native/Api/Storage';
import { Session } from 'Models/Session';
import { Configuration } from 'Models/Configuration';
import { ClientInfo } from 'Models/ClientInfo';

export interface IAdLifecycleLog {
    adSession: Session;
}

export class AdLifecycleMonitorManager {

    private static AdLifecycleTerminatedStorageKey = 'adlifecycle.terminated';

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    public createAdLifecycleLog(adLog: IAdLifecycleLog): Promise<void> {
        const adLifecycleLog = adLog;

        return this._nativeBridge.Storage.set(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey, adLifecycleLog).then(() => {
           return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public hasAdLifecycleLog(): Promise<boolean> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey).then((data: any) => {
            return Promise.resolve(typeof(data) !== 'undefined');
        }).catch(() => {
            return Promise.resolve(false);
        });
    }

    public getAdLifecycleLog(): Promise<IAdLifecycleLog> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey).then((data: any) => {
            return Promise.resolve(data);
        });
    }

    public destroyAdLifecyleLog(): Promise<boolean> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey).then(() => {
            return Promise.resolve(true);
        }).catch(() => {
            return Promise.resolve(false);
        });
    }

    private onStorageSet(eventType: string, data: any) {
        // what will do on storage set?
    }
}
