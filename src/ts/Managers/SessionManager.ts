import { NativeBridge } from 'NativeBridge';
import { Session } from 'Models/Session';

export enum SessionEventType {
    OPERATIVE,
    ANALYTICAL
}

export class SessionManager {

    private _nativeBridge: NativeBridge;
    private _currentSession: Session;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public create(): Promise<void> {
        return this._nativeBridge.invoke('DeviceInfo', 'getUniqueEventId').then(([id]) => {
            this._currentSession = new Session(id);
        });
    }

    public getSession(): Session {
        return this._currentSession;
    }

    public trigger(type: SessionEventType, ...parameters: any[]): void {
        return;
    }

}