import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { VastStaticEndScreen } from 'VAST/Views/VastStaticEndScreen';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('VastEndScreenEventHandlerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let deviceInfo;
        let storageBridge;
        let container;
        let request;
        let vastAdUnitParameters;
        let videoOverlayParameters;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            storageBridge = new StorageBridge(core);
            const focusManager = new FocusManager(platform, core);
            const metaDataManager = new MetaDataManager(core);
            const clientInfo = TestFixtures.getClientInfo(platform);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                container = new Activity(core, ads, deviceInfo);
            }
            else if (platform === Platform.IOS) {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
                container = new ViewController(core, ads, deviceInfo, focusManager, clientInfo);
            }
            request = new RequestManager(platform, core, new WakeUpManager(core));
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
            const campaign = TestFixtures.getCompanionStaticVastCampaign();
            const thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            const sessionManager = new SessionManager(core, request, storageBridge);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid',
                privacySDK: privacySDK,
                userPrivacyManager: privacyManager
            });
            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            const video = new Video('', TestFixtures.getSession());
            const placement = TestFixtures.getPlacement();
            videoOverlayParameters = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            vastAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: undefined,
                overlay: overlay,
                video: video,
                privacyManager: privacyManager,
                privacySDK: privacySDK,
                privacy
            };
        });
        describe('when calling onClose', () => {
            it('should hide endcard', () => {
                const vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
                vastAdUnitParameters.endScreen = vastEndScreen;
                const vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                sinon.spy(vastAdUnit, 'hide');
                const vastEndScreenEventHandler = new VastEndScreenEventHandler(vastAdUnit, vastAdUnitParameters);
                vastEndScreenEventHandler.onVastEndScreenClose();
                sinon.assert.called(vastAdUnit.hide);
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide();
            });
        });
        describe('when calling onClick', () => {
            let vastAdUnit;
            let video;
            let campaign;
            let vastEndScreen;
            let vastEndScreenEventHandler;
            let clickListenerStub;
            beforeEach(() => {
                video = new Video('', TestFixtures.getSession());
                campaign = TestFixtures.getEventVastCampaign();
                clickListenerStub = sinon.stub(ads.Listener, 'sendClickEvent');
                vastAdUnitParameters.video = video;
                vastAdUnitParameters.campaign = campaign;
                vastAdUnitParameters.placement = TestFixtures.getPlacement();
                vastEndScreen = new VastStaticEndScreen(vastAdUnitParameters);
                vastAdUnitParameters.endScreen = vastEndScreen;
                vastAdUnit = new VastAdUnit(vastAdUnitParameters);
                vastEndScreenEventHandler = new VastEndScreenEventHandler(vastAdUnit, vastAdUnitParameters);
                sinon.stub(vastAdUnit, 'sendTrackingEvent').returns(sinon.spy());
                sinon.stub(vastAdUnit, 'sendCompanionClickTrackingEvent').returns(sinon.spy());
            });
            afterEach(() => {
                vastAdUnit.setShowing(true);
                return vastAdUnit.hide();
            });
            if (platform === Platform.IOS) {
                it('should send a tracking event for vast video end card click', () => {
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        sinon.assert.calledOnce(vastAdUnit.sendTrackingEvent);
                        sinon.assert.calledOnce(vastAdUnit.sendCompanionClickTrackingEvent);
                    });
                });
                it('should send second tracking event for vast video end card click after processing the first', () => {
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                            sinon.assert.calledTwice(vastAdUnit.sendTrackingEvent);
                            sinon.assert.calledTwice(vastAdUnit.sendCompanionClickTrackingEvent);
                        });
                    });
                });
                it('should ignore user clicks while processing the first click event', () => {
                    const mockEndScreen = sinon.mock(vastEndScreen);
                    const expectationEndScreen = sinon.mock(vastEndScreen).expects('setCallButtonEnabled').twice();
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        mockEndScreen.verify();
                        assert.equal(expectationEndScreen.getCall(0).args[0], false, 'Should disable end screen CTA while processing click event');
                        assert.equal(expectationEndScreen.getCall(1).args[0], true, 'Should enable end screen CTA after processing click event');
                    });
                });
                it('should use video click through url when companion click url is not present', () => {
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
                    sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        sinon.assert.calledWith(core.iOS.UrlScheme.open, 'https://bar.com');
                    });
                });
                it('should open click through link on iOS', () => {
                    sinon.stub(core.iOS.UrlScheme, 'open').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        sinon.assert.calledWith(core.iOS.UrlScheme.open, 'https://foo.com');
                    });
                });
            }
            if (platform === Platform.ANDROID) {
                it('should open click through link on Android', () => {
                    sinon.stub(core.Android.Intent, 'launch').resolves();
                    sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
                    return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                        sinon.assert.calledOnce(clickListenerStub);
                        sinon.assert.calledWith(core.Android.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'https://foo.com'
                        });
                    });
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlbkV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0RW5kU2NyZWVuRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdEQsT0FBTyxFQUFFLFlBQVksRUFBMkIsTUFBTSx3QkFBd0IsQ0FBQztBQUMvRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixD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