import { NativeBridge } from 'NativeBridge';
import { Session } from 'Models/Session';
import { StorageManager, StorageType } from 'Managers/StorageManager';

export enum SessionEventType {
    OPERATIVE,
    ANALYTICAL
}

export class SessionManager {

    private _nativeBridge: NativeBridge;
    private _currentSession: Session;

    private _storageManager: StorageManager;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._storageManager = new StorageManager(nativeBridge);
    }

    public create(): Promise<void> {
        return this._storageManager.read(StorageType.PUBLIC).then(() => {
            return this._storageManager.get(StorageType.PUBLIC, 'session_start');
        }).then(([sessionStart]) => {
            console.log(sessionStart);
            return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
                this._currentSession = new Session(id);
            });
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public trigger(type: SessionEventType, ...parameters: any[]): void {
        return;
    }

}