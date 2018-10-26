import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';

export const AdUnitActivities = ['com.unity3d.ads.adunit.AdUnitActivity', 'com.unity3d.ads.adunit.AdUnitTransparentActivity', 'com.unity3d.ads.adunit.AdUnitTransparentSoftwareActivity', 'com.unity3d.ads.adunit.AdUnitSoftwareActivity'];

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

    private readonly _core: ICoreApi;

    private _appForeground: boolean;
    private _topActivity?: string;
    private _screenListener: string = 'screenListener';
    private ACTION_SCREEN_ON: string = 'android.intent.action.SCREEN_ON';
    private ACTION_SCREEN_OFF: string = 'android.intent.action.SCREEN_OFF';

    constructor(platform: Platform, core: ICoreApi) {
        this._appForeground = true;
        this._core = core;
        if(platform === Platform.ANDROID) {
            core.Android!.Broadcast.onBroadcastAction.subscribe((name, action, data, extra) => this.onBroadcastAction(name, action, data, extra));
            core.Android!.Lifecycle.onActivityResumed.subscribe((activity) => this.onResume(activity));
            core.Android!.Lifecycle.onActivityPaused.subscribe((activity) => this.onPause(activity));
            core.Android!.Lifecycle.onActivityDestroyed.subscribe((activity) => this.onDestroyed(activity));
        } else {
            core.iOS!.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        }
    }

    public setListenAppForeground(status: boolean) {
        if(status) {
            return this._core.iOS!.Notification.addNotificationObserver(FocusManager._appForegroundNotification, []);
        } else {
            return this._core.iOS!.Notification.removeNotificationObserver(FocusManager._appForegroundNotification);
        }
    }

    public setListenAppBackground(status: boolean): Promise<void> {
        if(status) {
            return this._core.iOS!.Notification.addNotificationObserver(FocusManager._appBackgroundNotification, []);
        } else {
            return this._core.iOS!.Notification.removeNotificationObserver(FocusManager._appBackgroundNotification);
        }
    }

    public setListenAndroidLifecycle(status: boolean): Promise<void> {
        if(status) {
            return this._core.Android!.Lifecycle.register(['onActivityResumed', 'onActivityPaused']);
        } else {
            return this._core.Android!.Lifecycle.unregister();
        }
    }

    public setListenScreen(status: boolean): Promise<void> {
        if(status) {
            return this._core.Android!.Broadcast.addBroadcastListener(this._screenListener, [this.ACTION_SCREEN_ON, this.ACTION_SCREEN_OFF]);
        } else {
            return this._core.Android!.Broadcast.removeBroadcastListener(this._screenListener);
        }
    }

    public isAppForeground(): boolean {
        return this._appForeground;
    }

    private onNotification(event: string, parameters: any): void {
        if(event === FocusManager._appForegroundNotification) {
            this._appForeground = true;
            this.onAppForeground.trigger();
        } else if(event === FocusManager._appBackgroundNotification) {
            this._appForeground = false;
            this.onAppBackground.trigger();
        }
    }

    private onResume(activity: string) {
        this._appForeground = true;
        this._topActivity = activity;
        this.onActivityResumed.trigger(activity);
    }

    private onPause(activity: string) {
        if(!this._topActivity || activity === this._topActivity) {
            this._appForeground = false;
            delete this._topActivity;
        }
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
        }
    }
}
