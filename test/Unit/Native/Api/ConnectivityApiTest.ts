import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

describe('ConnectivityApi', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
        nativeBridge.Connectivity.setListeningStatus(true);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['Connectivity', 'setConnectionMonitoring', [true], '1']]));
    });

    it('should trigger onConnected', () => {
        const spy = sinon.spy();
        nativeBridge.Connectivity.onConnected.subscribe(spy);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        sinon.assert.calledWith(spy, true, 0);
    });

    it('should throw', () => {
        assert.throws(() => {
            nativeBridge.Connectivity.handleEvent('INVALID', []);
        });
    });

});
