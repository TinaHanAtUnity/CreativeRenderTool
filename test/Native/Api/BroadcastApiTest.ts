import 'mocha';
import * as Sinon from 'Sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

describe('BroadcastApi', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should handle SCREEN_ON event', () => {
        let spy = Sinon.spy();
        nativeBridge.Broadcast.onBroadcastAction.subscribe(spy);
        nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
        Sinon.assert.calledWith(spy, 'screenListener', 'android.intent.action.SCREEN_ON', '', {});
    });

    it('should throw on invalid events', () => {
        assert.throws(() => {
            nativeBridge.Broadcast.handleEvent('INVALID', []);
        });
    });
});
