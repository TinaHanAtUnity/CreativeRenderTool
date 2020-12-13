import { Platform } from 'Core/Constants/Platform';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';
export const AdUnitActivities = ['com.unity3d.ads.adunit.AdUnitActivity', 'com.unity3d.ads.adunit.AdUnitTransparentActivity', 'com.unity3d.ads.adunit.AdUnitTransparentSoftwareActivity', 'com.unity3d.ads.adunit.AdUnitSoftwareActivity'];
export class FocusManager {
    constructor(platform, core) {
        this.onAppForeground = new Observable0();
        this.onAppBackground = new Observable0();
        this.onActivityResumed = new Observable1();
        this.onActivityPaused = new Observable1();
        this.onActivityDestroyed = new Observable1();
        this.onScreenOn = new Observable0();
        this._screenListener = 'screenListener';
        this.ACTION_SCREEN_ON = 'android.intent.action.SCREEN_ON';
        this._appForeground = true;
        this._core = core;
        if (platform === Platform.ANDROID) {
            core.Android.Broadcast.onBroadcastAction.subscribe((name, action, data, extra) => this.onBroadcastAction(name, action, data, extra));
            core.Android.Lifecycle.onActivityResumed.subscribe((activity) => this.onResume(activity));
            core.Android.Lifecycle.onActivityPaused.subscribe((activity) => this.onPause(activity));
            core.Android.Lifecycle.onActivityDestroyed.subscribe((activity) => this.onDestroyed(activity));
        }
        else {
            core.iOS.Notification.onNotification.subscribe((event, parameters) => this.onNotification(event, parameters));
        }
    }
    setListenAppForeground(status) {
        if (status) {
            return this._core.iOS.Notification.addNotificationObserver(FocusManager._appForegroundNotification, []);
        }
        else {
            return this._core.iOS.Notification.removeNotificationObserver(FocusManager._appForegroundNotification);
        }
    }
    setListenAppBackground(status) {
        if (status) {
            return this._core.iOS.Notification.addNotificationObserver(FocusManager._appBackgroundNotification, []);
        }
        else {
            return this._core.iOS.Notification.removeNotificationObserver(FocusManager._appBackgroundNotification);
        }
    }
    setListenAndroidLifecycle(status) {
        if (status) {
            return this._core.Android.Lifecycle.register(['onActivityResumed', 'onActivityPaused']);
        }
        else {
            return this._core.Android.Lifecycle.unregister();
        }
    }
    setListenScreen(status) {
        if (status) {
            return this._core.Android.Broadcast.addBroadcastListener(this._screenListener, [this.ACTION_SCREEN_ON]);
        }
        else {
            return this._core.Android.Broadcast.removeBroadcastListener(this._screenListener);
        }
    }
    isAppForeground() {
        return this._appForeground;
    }
    onNotification(event, parameters) {
        if (event === FocusManager._appForegroundNotification) {
            this._appForeground = true;
            this.onAppForeground.trigger();
        }
        else if (event === FocusManager._appBackgroundNotification) {
            this._appForeground = false;
            this.onAppBackground.trigger();
        }
    }
    onResume(activity) {
        this._appForeground = true;
        this._topActivity = activity;
        this.onActivityResumed.trigger(activity);
    }
    onPause(activity) {
        if (!this._topActivity || activity === this._topActivity) {
            this._appForeground = false;
            delete this._topActivity;
        }
        this.onActivityPaused.trigger(activity);
    }
    onDestroyed(activity) {
        this.onActivityDestroyed.trigger(activity);
    }
    onBroadcastAction(name, action, data, extra) {
        if (name !== this._screenListener) {
            return;
        }
        switch (action) {
            case this.ACTION_SCREEN_ON:
                this.onScreenOn.trigger();
                break;
            default:
        }
    }
}
FocusManager._appForegroundNotification = 'UIApplicationDidBecomeActiveNotification';
FocusManager._appBackgroundNotification = 'UIApplicationWillResignActiveNotification';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9jdXNNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTWFuYWdlcnMvRm9jdXNNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXJFLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsdUNBQXVDLEVBQUUsa0RBQWtELEVBQUUsMERBQTBELEVBQUUsK0NBQStDLENBQUMsQ0FBQztBQUUzTyxNQUFNLE9BQU8sWUFBWTtJQW1CckIsWUFBWSxRQUFrQixFQUFFLElBQWM7UUFkOUIsb0JBQWUsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3BDLG9CQUFlLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNwQyxzQkFBaUIsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQzlDLHFCQUFnQixHQUFHLElBQUksV0FBVyxFQUFVLENBQUM7UUFDN0Msd0JBQW1CLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUNoRCxlQUFVLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQU12QyxvQkFBZSxHQUFXLGdCQUFnQixDQUFDO1FBQzNDLHFCQUFnQixHQUFXLGlDQUFpQyxDQUFDO1FBR2pFLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksUUFBUSxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDL0IsSUFBSSxDQUFDLE9BQVEsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJB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