import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { BroadcastApi } from 'Core/Native/Android/Broadcast';
import { LifecycleApi } from 'Core/Native/Android/Lifecycle';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ConnectivityApi } from 'Core/Native/Connectivity';
import { NotificationApi } from 'Core/Native/iOS/Notification';
import 'mocha';
import * as sinon from 'sinon';

class TestConnectivityApi extends ConnectivityApi {
    public setListeningStatus(status: boolean): Promise<void> {
        return Promise.resolve(void(0));
    }
}

class TestBroadcastApi extends BroadcastApi {
    public addBroadcastListener(listenerName: string, actions: string[]): Promise<void> {
        return Promise.resolve(void(0));
    }

    public removeBroadcastListener(listenerName: string): Promise<void> {
        return Promise.resolve(void(0));
    }
}

class TestNotificationApi extends NotificationApi {
    public addNotificationObserver(name: string, keys: string[]): Promise<void> {
        return Promise.resolve(void(0));
    }

    public removeNotificationObserver(name: string): Promise<void> {
        return Promise.resolve(void(0));
    }
}

class TestLifecycleApi extends LifecycleApi {
    public register(events: string[]): Promise<void> {
        return Promise.resolve(void(0));
    }

    public unregister(): Promise<void> {
        return Promise.resolve(void(0));
    }
}

describe('FocusManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;
    let focusManager: FocusManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
        nativeBridge.Connectivity = new TestConnectivityApi(nativeBridge);
        nativeBridge.Broadcast = new TestBroadcastApi(nativeBridge);
        nativeBridge.Notification = new TestNotificationApi(nativeBridge);
        nativeBridge.Lifecycle = new TestLifecycleApi(nativeBridge);

        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
    });

    it('should start listening to screen broadcasts', () => {
        const spy = sinon.spy(nativeBridge.Broadcast, 'addBroadcastListener');
        return focusManager.setListenScreen(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
        });
    });

    it('should stop listening to screen broadcasts', () => {
        const spy = sinon.spy(nativeBridge.Broadcast, 'removeBroadcastListener');
        return focusManager.setListenScreen(false).then(() => {
            sinon.assert.calledOnce(spy);
        });
    });

    it('should start listening to app foreground events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
        return focusManager.setListenAppForeground(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
            assert.deepEqual(spy.getCall(0).args[1], []);
        });
    });

    it('should stop listening to app foreground events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
        return focusManager.setListenAppForeground(false).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
        });
    });

    it('should start listening to app background events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
        return focusManager.setListenAppBackground(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
            assert.deepEqual(spy.getCall(0).args[1], []);
        });
    });

    it('should stop listening to app background events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
        return focusManager.setListenAppBackground(false).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
        });
    });

    it('should start listening to Android lifecycle events', () => {
        const spy = sinon.spy(nativeBridge.Lifecycle, 'register');
        return focusManager.setListenAndroidLifecycle(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], ['onActivityResumed', 'onActivityPaused']);
        });
    });

    it('should stop listening to Android lifecycle events', () => {
        const spy = sinon.spy(nativeBridge.Lifecycle, 'unregister');
        return focusManager.setListenAndroidLifecycle(false).then(() => {
            sinon.assert.calledOnce(spy);
        });
    });

    it('should trigger onNetworkConnected', () => {
        const spy = sinon.spy();
        wakeUpManager.onNetworkConnected.subscribe(spy);

        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        sinon.assert.callCount(spy, 1);
    });

    it('should throttle onNetworkConnected to 10 events', () => {
        const spy = sinon.spy();
        wakeUpManager.onNetworkConnected.subscribe(spy);

        for(let i: number = 0; i < 20; i++) {
            nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        }

        sinon.assert.callCount(spy, 10);
    });

    it('should trigger onScreenOn', () => {
        const spy = sinon.spy();
        focusManager.onScreenOn.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onScreenOff', () => {
        const spy = sinon.spy();
        focusManager.onScreenOff.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onAppForeground', () => {
        const spy = sinon.spy();
        focusManager.onAppForeground.subscribe(spy);

        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onAppBackground', () => {
        const spy = sinon.spy();
        focusManager.onAppBackground.subscribe(spy);

        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onActivityResumed', () => {
        const spy = sinon.spy();
        focusManager.onActivityResumed.subscribe(spy);

        nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onActivityPaused', () => {
        const spy = sinon.spy();
        focusManager.onActivityPaused.subscribe(spy);

        nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
        sinon.assert.calledOnce(spy);
    });

    it('should handle app foreground status when initialized', () => {
        assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after FocusManager was initialized');
    });

    it('should handle app foreground status after going to background (on iOS)', () => {
        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
        assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on iOS)');
    });

    it('should handle app foreground status after going to background (on Android)', () => {
        nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
        assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on Android)');
    });

    it('should handle app foreground status after returning to foreground (on iOS)', () => {
        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
        assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on iOS)');
    });

    it('should handle app foreground status after returning to foreground (on Android)', () => {
        nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
        nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
        assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on Android)');
    });

    it('should handle app foreground status when changing Android activities', () => {
        nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.newactivity']);
        nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.oldactivity']);
        assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after changing Android activities');
    });
});
