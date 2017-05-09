import { Observable0, Observable1 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

export class WakeUpManager {

    private static _appForegroundNotification: string = 'UIApplicationDidBecomeActiveNotification';
    private static _appBackgroundNotification: string = 'UIApplicationWillResignActiveNotification';

    public readonly onNetworkConnected = new Observable0();
    public readonly onScreenOn = new Observable0();
    public readonly onScreenOff = new Observable0();
    public readonly onAppForeground = new Observable0();
    public readonly onAppBackground = new Observable0();
    public readonly onActivityResumed = new Observable1<string>();
    public readonly onActivityPaused = new Observable1<string>();

    private _nativeBridge: NativeBridge;
    private _firstConnection: number;
    private _connectionEvents: number;

    private _screenListener: string = 'screenListener';
    private ACTION_SCREEN_ON: string = 'android.intent.action.SCREEN_ON';
    private ACTION_SCREEN_OFF: string = 'android.intent.action.SCREEN_OFF';

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._firstConnection = Date.now();
        this._connectionEvents = 0;
        this._nativeBridge.Connectivity.onConnected.subscribe((wifi, networkType) => this.onConnected(wifi, networkType));
        this._nativeBridge.Broadcast.onBroadcastAction.subscribe((name, action, data, extra) => this.onBroadcastAction(name, action, data, extra));
        this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        this._nativeBridge.Lifecycle.onActivityResumed.subscribe((activity) => this.onResume(activity));
        this._nativeBridge.Lifecycle.onActivityPaused.subscribe((activity) => this.onPause(activity));
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

    public setListenAppBackground(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Notification.addNotificationObserver(WakeUpManager._appBackgroundNotification, []);
        } else {
            return this._nativeBridge.Notification.removeNotificationObserver(WakeUpManager._appBackgroundNotification);
        }
    }

    public setListenAndroidLifecycle(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Lifecycle.register(['onActivityResumed', 'onActivityPaused']);
        } else {
            return this._nativeBridge.Lifecycle.unregister();
        }
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
                this._nativeBridge.Sdk.logWarning('Unity Ads has received more than 10 connection events in 30 minutes, now ignoring connection events');
            }
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
        } else if(event === WakeUpManager._appBackgroundNotification) {
            this.onAppBackground.trigger();
        }
    }

    private onResume(activity: string) {
        this.onActivityResumed.trigger(activity);
    }

    private onPause(activity: string) {
        this.onActivityPaused.trigger(activity);
    }
}
