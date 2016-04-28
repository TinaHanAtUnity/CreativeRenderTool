import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

export class WakeUpManager {
    public onNetworkWakeUp: Observable0 = new Observable0();

    private _nativeBridge: NativeBridge;
    private _lastConnected: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public initialize(): Promise<void> {
        this._lastConnected = Date.now();
        this._nativeBridge.Connectivity.onConnected.subscribe(this.onConnected.bind(this));

        return this._nativeBridge.Connectivity.setListeningStatus(true);
    }

    private onConnected(wifi: boolean, networkType: number) {
        let fifteenMinutes: number = 15 * 60 * 1000;

        if(this._lastConnected + fifteenMinutes < Date.now()) {
            this._lastConnected = Date.now();
            this.onNetworkWakeUp.trigger();
        }
    }
}