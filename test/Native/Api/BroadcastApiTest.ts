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

    it('should handle SCREEN_ON event', () => {
        let spy = sinon.spy();
        nativeBridge.Broadcast.onBroadcastAction.subscribe(spy);
        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        sinon.assert.calledWith(spy, 'screenListener', 'android.intent.action.SCREEN_ON', '', {});
    });

    it('should throw on invalid events', () => {
        assert.throws(() => {
            nativeBridge.Broadcast.handleEvent('INVALID', []);
        });
    });
});