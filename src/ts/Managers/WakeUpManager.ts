import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

export class WakeUpManager {
    private static _appForegroundNotification: string = 'UIApplicationDidBecomeActiveNotification';

    public onNetworkConnected: Observable0 = new Observable0();
    public onScreenOn: Observable0 = new Observable0();
    public onScreenOff: Observable0 = new Observable0();
    public onAppForeground: Observable0 = new Observable0();

    private _nativeBridge: NativeBridge;
    private _lastConnected: number;

    private _screenListener: string = 'screenListener';
    private ACTION_SCREEN_ON: string = 'android.intent.action.SCREEN_ON';
    private ACTION_SCREEN_OFF: string = 'android.intent.action.SCREEN_OFF';

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._lastConnected = Date.now();
        this._nativeBridge.Connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
        this._nativeBridge.Broadcast.onBroadcastAction.subscribe((name, action, data, extra) => this.onBroadcastAction(name, action, data, extra));
        this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
    }

    public setListenConnectivity(status: boolean): Promise<void> {
        return this._nativeBridge.Connectivity.setListeningStatus(status);
    }

    public setListenScreen(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Broadcast.addBroadcastListener(this._screenListener, [this.ACTION_SCREEN_ON, this.ACTION_SCREEN_OFF]);
        } else {
            return this._nativeBridge.Broadcast.removeBroadcastListener(this._screenListener);
        }
    }

    public setListenAppForeground(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Notification.addNotificationObserver(WakeUpManager._appForegroundNotification, []);
        } else {
            return this._nativeBridge.Notification.removeNotificationObserver(WakeUpManager._appForegroundNotification);
        }
    }

    private onConnected(wifi: boolean, networkType: number) {
        const fifteenMinutes: number = 15 * 60 * 1000;

        if(this._lastConnected + fifteenMinutes < Date.now()) {
            this._lastConnected = Date.now();
            this.onNetworkConnected.trigger();
        }
    }

    private onBroadcastAction(name: string, action: string, data: string, extra: any) {
        if(name !== this._screenListener) {
            return;
        }

        switch(action) {
            case this.ACTION_SCREEN_ON:
                this.onScreenOn.trigger();
                break;

            case this.ACTION_SCREEN_OFF:
                this.onScreenOff.trigger();
                break;

            default:
                break;
        }
    }

    private onNotification(event: string, parameters: any): void {
        if(event === WakeUpManager._appForegroundNotification) {
            this.onAppForeground.trigger();
        }
    }
}