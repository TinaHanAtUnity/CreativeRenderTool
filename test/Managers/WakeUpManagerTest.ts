import 'mocha';
import { assert } from 'chai';
import * as Sinon from 'Sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ConnectivityApi } from 'Native/Api/Connectivity';
import { BroadcastApi } from 'Native/Api/Broadcast';
import { Platform } from 'Constants/Platform';

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

describe('WakeUpManagerTest', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
        nativeBridge.Connectivity = new TestConnectivityApi(nativeBridge);
        nativeBridge.Broadcast = new TestBroadcastApi(nativeBridge);

        let clock = Sinon.useFakeTimers();
        wakeUpManager = new WakeUpManager(nativeBridge);
        clock.restore();
    });

    it('should set connection listening status true', () => {
        let spy = Sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(true).then(() => {
            Sinon.assert.calledOnce(spy);
            Sinon.assert.calledWith(spy, true);
        });
    });

    it('should set connection listening status false', () => {
        let spy = Sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(false).then(() => {
            Sinon.assert.calledOnce(spy);
            Sinon.assert.calledWith(spy, false);
        });
    });

    it('should start listening to screen broadcasts', () => {
        let spy = Sinon.spy(nativeBridge.Broadcast, 'addBroadcastListener');
        return wakeUpManager.setListenScreen(true).then(() => {
            Sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
        });
    });

    it('should stop listening to screen broadcasts', () => {
        let spy = Sinon.spy(nativeBridge.Broadcast, 'removeBroadcastListener');
        return wakeUpManager.setListenScreen(false).then(() => {
            Sinon.assert.calledOnce(spy);
        });
    });

    it('should trigger onNetworkConnected', () => {
        let clock = Sinon.useFakeTimers();
        let spy = Sinon.spy();
        wakeUpManager.onNetworkConnected.subscribe(spy);

        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        Sinon.assert.callCount(spy, 0);

        clock.tick(20 * 60 * 1000);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        Sinon.assert.callCount(spy, 1);
        clock.restore();
    });

    it('should trigger onScreenOn', () => {
        let spy = Sinon.spy();
        wakeUpManager.onScreenOn.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        Sinon.assert.calledOnce(spy);
    });

    it('should trigger onScreenOff', () => {
        let spy = Sinon.spy();
        wakeUpManager.onScreenOff.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
        Sinon.assert.calledOnce(spy);
    });
});
