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
    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;
    private _configuration: Configuration;
    private _request: Request;

    constructor(nativeBridge: NativeBridge, configuration: Configuration, deviceInfo: DeviceInfo, clientInfo: ClientInfo, request: Request) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._deviceInfo = deviceInfo;
        this._clientInfo = clientInfo;
        this._request = request;

        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));
    }

    public createAdLifecycleLog(session: Session): Promise<void> {
        const adLifecycleLog = {
            adSession: session
        };

        return this._nativeBridge.Storage.set(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey, adLifecycleLog).then(() => {
           return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        });
    }

    public hasAdLifecycleLog(): Promise<boolean> {
        return this._nativeBridge.Storage.get(StorageType.PRIVATE, AdLifecycleMonitorManager.AdLifecycleTerminatedStorageKey).then((data: any) => {
            return Promise.resolve(typeof(data) !== 'undefined');
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