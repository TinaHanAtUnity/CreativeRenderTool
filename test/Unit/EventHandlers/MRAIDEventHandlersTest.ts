import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { MRAIDEventHandler } from 'EventHandlers/MRAIDEventHandler';
import { PlayableEventHandler } from 'EventHandlers/PlayableEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { Platform } from 'Constants/Platform';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { MRAID } from 'Views/MRAID';
import { Placement } from 'Models/Placement';
import { HttpKafka, KafkaCommonObjectType } from 'Utilities/HttpKafka';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { GDPRPrivacy } from 'Views/GDPRPrivacy';
import { GdprManager } from 'Managers/GdprManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { Configuration } from 'Models/Configuration';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
describe('MRAIDEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let placement: Placement;
    let focusManager: FocusManager;
    let request: Request;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let playableMraidAdUnitParams: IMRAIDAdUnitParameters;
    let mraidEventHandler: MRAIDEventHandler;
    let playableMraidCampaign: MRAIDCampaign;
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

            playableMraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            (<sinon.SinonSpy>mraidView.container).restore();
            sinon.stub(mraidView, 'container').returns(document.createElement('div'));
            gdprManager = sinon.createStubInstance(GdprManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            playableMraidAdUnitParams = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: playableMraidCampaign,
                configuration: TestFixtures.getConfiguration(),
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new GDPRPrivacy(nativeBridge, gdprManager, false, true),
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);
        });

        it('should send a click with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: playableMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a view with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: playableMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a third quartile event with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: playableMraidAdUnitParams.campaign.getResourceUrl() });
        });

        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent, placement.getId());
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                playableMraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                mraidView = new MRAID(nativeBridge, placement, playableMraidCampaign, playableMraidAdUnitParams.privacy, true, playableMraidAdUnitParams.configuration.getAbGroup());
                sinon.stub(mraidView, 'createMRAID').callsFake(() => {
                    return Promise.resolve();
                });

                playableMraidAdUnitParams.campaign = playableMraidCampaign;
                playableMraidAdUnitParams.mraid = mraidView;
                playableMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);

                mraidEventHandler.onMraidClick('market://foobar.com');

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                playableMraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                playableMraidAdUnitParams.mraid = mraidView;
                playableMraidAdUnitParams.campaign = playableMraidCampaign;
                playableMraidAdUnitParams.thirdPartyEventManager = thirdPartyEventManager;
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                playableMraidAdUnitParams.operativeEventManager = operativeEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
                sinon.stub(mraidAdUnit, 'sendClick');

                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);
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
                playableMraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
                playableMraidAdUnitParams.campaign = playableMraidCampaign;
                sandbox.stub(HttpKafka, 'sendEvent');
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('MRAIDEventHandler', () => {
                it('should not send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.notCalled(<sinon.SinonStub>HttpKafka.sendEvent);
                });
            });

            describe('PlayableEventHandler', () => {
                it('should send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', {'level': 2});

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = {'level': 2};
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 0;
                    kafkaObject.auctionId = '12345';

                    const resourceUrl = playableMraidCampaign.getResourceUrl();
                    if(resourceUrl) {
                        kafkaObject.url = resourceUrl.getOriginalUrl();
                    }
                    sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
                });

                it('should send a analytics event without extra event data', () => {
                    mraidAdUnit = new MRAIDAdUnit(nativeBridge, playableMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new PlayableEventHandler(nativeBridge, mraidAdUnit, playableMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 5, 'win_screen', undefined);

                    const kafkaObject: any = {};
                    kafkaObject.type = 'win_screen';
                    kafkaObject.eventData = undefined;
                    kafkaObject.timeFromShow = 15;
                    kafkaObject.timeFromPlayableStart = 12;
                    kafkaObject.backgroundTime = 5;
                    kafkaObject.auctionId = '12345';

                    const resourceUrl = playableMraidCampaign.getResourceUrl();
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
        let configuration: Configuration;
        let programmaticMraidAdUnit: MRAIDAdUnit;
        let programmaticMraidEventHandler: MRAIDEventHandler;
        let privacy: AbstractPrivacy;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);
            focusManager = new FocusManager(nativeBridge);
            metaDataManager = new MetaDataManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
            sinon.stub(request, 'followRedirectChain').resolves();
            placement = TestFixtures.getPlacement();
            gdprManager = sinon.createStubInstance(GdprManager);
            privacy = new GDPRPrivacy(nativeBridge, gdprManager, false, true);

            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);
            configuration = TestFixtures.getConfiguration();
            programmaticMraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();
            mraidView = new MRAID(nativeBridge, placement, programmaticMraidCampaign, privacy, true, configuration.getAbGroup());

            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
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
                configuration: configuration,
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new GDPRPrivacy(nativeBridge, gdprManager, false, true),
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
