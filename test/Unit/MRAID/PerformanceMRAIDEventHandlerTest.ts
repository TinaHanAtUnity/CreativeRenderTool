import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import 'mocha';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';

describe('PerformanceMRAIDEventHandlersTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let placement: Placement;
    let focusManager: FocusManager;
    let request: RequestManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let extendedMraidAdUnitParams: IMRAIDAdUnitParameters;
    let performanceMraidEventHandler: PerformanceMRAIDEventHandler;
    let extendedMraidCampaign: MRAIDCampaign;
    let privacyManager: UserPrivacyManager;
    let programmaticTrackingService: ProgrammaticTrackingService;

    describe('with onClick', () => {
        let resolvedPromise: Promise<INativeResponse>;
        let webPlayerContainer: WebPlayerContainer;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);

            sinon.spy(core.Android!.Intent, 'launch');
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
            (<sinon.SinonSpy>mraidView.container).restore();
            const viewContainer = document.createElement('div');
            sinon.stub(mraidView, 'container').returns(viewContainer);
            privacyManager = sinon.createStubInstance(UserPrivacyManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);

            extendedMraidAdUnitParams = {
                platform,
                core,
                ads,
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
                privacy: new Privacy(platform, extendedMraidCampaign, privacyManager, false, false),
                privacyManager: privacyManager,
                programmaticTrackingService: programmaticTrackingService,
                webPlayerContainer: webPlayerContainer
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
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a view with session manager', () => {
            performanceMraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a third quartile event with session manager', () => {
            performanceMraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
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
                    sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                extendedMraidAdUnitParams.mraid = mraidView;
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
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
                    sinon.assert.notCalled(<sinon.SinonSpy>core.Android!.Intent.launch);
                });
            });
        });

        describe('with onPlayableAnalyticsEvent', () => {
            let sandbox: sinon.SinonSandbox;

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

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = { 'level': 2 };
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 0;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if (resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });

                it('should send a analytics event without extra event data', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    performanceMraidEventHandler = new PerformanceMRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                    performanceMraidEventHandler.onPlayableAnalyticsEvent(15, 12, 5, 'win_screen', undefined);

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = undefined;
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 5;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if (resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });
            });
        });
    });
});
