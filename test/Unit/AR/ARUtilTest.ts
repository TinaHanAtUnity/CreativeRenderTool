import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { ARApi } from 'AR/Native/AR';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

describe('ARUtil Test', () => {
    const ANDROID_AR_SUPPORTED_RETRY_COUNT = 5;
    let nativeBridge: any;

    it('Android Supported (transient first)', () => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.AR = sinon.createStubInstance(ARApi);
        nativeBridge.AR.Android = sinon.createStubInstance(AndroidARApi);
        nativeBridge.AR.Android.isARSupported.onCall(0).resolves([true, false]);
        nativeBridge.AR.Android.isARSupported.onCall(1).resolves([false, true]);

        return ARUtil.isARSupported(nativeBridge).then(supported => {
           sinon.assert.calledTwice(nativeBridge.AR.Android.isARSupported);
           assert(supported);

           return Promise.resolve();
        });
    });

    it('Android Supported Retry', () => {
        const IS_TRANSIENT = true;
        const IS_SUPPORTED = false;
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.AR = sinon.createStubInstance(ARApi);
        nativeBridge.AR.Android = sinon.createStubInstance(AndroidARApi);
        nativeBridge.AR.Android.isARSupported.onCall(0).resolves([IS_TRANSIENT, IS_SUPPORTED]);
        nativeBridge.AR.Android.isARSupported.onCall(1).resolves([IS_TRANSIENT, IS_SUPPORTED]);
        nativeBridge.AR.Android.isARSupported.onCall(2).resolves([IS_TRANSIENT, IS_SUPPORTED]);
        nativeBridge.AR.Android.isARSupported.onCall(3).resolves([IS_TRANSIENT, IS_SUPPORTED]);
        nativeBridge.AR.Android.isARSupported.onCall(4).resolves([IS_TRANSIENT, IS_SUPPORTED]);
        nativeBridge.AR.Android.isARSupported.onCall(5).resolves([IS_TRANSIENT, IS_SUPPORTED]);

        return ARUtil.isARSupported(nativeBridge).then(supported => {
            const count = nativeBridge.AR.Android.isARSupported.callCount;
            assert.equal(count, ANDROID_AR_SUPPORTED_RETRY_COUNT, 'isARSupported retried ' + count + ' times');
            assert(!supported);

            return Promise.resolve();
        });
    });
});
