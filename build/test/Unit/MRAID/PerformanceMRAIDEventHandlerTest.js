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
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import 'mocha';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('PerformanceMRAIDEventHandlersTest', () => {
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
    let performanceMraidEventHandler;
    let extendedMraidCampaign;
    let privacyManager;
    let privacySDK;
    describe('with onClick', () => {
        let resolvedPromise;
        let webPlayerContainer;
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);
            sinon.spy(core.Android.Intent, 'launch');
            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            request = sinon.createStubInstance(RequestManager);
            placement = TestFixtures.getPlacement();
            request = new RequestManager(platform, core, new WakeUpManager(core));
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
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
            performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
        });
        afterEach(() => {
            mraidAdUnit.setShowing(true);
            return mraidAdUnit.hide();
        });
        it('should send a click with session manager', () => {
            performanceMraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(operativeEventManager.sendClick, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });
        it('should send a view with session manager', () => {
            performanceMraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(operativeEventManager.sendView, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });
        it('should send a third quartile event with session manager', () => {
            performanceMraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });
        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                thirdPartyEventManager.clickAttributionEvent.restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;
                mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');
                performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                performanceMraidEventHandler.onMraidClick('market://foobar.com');
                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(core.Android.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });
            it('with response that does not contain location, it should not launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                thirdPartyEventManager.clickAttributionEvent.restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                extendedMraidAdUnitParams.mraid = mraidView;
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;
                operativeEventManager.sendClick.restore();
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                extendedMraidAdUnitParams.operativeEventManager = operativeEventManager;
                mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');
                performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                performanceMraidEventHandler.onMraidClick('http://example.net');
                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(core.Android.Intent.launch);
                });
            });
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
            describe('PerformanceMRAIDEventHandler', () => {
                it('should send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                    performanceMraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    const kafkaObject = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = { 'level': 2 };
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 0;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;
                    kafkaObject.targetGameId = 53872;
                    kafkaObject.campaignId = '58dec182f01b1c0cdef54f0f';
                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if (resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });
                it('should send a analytics event without extra event data', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
                    performanceMraidEventHandler.onPlayableAnalyticsEvent(15, 12, 5, 'win_screen', undefined);
                    const kafkaObject = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = undefined;
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 5;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;
                    kafkaObject.targetGameId = 53872;
                    kafkaObject.campaignId = '58dec182f01b1c0cdef54f0f';
                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if (resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VNUkFJREV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvTVJBSUQvUGVyZm9ybWFuY2VNUkFJREV2ZW50SGFuZGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sRUFBbUIsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFFdEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFN0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFtQixjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJNUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzVFLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUEwQixXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRixPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUVoRyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDMUMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FB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