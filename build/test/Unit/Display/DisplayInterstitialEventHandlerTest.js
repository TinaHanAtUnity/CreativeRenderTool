import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DisplayInterstitialAdUnit } from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('DisplayInterstitialEventHandler', () => {
    let view;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let placement;
    let campaign;
    let sandbox;
    let displayInterstitialAdUnitParameters;
    let displayInterstitialAdUnit;
    let displayInterstitialEventHandler;
    let operativeEventManager;
    function eventHandlerTests() {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            placement = new Placement({
                id: '123',
                name: 'test',
                default: true,
                allowSkip: true,
                skipInSeconds: 5,
                disableBackButton: true,
                useDeviceOrientationForVideo: false,
                skipEndCardOnClose: false,
                disableVideoControlsFade: false,
                useCloseIconInsteadOfSkipIcon: false,
                adTypes: [],
                refreshDelay: 1000,
                muteVideo: false
            });
            campaign = TestFixtures.getDisplayInterstitialCampaign();
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            sandbox.stub(deviceInfo, 'getApiLevel').returns(16);
            const container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            const focusManager = sinon.createStubInstance(FocusManager);
            const request = sinon.createStubInstance(RequestManager);
            const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);
            operativeEventManager.sendStart.returns(Promise.resolve());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
            view = new DisplayInterstitial(platform, core, deviceInfo, placement, campaign, privacy, false);
            const webPlayerContainer = TestFixtures.getWebPlayerContainer();
            const privacySDK = sinon.createStubInstance(PrivacySDK);
            displayInterstitialAdUnitParameters = {
                platform: platform,
                core: core,
                ads: ads,
                store: store,
                privacy: privacy,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                request: request,
                options: {},
                view: view,
                privacyManager: privacyManager,
                webPlayerContainer: webPlayerContainer,
                privacySDK: privacySDK
            };
            displayInterstitialAdUnit = new DisplayInterstitialAdUnit(displayInterstitialAdUnitParameters);
            displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
            view.addEventHandler(displayInterstitialEventHandler);
            return displayInterstitialAdUnit.show();
        });
        describe('on Display Interstitial Markup Campaign', () => {
            eventHandlerTests();
        });
        afterEach(() => {
            sandbox.restore();
            displayInterstitialAdUnit.setShowing(true);
            return displayInterstitialAdUnit.hide();
        });
        describe('on close', () => {
            it('should hide the adUnit', () => {
                sandbox.spy(displayInterstitialAdUnit, 'hide');
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(displayInterstitialAdUnit.hide);
            });
            it('should send the view diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(operativeEventManager.sendView);
            });
            it('should send the third quartile diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(operativeEventManager.sendThirdQuartile);
            });
            it('should send PTS third quartile diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(displayInterstitialAdUnit.sendTrackingEvent);
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvRGlzcGxheS9EaXNwbGF5SW50ZXJzdGl0aWFsRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFNUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsT0FBTyxFQUNILHlCQUF5QixFQUU1QixNQUFNLDJDQUEyQyxDQUFDO0FBQ25ELE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLHVEQUF1RCxDQUFDO0FBRXhHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXhELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVo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