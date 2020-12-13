import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { DisplayInterstitialAdUnit } from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import 'mocha';
import * as sinon from 'sinon';
import { asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('DisplayInterstitialAdUnitTest', () => {
        let adUnit;
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let container;
        let sessionManager;
        let placement;
        let campaign;
        let view;
        let sandbox;
        let operativeEventManager;
        let thirdPartyEventManager;
        let deviceInfo;
        let clientInfo;
        let webPlayerContainer;
        let displayInterstitialAdUnitParameters;
        let privacySDK;
        function adUnitTests() {
            beforeEach(() => {
                campaign = TestFixtures.getDisplayInterstitialCampaign();
                sandbox = sinon.createSandbox();
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);
                ads = TestFixtures.getAdsApi(nativeBridge);
                store = TestFixtures.getStoreApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                placement = TestFixtures.getPlacement();
                const metaDataManager = new MetaDataManager(core);
                const focusManager = new FocusManager(platform, core);
                const wakeUpManager = new WakeUpManager(core);
                const request = new RequestManager(platform, core, wakeUpManager);
                const coreConfig = TestFixtures.getCoreConfiguration();
                const adsConfig = TestFixtures.getAdsConfiguration();
                clientInfo = TestFixtures.getClientInfo(platform);
                if (platform === Platform.ANDROID) {
                    container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                }
                if (platform === Platform.IOS) {
                    container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                }
                sandbox.stub(container, 'open').returns(Promise.resolve());
                sandbox.stub(container, 'close').returns(Promise.resolve());
                thirdPartyEventManager = new ThirdPartyEventManager(core, request);
                sessionManager = new SessionManager(core, request, storageBridge);
                const privacyManager = sinon.createStubInstance(UserPrivacyManager);
                privacySDK = sinon.createStubInstance(PrivacySDK);
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform: platform,
                    core: core,
                    ads: ads,
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
                const privacy = new Privacy(platform, campaign, privacyManager, privacySDK.isGDPREnabled(), coreConfig.isCoppaCompliant(), 'en');
                webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
                webPlayerContainer.onPageStarted = new Observable1();
                webPlayerContainer.shouldOverrideUrlLoading = new Observable2();
                asStub(webPlayerContainer.setSettings).resolves();
                asStub(webPlayerContainer.clearSettings).resolves();
                sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
                view = new DisplayInterstitial(platform, core, deviceInfo, placement, campaign, privacy, false);
                view.render();
                sandbox.stub(view, 'show');
                sandbox.spy(view, 'hide');
                displayInterstitialAdUnitParameters = {
                    platform: platform,
                    core: core,
                    ads: ads,
                    store: store,
                    privacy,
                    webPlayerContainer,
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
                    view: view,
                    privacyManager: privacyManager,
                    privacySDK: privacySDK
                };
                adUnit = new DisplayInterstitialAdUnit(displayInterstitialAdUnitParameters);
            });
            afterEach(() => {
                sandbox.restore();
                adUnit.setShowing(true);
                return adUnit.hide();
            });
            describe('showing', () => {
                it('should open the container', () => {
                    return adUnit.show().then(() => {
                        sinon.assert.called(container.open);
                    });
                });
                it('should open the view', () => {
                    return adUnit.show().then(() => {
                        sinon.assert.called(view.show);
                    });
                });
                it('should trigger onStart', () => {
                    const spy = sinon.spy();
                    adUnit.onStart.subscribe(spy);
                    return adUnit.show().then(() => {
                        sinon.assert.called(spy);
                    });
                });
            });
            describe('hiding', () => {
                beforeEach(() => {
                    return adUnit.show();
                });
                it('should close the view', () => {
                    return adUnit.hide().then(() => {
                        sinon.assert.called(view.hide);
                    });
                });
            });
        }
        describe('On static-interstial campaign', () => {
            adUnitTests();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvRGlzcGxheS9EaXNwbGF5SW50ZXJzdGl0aWFsQWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFtQixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUN0RixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNoRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBSzVELE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTdELE9BQU8sRUFDSCx5QkFBeUIs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