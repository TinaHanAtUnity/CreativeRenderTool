import { Observable0, Observable1 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

export class FocusManager {
    private static _appForegroundNotification: string = 'UIApplicationDidBecomeActiveNotification';
    private static _appBackgroundNotification: string = 'UIApplicationWillResignActiveNotification';

    public readonly onAppForeground = new Observable0();
    public readonly onAppBackground = new Observable0();
    public readonly onActivityResumed = new Observable1<string>();
    public readonly onActivityPaused = new Observable1<string>();
    public readonly onActivityDestroyed = new Observable1<string>();
    public readonly onScreenOn = new Observable0();
    public readonly onScreenOff = new Observable0();

    private _nativeBridge: NativeBridge;
    private _screenListener: string = 'screenListener';
    private ACTION_SCREEN_ON: string = 'android.intent.action.SCREEN_ON';
    private ACTION_SCREEN_OFF: string = 'android.intent.action.SCREEN_OFF';

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Broadcast.onBroadcastAction.subscribe((name, action, data, extra) => this.onBroadcastAction(name, action, data, extra));
        this._nativeBridge.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        this._nativeBridge.Lifecycle.onActivityResumed.subscribe((activity) => this.onResume(activity));
        this._nativeBridge.Lifecycle.onActivityPaused.subscribe((activity) => this.onPause(activity));
        this._nativeBridge.Lifecycle.onActivityDestroyed.subscribe((activity) => this.onDestroyed(activity));
    }

    public setListenAppForeground(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Notification.addNotificationObserver(FocusManager._appForegroundNotification, []);
        } else {
            return this._nativeBridge.Notification.removeNotificationObserver(FocusManager._appForegroundNotification);
        }
    }

    public setListenAppBackground(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Notification.addNotificationObserver(FocusManager._appBackgroundNotification, []);
        } else {
            return this._nativeBridge.Notification.removeNotificationObserver(FocusManager._appBackgroundNotification);
        }
    }

    public setListenAndroidLifecycle(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Lifecycle.register(['onActivityResumed', 'onActivityPaused']);
        } else {
            return this._nativeBridge.Lifecycle.unregister();
        }
    }

    public setListenScreen(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.Broadcast.addBroadcastListener(this._screenListener, [this.ACTION_SCREEN_ON, this.ACTION_SCREEN_OFF]);
        } else {
            return this._nativeBridge.Broadcast.removeBroadcastListener(this._screenListener);
        }
    }

    private onNotification(event: string, parameters: any): void {
        if(event === FocusManager._appForegroundNotification) {
            this.onAppForeground.trigger();
        } else if(event === FocusManager._appBackgroundNotification) {
            this.onAppBackground.trigger();
        }
    }

    private onResume(activity: string) {
        this.onActivityResumed.trigger(activity);
    }

    private onPause(activity: string) {
        this.onActivityPaused.trigger(activity);
    }

    private onDestroyed(activity: string) {
        this.onActivityDestroyed.trigger(activity);
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
}
