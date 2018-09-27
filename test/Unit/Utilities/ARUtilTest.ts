import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import {NativeBridge} from 'Core/Native/Bridge/NativeBridge';
import {ARApi} from 'AR/Native/AR';
import {AndroidARApi} from 'AR/Native/Android/AndroidARApi';
import {ARUtil} from 'AR/Utilities/ARUtil';

describe('ARUtil Test', () => {
    let nativeBridge: any;

    it('Android Supported', (done) => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.AR = sinon.createStubInstance(ARApi);
        nativeBridge.AR.Android = sinon.createStubInstance(AndroidARApi);
        nativeBridge.AR.Android.isARSupported.onCall(0).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(1).returns(Promise.resolve([false, true]));

        ARUtil.isARSupported(nativeBridge).then(supported => {
           sinon.assert.calledTwice(nativeBridge.AR.Android.isARSupported);
           assert(supported);
           done();
        });
    });

    it('Android Supported Retry', (done) => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.AR = sinon.createStubInstance(ARApi);
        nativeBridge.AR.Android = sinon.createStubInstance(AndroidARApi);
        nativeBridge.AR.Android.isARSupported.onCall(0).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(1).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(2).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(3).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(4).returns(Promise.resolve([true, false]));
        nativeBridge.AR.Android.isARSupported.onCall(5).returns(Promise.resolve([true, false]));

        ARUtil.isARSupported(nativeBridge).then(supported => {
            const count = nativeBridge.AR.Android.isARSupported.callCount;
            assert.equal(count, 5, 'isARSupported retried ' + count + ' times');
            assert(!supported);
            done();
        });
    });
});
