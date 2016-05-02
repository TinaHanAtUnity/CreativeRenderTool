import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';
import { ConnectivityApi } from '../../src/ts/Native/Api/Connectivity';
import { BroadcastApi } from '../../src/ts/Native/Api/Broadcast';

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
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;
    let wakeUpManager: WakeUpManager;
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, false);
        nativeBridge.Connectivity = new TestConnectivityApi(nativeBridge);
        nativeBridge.Broadcast = new TestBroadcastApi(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge);
    });

    afterEach(() => {
        clock.restore();
    });

    it('should set connection listening status true', () => {
        let spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(true).then(() => {
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, true);
        });
    });

    it('should set connection listening status false', () => {
        let spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
        return wakeUpManager.setListenConnectivity(false).then(() => {
            sinon.assert.calledOnce(spy);
            sinon.assert.calledWith(spy, false);
        });
    });

    it('should start listening to screen broadcasts', () => {
        let spy = sinon.spy(nativeBridge.Broadcast, 'addBroadcastListener');
        return wakeUpManager.setListenScreen(true).then(() => {
            sinon.assert.calledOnce(spy);
            assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
        });
    });

    it('should stop listening to screen broadcasts', () => {
        let spy = sinon.spy(nativeBridge.Broadcast, 'removeBroadcastListener');
        return wakeUpManager.setListenScreen(false).then(() => {
            sinon.assert.calledOnce(spy);
        });
    });

    it('should trigger onNetworkConnected', () => {
        let spy = sinon.spy();
        wakeUpManager.onNetworkConnected.subscribe(spy);

        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        sinon.assert.callCount(spy, 0);

        clock.tick(20 * 60 * 1000);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        sinon.assert.callCount(spy, 1);
    });

    it('should trigger onScreenOn', () => {
        let spy = sinon.spy();
        wakeUpManager.onScreenOn.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onScreenOff', () => {
        let spy = sinon.spy();
        wakeUpManager.onScreenOff.subscribe(spy);

        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
        sinon.assert.calledOnce(spy);
    });
});