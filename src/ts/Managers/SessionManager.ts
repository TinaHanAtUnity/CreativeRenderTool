import { NativeBridge } from 'NativeBridge';
import { Session } from 'Models/Session';
import { Request } from 'Utilities/Request';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';

export enum SessionEventType {
    OPERATIVE,
    ANALYTICAL
}

export class SessionManager {

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    private _currentSession: Session;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
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