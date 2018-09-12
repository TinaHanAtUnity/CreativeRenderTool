import { Logger } from 'Core/Utilities/Logger';
import { Observable0 } from 'Core/Utilities/Observable';
import { Core } from 'Core/Core';

export class WakeUpManager {
    public readonly onNetworkConnected = new Observable0();

    private _core: Core;
    private _firstConnection: number;
    private _connectionEvents: number;

    constructor(core: Core) {
        this._core = core;
        this._firstConnection = Date.now();
        this._connectionEvents = 0;
        this._core.Api.Connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
    }

    public setListenConnectivity(status: boolean): Promise<void> {
        return this._core.Api.Connectivity.setListeningStatus(status);
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
