import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { Platform } from '../../../src/ts/Constants/Platform';

describe('ConnectivityApi', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

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
        let spy = sinon.spy();
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
