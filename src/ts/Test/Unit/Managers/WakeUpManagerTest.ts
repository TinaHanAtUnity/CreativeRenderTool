import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ConnectivityApi } from 'Native/Api/Connectivity';
import { BroadcastApi } from 'Native/Api/Broadcast';
import { Platform } from 'Constants/Platform';
import { NotificationApi } from 'Native/Api/Notification';
import { LifecycleApi } from 'Native/Api/Lifecycle';

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

describe('WakeUpManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
        nativeBridge.Connectivity = new TestConnectivityApi(nativeBridge);
        nativeBridge.Broadcast = new TestBroadcastApi(nativeBridge);
        nativeBridge.Notification = new TestNotificationApi(nativeBridge);
        nativeBridge.Lifecycle = new TestLifecycleApi(nativeBridge);

        wakeUpManager = new WakeUpManager(nativeBridge);
    });

    it('should set connection listening status true', () => {
        const spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(true).then(() => {
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, true);
        });
    });

    it('should set connection listening status false', () => {
        const spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(false).then(() => {
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, false);
        });
    });

    it('should start listening to screen broadcasts', () => {
        const spy = sinon.spy(nativeBridge.Broadcast, 'addBroadcastListener');
        return wakeUpManager.setListenScreen(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
        });
    });

    it('should stop listening to screen broadcasts', () => {
        const spy = sinon.spy(nativeBridge.Broadcast, 'removeBroadcastListener');
        return wakeUpManager.setListenScreen(false).then(() => {
            sinon.assert.calledOnce(spy);
        });
    });

    it('should start listening to app foreground events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
        return wakeUpManager.setListenAppForeground(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
            assert.deepEqual(spy.getCall(0).args[1], []);
        });
    });

    it('should stop listening to app foreground events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
        return wakeUpManager.setListenAppForeground(false).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
        });
    });

    it('should start listening to app background events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
        return wakeUpManager.setListenAppBackground(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
            assert.deepEqual(spy.getCall(0).args[1], []);
        });
    });

    it('should stop listening to app background events', () => {
        const spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
        return wakeUpManager.setListenAppBackground(false).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
        });
    });

    it('should start listening to Android lifecycle events', () => {
        const spy = sinon.spy(nativeBridge.Lifecycle, 'register');
        return wakeUpManager.setListenAndroidLifecycle(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[0], ['onActivityResumed', 'onActivityPaused']);
        });
    });

    it('should stop listening to Android lifecycle events', () => {
        const spy = sinon.spy(nativeBridge.Lifecycle, 'unregister');
        return wakeUpManager.setListenAndroidLifecycle(false).then(() => {
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
        wakeUpManager.onScreenOn.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onScreenOff', () => {
        const spy = sinon.spy();
        wakeUpManager.onScreenOff.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onAppForeground', () => {
        const spy = sinon.spy();
        wakeUpManager.onAppForeground.subscribe(spy);

        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onAppBackground', () => {
        const spy = sinon.spy();
        wakeUpManager.onAppBackground.subscribe(spy);

        nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onActivityResumed', () => {
        const spy = sinon.spy();
        wakeUpManager.onActivityResumed.subscribe(spy);

        nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onActivityPaused', () => {
        const spy = sinon.spy();
        wakeUpManager.onActivityPaused.subscribe(spy);

        nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
        sinon.assert.calledOnce(spy);
    });
});
