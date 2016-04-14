import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';

describe('ConnectivityApi', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, false);
    });

    it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
        nativeBridge.Connectivity.setListeningStatus(true);
        sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.ads.api.Connectivity', 'setConnectionMonitoring', [true], '1']]));
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
