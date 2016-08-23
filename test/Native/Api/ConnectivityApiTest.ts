import 'mocha';
import * as Sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';

describe('ConnectivityApi', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.TEST, false);
    });

    it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
        nativeBridge.Connectivity.setListeningStatus(true);
        Sinon.assert.calledWith(handleInvocation, JSON.stringify([['Connectivity', 'setConnectionMonitoring', [true], '1']]));
    });

    it('should trigger onConnected', () => {
        let spy = Sinon.spy();
        nativeBridge.Connectivity.onConnected.subscribe(spy);
        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
        Sinon.assert.calledWith(spy, true, 0);
    });

    it('should throw', () => {
        assert.throws(() => {
            nativeBridge.Connectivity.handleEvent('INVALID', []);
        });
    });

});
