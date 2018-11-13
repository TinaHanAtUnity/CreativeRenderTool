import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import 'mocha';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { PlayableEventHandler } from 'MRAID/EventHandlers/PlayableEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Privacy } from 'Ads/Views/Privacy';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

describe('MRAIDEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let storageBridge: StorageBridge;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let placement: Placement;
    let focusManager: FocusManager;
    let request: Request;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let extendedMraidAdUnitParams: IMRAIDAdUnitParameters;
    let mraidEventHandler: MRAIDEventHandler;
    let extendedMraidCampaign: MRAIDCampaign;
    let programmaticMraidCampaign: MRAIDCampaign;
    let gdprManager: GdprManager;
    let programmaticTrackingService: ProgrammaticTrackingService;

    describe('with onClick', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            sinon.spy(nativeBridge.Intent, 'launch');
            sinon.spy(nativeBridge.UrlScheme, 'open');
            sinon.spy(nativeBridge.Listener, 'sendClickEvent');

            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            request = sinon.createStubInstance(Request);
            placement = TestFixtures.getPlacement();
            request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();

            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            (<sinon.SinonSpy>mraidView.container).restore();
            sinon.stub(mraidView, 'container').returns(document.createElement('div'));
            gdprManager = sinon.createStubInstance(GdprManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            extendedMraidAdUnitParams = {
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
                privacy: new Privacy(nativeBridge, extendedMraidCampaign, gdprManager, false, false),
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);
        });

        it('should send a click with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a view with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a third quartile event with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: extendedMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent, placement.getId());
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

                mraidView = new MRAID(nativeBridge, placement, extendedMraidCampaign, extendedMraidAdUnitParams.privacy, true, extendedMraidAdUnitParams.coreConfig.getAbGroup());
                sinon.stub(mraidView, 'createMRAID').callsFake(() => {
                    return Promise.resolve();
                });

                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                extendedMraidAdUnitParams.mraid = mraidView;
                extendedMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);

                mraidEventHandler.onMraidClick('market://foobar.com');

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
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

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');

                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);
                mraidEventHandler.onMraidClick('http://example.net');

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });
        });

        describe('with onPlayableAnalyticsEvent', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.sandbox.create();
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
                it('should not send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.notCalled(<sinon.SinonStub>HttpKafka.sendEvent);
                });
            });

            describe('PlayableEventHandler', () => {
                it('should send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', {'level': 2});

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = {'level': 2};
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 0;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if(resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });

                it('should send a analytics event without extra event data', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(nativeBridge, mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 5, 'win_screen', undefined);

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = undefined;
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 5;
                    kafkaObject.auctionId = '12345';
                    kafkaObject.abGroup = 99;

                    const resourceUrl = extendedMraidCampaign.getResourceUrl();
                    if(resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });
            });
        });
    });

    describe('with Programmatic MRAID', () => {
        let programmaticMraidAdUnitParams: IMRAIDAdUnitParameters;
        let metaDataManager: MetaDataManager;
        let sessionManager: SessionManager;
        let coreConfig: CoreConfiguration;
        let adsConfig: AdsConfiguration;
        let programmaticMraidAdUnit: MRAIDAdUnit;
        let programmaticMraidEventHandler: MRAIDEventHandler;
        let privacy: AbstractPrivacy;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);
            storageBridge = new StorageBridge(nativeBridge);
            focusManager = new FocusManager(nativeBridge);
            metaDataManager = new MetaDataManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            sinon.stub(request, 'followRedirectChain').resolves();
            placement = TestFixtures.getPlacement();
            gdprManager = sinon.createStubInstance(GdprManager);

            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request, storageBridge);
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
            programmaticMraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();

            privacy = new Privacy(nativeBridge, programmaticMraidCampaign, gdprManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            mraidView = new MRAID(nativeBridge, placement, programmaticMraidCampaign, privacy, true, coreConfig.getAbGroup());

            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: programmaticMraidCampaign
            });

            programmaticMraidAdUnitParams = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: programmaticMraidCampaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new Privacy(nativeBridge, programmaticMraidCampaign, gdprManager, false, false),
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            programmaticMraidAdUnit = new MRAIDAdUnit(nativeBridge, programmaticMraidAdUnitParams);
            programmaticMraidEventHandler = new MRAIDEventHandler(nativeBridge, programmaticMraidAdUnit, programmaticMraidAdUnitParams);
            sinon.stub(programmaticMraidAdUnit, 'sendClick').returns(sinon.spy());
        });

        describe('when calling onClick', () => {
            it('should send a tracking event for programmatic mraid click', () => {
                sinon.stub(nativeBridge.Intent, 'launch').resolves();
                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                });
            });

            it('should send second tracking event for programmatic mraid click after processing the first', () => {
                sinon.stub(nativeBridge.Intent, 'launch').resolves();
                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                    programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                        sinon.assert.calledTwice(<sinon.SinonSpy>programmaticMraidAdUnit.sendClick);
                    });
                });
            });

            it('should ignore user clicks while processing the first click event', () => {
                const mockMraidView = sinon.mock(mraidView);
                const expectationMraidView = sinon.mock(mraidView).expects('setCallButtonEnabled').twice();
                sinon.stub(nativeBridge.Intent, 'launch').resolves();
                programmaticMraidEventHandler.onMraidClick('http://example.net').then(() => {
                    mockMraidView.verify();
                    assert.equal(expectationMraidView.getCall(0).args[0], false, 'Should block CTA event while processing click event');
                    assert.equal(expectationMraidView.getCall(1).args[0], true, 'Should enable CTA event after processing click event');
                });
            });
        });
    });
});
