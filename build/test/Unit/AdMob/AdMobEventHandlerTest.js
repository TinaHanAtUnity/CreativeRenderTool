import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobEventHandler } from 'AdMob/EventHandlers/AdmobEventHandler';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { ThirdPartyEventManager, TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { IntentApi } from 'Core/Native/Android/Intent';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { Url } from 'Core/Utilities/Url';
import * as protobuf from 'protobufjs/minimal';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { unity_proto } from 'unity_proto';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SDKMetrics, AdmobMetric } from 'Ads/Utilities/SDKMetrics';
const resolveAfter = (timeout) => {
    return new Promise((resolve, reject) => setTimeout(resolve, timeout));
};
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AdMobEventHandler', () => {
        let admobEventHandler;
        let adUnit;
        let backend;
        let nativeBridge;
        let core;
        let request;
        let thirdPartyEventManager;
        let session;
        let adMobSignalFactory;
        let campaign;
        let clientInfo;
        const testTimeout = 250;
        let coreConfig;
        let adsConfig;
        let privacyManager;
        let privacySDK;
        beforeEach(() => {
            adUnit = sinon.createStubInstance(AdMobAdUnit);
            request = sinon.createStubInstance(RequestManager);
            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            session = TestFixtures.getSession();
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
            if (platform === Platform.ANDROID) {
                core.Android.Intent = sinon.createStubInstance(IntentApi);
            }
            if (platform === Platform.IOS) {
                core.iOS.UrlScheme = sinon.createStubInstance(UrlSchemeApi);
            }
            campaign = sinon.createStubInstance(AdMobCampaign);
            campaign.getSession.returns(TestFixtures.getSession());
            coreConfig = sinon.createStubInstance(CoreConfiguration);
            adsConfig = sinon.createStubInstance(AdsConfiguration);
            privacyManager = sinon.createStubInstance(UserPrivacyManager);
            clientInfo = sinon.createStubInstance(ClientInfo);
            privacySDK = sinon.createStubInstance(PrivacySDK);
            sinon.stub(SDKMetrics, 'reportMetricEvent');
            AdMobEventHandler.setLoadTimeout(testTimeout);
            admobEventHandler = new AdMobEventHandler({
                platform: platform,
                core: core,
                adUnit: adUnit,
                request: request,
                thirdPartyEventManager: thirdPartyEventManager,
                session: session,
                adMobSignalFactory: adMobSignalFactory,
                campaign: campaign,
                clientInfo: clientInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                privacyManager: privacyManager,
                privacySDK: privacySDK
            });
        });
        describe('on close', () => {
            it('should hide the ad unit', () => {
                admobEventHandler.onClose();
                sinon.assert.called(adUnit.hide);
            });
        });
        describe('on open URL', () => {
            const url = 'https://unityads.unity3d.com/open';
            if (platform === Platform.IOS) {
                describe('on iOS', () => {
                    it('should open the UrlScheme', () => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                        request.followRedirectChain.returns(Promise.resolve(url));
                        admobEventHandler.onOpenURL(url);
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                try {
                                    sinon.assert.calledWith(core.iOS.UrlScheme.open, url);
                                    resolve();
                                }
                                catch (e) {
                                    reject(e);
                                }
                            });
                        });
                    });
                });
            }
            if (platform === Platform.ANDROID) {
                describe('on Android', () => {
                    it('should open using the VIEW Intent', () => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                        admobEventHandler.onOpenURL(url);
                        sinon.assert.calledWith(core.Android.Intent.launch, {
                            action: 'android.intent.action.VIEW',
                            uri: url
                        });
                    });
                });
            }
        });
        describe('on click', () => {
            const startTime = Date.now();
            const requestTime = startTime - 1000;
            let clock;
            const touch = {
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
                adMobSignalFactory.getClickSignal.returns(Promise.resolve(new AdMobSignal()));
                adUnit.getTimeOnScreen.returns(42);
                adUnit.getStartTime.returns(startTime);
                adUnit.getRequestToViewTime.returns(42);
                thirdPartyEventManager.sendWithGet.returns(Promise.resolve());
            });
            afterEach(() => {
                clock.restore();
            });
            xit('should append click signals', () => {
                const url = 'http://unityads.unity3d.com';
                return admobEventHandler.onAttribution(url, touch).then(() => {
                    const call = thirdPartyEventManager.sendWithGet.getCall(0);
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
                    const call = thirdPartyEventManager.sendWithGet.getCall(0);
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
                admobEventHandler.onTrackingEvent(TrackingEvent.MIDPOINT);
                adUnit.sendTrackingEvent.calledWith(TrackingEvent.MIDPOINT);
            });
            describe('on error event with missing video error', () => {
                beforeEach(() => {
                    admobEventHandler.onTrackingEvent(TrackingEvent.ERROR, 'Missing Video Error: No video element contained in document');
                });
                it('should call the tracking event', () => {
                    sinon.assert.calledWith(adUnit.sendTrackingEvent, TrackingEvent.ERROR);
                });
                it('should alert SDKMetrics', () => {
                    sinon.assert.calledWith(SDKMetrics.reportMetricEvent, AdmobMetric.AdmobVideoElementMissing);
                });
                it('should close the ad unit', () => {
                    sinon.assert.called(adUnit.hide);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JFdmVudEhhbmRsZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0FkTW9iL0FkTW9iRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFeEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUV4RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDNUYsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXZELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENB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