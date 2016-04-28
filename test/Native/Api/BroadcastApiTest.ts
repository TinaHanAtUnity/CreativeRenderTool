import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';

describe('BroadcastApi', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, false);
    });

    it('should invoke addBroadcastListener', () => {
        nativeBridge.Broadcast.setListenScreenStatus(true);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.ads.api.Broadcast', 'addBroadcastListener', ['screenListener', ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']], '1']]));
    });

    it('should invoke removeBroadcastListener', () => {
        nativeBridge.Broadcast.setListenScreenStatus(false);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.ads.api.Broadcast', 'removeBroadcastListener', ['screenListener'], '1']]));
    });

    it('should trigger onScreenOn', () => {
        let spy = sinon.spy();
        nativeBridge.Broadcast.onScreenOn.subscribe(spy);
        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should trigger onScreenOff', () => {
        let spy = sinon.spy();
        nativeBridge.Broadcast.onScreenOff.subscribe(spy);
        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
        sinon.assert.calledOnce(spy);
    });

    it('should throw on invalid events', () => {
        assert.throws(() => {
            nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.UNKNOWN_ACTION', '', {}]);
        });

        assert.throws(() => {
            nativeBridge.Broadcast.handleEvent('INVALID', []);
        });
    });
});