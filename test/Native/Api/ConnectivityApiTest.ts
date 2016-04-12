import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';

describe('ConnectivityApi', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, false);
    });

    describe('when calling setListeningStatus', () => {

        it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
            NativeBridge.Connectivity.setListeningStatus(true);
            sinon.assert.calledWith(handleInvocation, JSON.stringify([['com.unity3d.ads.api.Connectivity', 'setConnectionMonitoring', [true], '1']]));
        });

    });

    describe('when nativeBridge receives CONNECTIVITY_CONNECTED', () => {

        it('should trigger onConnected', () => {
            let spy = sinon.spy();
            NativeBridge.Connectivity.onConnected.subscribe(spy);
            NativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
            sinon.assert.calledWith(spy, true, 0);
        });

    });

    describe('when nativeBridge receives an invalid event', () => {

        it('should throw', () => {
            assert.throws(() => {
                NativeBridge.Connectivity.handleEvent('INVALID', []);
            });
        });

    });

});
