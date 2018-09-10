import { FocusManager } from 'Core/Managers/FocusManager';
import { ConnectivityApi } from 'Core/Native/Connectivity';
import { Logger } from 'Core/Utilities/Logger';
import { Observable0 } from 'Core/Utilities/Observable';

export class WakeUpManager {
    public readonly onNetworkConnected = new Observable0();

    private _connectivity: ConnectivityApi;
    private _focusManager: FocusManager;
    private _firstConnection: number;
    private _connectionEvents: number;

    constructor(connectivity: ConnectivityApi, focusManager: FocusManager) {
        this._connectivity = connectivity;
        this._focusManager = focusManager;
        this._firstConnection = Date.now();
        this._connectionEvents = 0;
        this._connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
    }

    public setListenConnectivity(status: boolean): Promise<void> {
        return this._connectivity.setListeningStatus(status);
    }

    private onConnected(wifi: boolean, networkType: number) {
        const thirtyMinutes: number = 30 * 60 * 1000;

        if(this._firstConnection + thirtyMinutes < Date.now()) {
            this._firstConnection = Date.now();
            this._connectionEvents = 0;
            this.onNetworkConnected.trigger();
        } else {
            this._connectionEvents++;
            // allow max 10 connection events in 30 minutes
            if(this._connectionEvents <= 10) {
                this.onNetworkConnected.trigger();
            } else if(this._connectionEvents === 11) {
                Logger.Warning('Unity Ads has received more than 10 connection events in 30 minutes, now ignoring connection events');
            }
        }
    }
}
