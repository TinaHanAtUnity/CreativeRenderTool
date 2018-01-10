import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdMobEventHandler } from 'EventHandlers/AdmobEventHandler';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { IntentApi } from 'Native/Api/Intent';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { Platform } from 'Constants/Platform';
import { FinishState } from 'Constants/FinishState';
import { Request } from 'Utilities/Request';
import { Session } from 'Models/Session';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { AdMobSignal } from 'Models/AdMobSignal';
import { SinonSandbox } from 'sinon';
import { Url } from 'Utilities/Url';

import { unity_proto } from '../../../../proto/unity_proto.js';
import * as protobuf from 'protobufjs/minimal';
import { SdkStats } from 'Utilities/SdkStats';

const resolveAfter = (timeout: number): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(resolve, timeout));
};

describe('AdMobEventHandler', () => {
    let admobEventHandler: AdMobEventHandler;
    let adUnit: AdMobAdUnit;
    let nativeBridge: NativeBridge;
    let request: Request;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let session: Session;
    let adMobSignalFactory: AdMobSignalFactory;
    const testTimeout = 250;

    beforeEach(() => {
        adUnit = sinon.createStubInstance(AdMobAdUnit);
        request = sinon.createStubInstance(Request);
        thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
        session = TestFixtures.getSession();
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Intent = sinon.createStubInstance(IntentApi);
        nativeBridge.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        AdMobEventHandler.setLoadTimeout(testTimeout);
        admobEventHandler = new AdMobEventHandler({
            adUnit: adUnit,
            nativeBridge: nativeBridge,
            request: request,
            thirdPartyEventManager: thirdPartyEventManager,
            session: session,
            adMobSignalFactory: adMobSignalFactory
        });
    });

    describe('on close', () => {
        it('should hide the ad unit', () => {
            admobEventHandler.onClose();
            sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
        });
    });

    describe('on open URL', () => {
        const url = 'https://unityads.unity3d.com/open';

        describe('on iOS', () => {
            it('should open the UrlScheme', () => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
                (<sinon.SinonStub>request.followRedirectChain).returns(Promise.resolve(url));
                admobEventHandler.onOpenURL(url);
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        try {
                            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, url);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
            });
        });

        describe('on Android', () => {
            it('should open using the VIEW Intent', () => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
                admobEventHandler.onOpenURL(url);
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    action: 'android.intent.action.VIEW',
                    uri: url
                });
            });
        });
    });

    describe('detecting a timeout', () => {
        xit('should hide and error the AdUnit if the video does not load', () => {
            admobEventHandler.onShow();
            return resolveAfter(testTimeout).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.ERROR);
                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });
    });

    describe('on click', () => {
        const startTime = Date.now();
        const requestTime = startTime - 1000;
        let clock: sinon.SinonFakeTimers;

        beforeEach(() => {
            clock = sinon.useFakeTimers(requestTime);
            SdkStats.setAdRequestTimestamp();
        });

        afterEach(() => {
            clock.restore();
        });

        it('should append click signals', () => {
            (<sinon.SinonStub>adMobSignalFactory.getClickSignal).returns(Promise.resolve(new AdMobSignal()));
            (<sinon.SinonStub>adUnit.getTimeOnScreen).returns(42);
            (<sinon.SinonStub>adUnit.getStartTime).returns(startTime);
            (<sinon.SinonStub>thirdPartyEventManager.sendEvent).returns(Promise.resolve());
            const url = 'http://unityads.unity3d.com';

            return admobEventHandler.onAttribution(url).then(() => {
                const call = (<sinon.SinonStub>thirdPartyEventManager.sendEvent).getCall(0);
                const calledUrl = call.args[2];
                const param = Url.getQueryParameter(calledUrl, 'ms');
                if (!param) {
                    throw new Error('Expected param not to be null');
                }

                const buffer = new Uint8Array(protobuf.util.base64.length(param));
                protobuf.util.base64.decode(param, buffer, 0);
                const decodedProtoBuf = unity_proto.UnityProto.decode(buffer);

                const decodedSignal = unity_proto.UnityInfo.decode(decodedProtoBuf.encryptedBlobs[0]);
                assert.equal(decodedSignal.field_36, adUnit.getTimeOnScreen());
            });
        });

        it('should append the rdvt parameter', () => {
            (<sinon.SinonStub>adMobSignalFactory.getClickSignal).returns(Promise.resolve(new AdMobSignal()));
            (<sinon.SinonStub>adUnit.getTimeOnScreen).returns(42);
            (<sinon.SinonStub>adUnit.getStartTime).returns(startTime);
            (<sinon.SinonStub>thirdPartyEventManager.sendEvent).returns(Promise.resolve());
            const url = 'http://unityads.unity3d.com';

            return admobEventHandler.onAttribution(url).then(() => {
                const call = (<sinon.SinonStub>thirdPartyEventManager.sendEvent).getCall(0);
                const calledUrl = call.args[2];
                const param = Url.getQueryParameter(calledUrl, 'rdvt');
                if (!param) {
                    throw new Error('Expected param not to be null');
                }
                assert.equal(param, (startTime - requestTime).toString());
            });
        });
    });
});
