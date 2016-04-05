import { Observable } from 'Utilities/Observable';
import { NativeBridge } from 'NativeBridge';

export class ConnectivityManager extends Observable {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        super();
        this._nativeBridge = nativeBridge;
        this._nativeBridge.subscribe('CONNECTIVITY_CONNECTED', (wifi, networkType) => { this.onConnected(wifi, networkType); });
    }

    public setListeningStatus(status: boolean) {
        this._nativeBridge.invoke('DeviceInfo', 'setConnectionMonitoring', [status]);
    }

    private onConnected(wifi: boolean, networkType: number): void {
        this.trigger('connected', wifi, networkType);
    }
}