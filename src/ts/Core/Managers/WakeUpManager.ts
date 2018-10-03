import { Observable0 } from 'Core/Utilities/Observable';
import { ICoreApi } from 'Core/Core';

export class WakeUpManager {
    public readonly onNetworkConnected = new Observable0();

    private _core: ICoreApi;
    private _firstConnection: number;
    private _connectionEvents: number;

    constructor(core: ICoreApi) {
        this._core = core;
        this._firstConnection = Date.now();
        this._connectionEvents = 0;
        this._core.Connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
    }

    public setListenConnectivity(status: boolean): Promise<void> {
        return this._core.Connectivity.setListeningStatus(status);
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
                this._core.Sdk.logWarning('Unity Ads has received more than 10 connection events in 30 minutes, now ignoring connection events');
            }
        }
    }
}
