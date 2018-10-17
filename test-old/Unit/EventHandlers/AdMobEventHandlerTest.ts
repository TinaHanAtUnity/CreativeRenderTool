import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';

import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { ITouchInfo } from 'AdMob/Views/AFMABridge';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Session } from 'Ads/Models/Session';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { IntentApi } from 'Core/Native/Android/Intent';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import * as protobuf from 'protobufjs/minimal';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { unity_proto } from '../../../src/proto/unity_proto.js';

const resolveAfter = (timeout: number): Promise<void> => {
    return new Promise((resolve, reject) => setTimeout(resolve, timeout));
};

describe('AdMobEventHandler', () => {
    let admobEventHandler: AdMobEventHandler;
    let adUnit: AdMobAdUnit;
    let nativeBridge: NativeBridge;
    let request: RequestManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let session: Session;
    let adMobSignalFactory: AdMobSignalFactory;
    let campaign: AdMobCampaign;
    let clientInfo: ClientInfo;
    const testTimeout = 250;
    let coreConfig;
    let adsConfig;
    let gdprManager;

    beforeEach(() => {
        adUnit = sinon.createStubInstance(AdMobAdUnit);
        request = sinon.createStubInstance(Request);
        thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
        session = TestFixtures.getSession();
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        nativeBridge = sinon.createStubInstance(NativeBridge);
        nativeBridge.Intent = sinon.createStubInstance(IntentApi);
        nativeBridge.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        campaign = sinon.createStubInstance(AdMobCampaign);
        (<sinon.SinonStub>campaign.getSession).returns(TestFixtures.getSession());
        coreConfig = sinon.createStubInstance(CoreConfiguration);
        adsConfig = sinon.createStubInstance(AdsConfiguration);
        gdprManager = sinon.createStubInstance(GdprManager);

        clientInfo = sinon.createStubInstance(ClientInfo);

        AdMobEventHandler.setLoadTimeout(testTimeout);
        admobEventHandler = new AdMobEventHandler({
            adUnit: adUnit,
            nativeBridge: nativeBridge,
            request: request,
            thirdPartyEventManager: thirdPartyEventManager,
            session: session,
            adMobSignalFactory: adMobSignalFactory,
            campaign: campaign,
            clientInfo: clientInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            gdprManager: gdprManager
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

    // Note, since AdMob does timeout detection on their end, this isn't explicitly necessary.
    // describe('detecting a timeout', () => {
    //     xit('should hide and error the AdUnit if the video does not load', () => {
    //         admobEventHandler.onShow();
    //         return resolveAfter(testTimeout).then(() => {
    //             sinon.assert.calledWith(<sinon.SinonSpy>adUnit.setFinishState, FinishState.ERROR);
    //             sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
    //         });
    //     });
    // });

    describe('on click', () => {
        const startTime = Date.now();
        const requestTime = startTime - 1000;
        let clock: sinon.SinonFakeTimers;
        const touch = <ITouchInfo>{
            start: {
                x: 0,
                y: 0
            },
            end: {
                x: 1,
                y: 1
            },
            diameter: 1,
            pressure: 0.5,
            duration: 5,
            counts: {
                up: 1,
                down: 1,
                cancel: 2,
                move: 5
            }
        };

        beforeEach(() => {
            clock = sinon.useFakeTimers(requestTime);
            SdkStats.setAdRequestTimestamp();
            (<sinon.SinonStub>adMobSignalFactory.getClickSignal).returns(Promise.resolve(new AdMobSignal()));
            (<sinon.SinonStub>adUnit.getTimeOnScreen).returns(42);
            (<sinon.SinonStub>adUnit.getStartTime).returns(startTime);
            (<sinon.SinonStub>adUnit.getRequestToViewTime).returns(42);
            (<sinon.SinonStub>thirdPartyEventManager.sendWithGet).returns(Promise.resolve());
        });

        afterEach(() => {
            clock.restore();
        });

        xit('should append click signals', () => {
            const url = 'http://unityads.unity3d.com';

            return admobEventHandler.onAttribution(url, touch).then(() => {
                const call = (<sinon.SinonStub>thirdPartyEventManager.sendWithGet).getCall(0);
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

        it('should append the rvdt parameter', () => {
            const url = 'http://unityads.unity3d.com';

            return admobEventHandler.onAttribution(url, touch).then(() => {
                const call = (<sinon.SinonStub>thirdPartyEventManager.sendWithGet).getCall(0);
                const calledUrl = call.args[2];
                const param = Url.getQueryParameter(calledUrl, 'rvdt');
                if (!param) {
                    throw new Error('Expected param not to be null');
                }
                assert.equal(param, adUnit.getRequestToViewTime().toString());
            });
        });
    });

    describe('tracking event', () => {
        it('should forward the event to the ad unit', () => {
            admobEventHandler.onTrackingEvent('foo');
            (<sinon.SinonStub>adUnit.sendTrackingEvent).calledWith('foo');
        });
    });
});
