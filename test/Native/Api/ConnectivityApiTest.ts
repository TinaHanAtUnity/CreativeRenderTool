import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { ConnectivityApi } from '../../../src/ts/Native/Api/Connectivity';

describe('ConnectivityApi', () => {
    let webViewBridge: IWebViewBridge = {
        handleInvocation: function() {},
        handleCallback: function() {}
    };

    before(() => {
        NativeBridge.setInstance(new NativeBridge(webViewBridge));
    });

    describe('when calling setListeningStatus', () => {

        it('should call Connectivity.setConnectionMonitoring on native bridge', () => {
            let spy = sinon.spy(webViewBridge, 'handleInvocation');
            ConnectivityApi.setListeningStatus(true);
            sinon.assert.calledWith(spy, JSON.stringify([['com.unity3d.ads.api.Connectivity', 'setConnectionMonitoring', [true], '1']]));
        });

    });

    describe('when nativeBridge receives CONNECTIVITY_CONNECTED', () => {

        it('should trigger onConnected', () => {
            let spy = sinon.spy();
            ConnectivityApi.onConnected.subscribe(spy);
            ConnectivityApi.handleEvent('CONNECTED', [true, 0]);
            sinon.assert.calledWith(spy, true, 0);
        });

    });

    describe('when nativeBridge receives an invalid event', () => {

        it('should throw', () => {
            assert.throws(() => {
                ConnectivityApi.handleEvent('INVALID', []);
            });
        });

    });

});
