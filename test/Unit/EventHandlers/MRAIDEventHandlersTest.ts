import 'mocha';

import * as sinon from 'sinon';

import { MRAIDEventHandler } from 'EventHandlers/MRAIDEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from 'Helpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { Platform } from 'Constants/Platform';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { MetaDataManager } from 'Managers/MetaDataManager';
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
import { ForceQuitManager } from 'Managers/ForceQuitManager';

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
    let mraidAdUnitParameters: IMRAIDAdUnitParameters;
    let mraidEventHandler: MRAIDEventHandler;
    let mraidCampaign: MRAIDCampaign;
    let gdprManager: GdprManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let forceQuitManager: ForceQuitManager;

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
            forceQuitManager = sinon.createStubInstance(ForceQuitManager);

            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
            request = sinon.createStubInstance(Request);
            placement = TestFixtures.getPlacement();

            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);

            request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();

            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            mraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            (<sinon.SinonSpy>mraidView.container).restore();
            sinon.stub(mraidView, 'container').returns(document.createElement('div'));
            gdprManager = sinon.createStubInstance(GdprManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            mraidAdUnitParameters = {
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: mraidCampaign,
                configuration: TestFixtures.getConfiguration(),
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new GDPRPrivacy(nativeBridge, gdprManager, false, true),
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
        });

        it('should send a click with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
        });

        it('should send a view with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
        });

        it('should send a third quartile event with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, { placement: placement, asset: mraidAdUnitParameters.campaign.getResourceUrl() });
        });

        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent, placement.getId());
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                mraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                mraidView = new MRAID(nativeBridge, placement, mraidCampaign, mraidAdUnitParameters.privacy, true);
                sinon.stub(mraidView, 'createMRAID').callsFake(() => {
                    return Promise.resolve();
                });

                mraidAdUnitParameters.campaign = mraidCampaign;
                mraidAdUnitParameters.mraid = mraidView;
                mraidAdUnitParameters.thirdPartyEventManager = thirdPartyEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);

                mraidEventHandler.onMraidClick('market://foobar.com');

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                mraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                (<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent).restore();
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve());
                mraidAdUnitParameters.mraid = mraidView;
                mraidAdUnitParameters.campaign = mraidCampaign;
                mraidAdUnitParameters.thirdPartyEventManager = thirdPartyEventManager;
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                mraidAdUnitParameters.operativeEventManager = operativeEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                sinon.stub(mraidAdUnit, 'sendClick');

                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                mraidEventHandler.onMraidClick('http://example.net');

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });
        });

        describe('with onAnalyticsEvent', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.sandbox.create();
            });

            beforeEach(() => {
                mraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
                mraidAdUnitParameters.campaign = mraidCampaign;
                sandbox.stub(HttpKafka, 'sendEvent');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should send a analytics event', () => {
                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);

                mraidEventHandler.onMraidAnalyticsEvent(15, 12, 0, 'win_screen', {'level': 2});

                const kafkaObject: any = {};
                kafkaObject.type = 'win_screen';
                kafkaObject.eventData = {'level': 2};
                kafkaObject.timeFromShow = 15;
                kafkaObject.timeFromPlayableStart = 12;
                kafkaObject.backgroundTime = 0;
                const resourceUrl = mraidCampaign.getResourceUrl();
                if(resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }
                sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
            });

            it('should send a analytics event without extra event data', () => {
                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                sinon.stub(mraidAdUnit, 'sendClick');
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);

                mraidEventHandler.onMraidAnalyticsEvent(15, 12, 5, 'win_screen', undefined);

                const kafkaObject: any = {};
                kafkaObject.type = 'win_screen';
                kafkaObject.eventData = undefined;
                kafkaObject.timeFromShow = 15;
                kafkaObject.timeFromPlayableStart = 12;
                kafkaObject.backgroundTime = 5;

                const resourceUrl = mraidCampaign.getResourceUrl();
                if(resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }
                sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'ads.sdk2.events.playable.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
            });
        });
    });
});
