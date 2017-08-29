import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ConnectivityApi } from 'Native/Api/Connectivity';
import { BroadcastApi } from 'Native/Api/Broadcast';
import { Platform } from 'Constants/Platform';
import { NotificationApi } from 'Native/Api/Notification';
import { LifecycleApi } from 'Native/Api/Lifecycle';
import { FocusManager } from 'Managers/FocusManager';

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
});
