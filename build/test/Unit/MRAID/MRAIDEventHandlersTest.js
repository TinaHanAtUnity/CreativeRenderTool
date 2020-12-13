import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import 'mocha';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('MRAIDEventHandlersTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let container;
    let core;
    let ads;
    let store;
    let ar;
    let mraidAdUnit;
    let mraidView;
    let placement;
    let focusManager;
    let request;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let extendedMraidAdUnitParams;
    let mraidEventHandler;
    let extendedMraidCampaign;
    let privacyManager;
    let webPlayerContainer;
    let privacySDK;
    describe('with onClick', () => {
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);
            sinon.spy(ads.Listener, 'sendClickEvent');
            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            request = sinon.createStubInstance(RequestManager);
            placement = TestFixtures.getPlacement();
            request = new RequestManager(platform, core, new WakeUpManager(core));
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);
            extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            mraidView.container.restore();
            const viewContainer = document.createElement('div');
            sinon.stub(mraidView, 'container').returns(viewContainer);
            privacyManager = sinon.createStubInstance(UserPrivacyManager);
            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
            privacySDK = sinon.createStubInstance(PrivacySDK);
            extendedMraidAdUnitParams = {
                platform,
                core,
                ads,
                store,
                ar,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: extendedMraidCampaign,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new Privacy(platform, extendedMraidCampaign, privacyManager, false, false, 'en'),
                privacyManager: privacyManager,
                webPlayerContainer: webPlayerContainer,
                privacySDK: privacySDK
            };
            mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
        });
        afterEach(() => {
            mraidAdUnit.setShowing(true);
            return mraidAdUnit.hide();
        });
        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(ads.Listener.sendClickEvent, placement.getId());
        });
        describe('with onPlayableAnalyticsEvent', () => {
            let sandbox;
            before(() => {
                sandbox = sinon.createSandbox();
            });
            beforeEach(() => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                sandbox.stub(HttpKafka, 'sendEvent');
            });
            afterEach(() => {
                sandbox.restore();
            });
            describe('MRAIDEventHandler', () => {
                it('should send an analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.called(HttpKafka.sendEvent);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9NUkFJRC9NUkFJREV2ZW50SGFuZGxlcnNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMzRCxPQUFPLEVBQW1CLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXRGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTdFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3JELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUEwQixXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUUxRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDMUMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDRD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