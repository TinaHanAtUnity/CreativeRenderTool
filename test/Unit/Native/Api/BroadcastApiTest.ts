import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

describe('BroadcastApi', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should handle SCREEN_ON event', () => {
        const spy = sinon.spy();
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
