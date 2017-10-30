import 'mocha';
/*
import * as sinon from 'sinon';

import { MRAIDEventHandler } from 'EventHandlers/MRAIDEventHandler';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { Platform } from 'Constants/Platform';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { MRAID } from 'Views/MRAID';
import { Placement } from 'Models/Placement';
import { HttpKafka } from 'Utilities/HttpKafka';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';

describe('MRAIDEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, container: AdUnitContainer;
    let sessionManager: SessionManager;
    let mraidAdUnit: MRAIDAdUnit;
    let metaDataManager: MetaDataManager;
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

    describe('with onClick', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID);

            focusManager = new FocusManager(nativeBridge);
            container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));

            metaDataManager = new MetaDataManager(nativeBridge);

            placement = TestFixtures.getPlacement();

            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            request = new Request(nativeBridge, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);

            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge);
            operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.stub(operativeEventManager, 'sendView').returns(resolvedPromise);
            sinon.stub(operativeEventManager, 'sendThirdQuartile').returns(resolvedPromise);
            sinon.stub(nativeBridge.Listener, 'sendClickEvent').returns(Promise.resolve());
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });
            sinon.spy(nativeBridge.Intent, 'launch');

            const mraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
            mraidView = new MRAID(nativeBridge, placement, mraidCampaign);

            mraidAdUnitParameters = {
                forceOrientation: ForceOrientation.LANDSCAPE,
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
                endScreen: undefined
            };

            mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
            mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);

            sinon.stub(mraidAdUnit, 'sendClick');
        });

        it('should send a click with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, mraidAdUnit);
        });

        it('should send a view with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, mraidAdUnit);
        });

        it('should send a third quartile event with session manager', () => {
            mraidEventHandler.onMraidClick('http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, mraidAdUnit);
        });
        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent, placement.getId());
        });

        describe('with follow redirects', () => {

            it('with response that contains location, it should launch intent', () => {
                const mraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                mraidView = new MRAID(nativeBridge, placement, mraidCampaign);
                mraidAdUnitParameters.mraid = mraidView;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);

                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                mraidEventHandler.onMraidClick('market://foobar.com');

                return resolvedPromise.then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': 'market://foobar.com'
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                const mraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                mraidView = new MRAID(nativeBridge, placement, mraidCampaign);
                mraidAdUnitParameters.mraid = mraidView;
                mraidAdUnitParameters.campaign = mraidCampaign;
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
                mraidAdUnitParameters.operativeEventManager = operativeEventManager;

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, mraidAdUnitParameters);
                mraidEventHandler = new MRAIDEventHandler(nativeBridge, mraidAdUnit, mraidAdUnitParameters);
                mraidEventHandler.onMraidClick('http://example.net');

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
            });

        });

        describe('with onAnalyticsEvent', () => {
            let mraidCampaign: MRAIDCampaign;
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.sandbox.create();
            });

            beforeEach(() => {
                mraidCampaign = TestFixtures.getPlayableMRAIDCampaign();

                sandbox.stub(HttpKafka, 'sendEvent');
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should send a analytics event', () => {
                mraidEventHandler.onMraidAnalyticsEvent(15, 12, 'win_screen', {'level': 2});

                const kafkaObject: any = {};
                kafkaObject.type = 'win_screen';
                kafkaObject.eventData = {'level': 2};
                kafkaObject.timeFromShow = 15;
                kafkaObject.timeFromPlayableStart = 12;
                const resourceUrl = mraidCampaign.getResourceUrl();
                if(resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }
                sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'events.playable.json', kafkaObject);
            });

            it('should send a analytics event without extra event data', () => {
                mraidEventHandler.onMraidAnalyticsEvent(15, 12, 'win_screen', undefined);

                const kafkaObject: any = {};
                kafkaObject.type = 'win_screen';
                kafkaObject.eventData = undefined;
                kafkaObject.timeFromShow = 15;
                kafkaObject.timeFromPlayableStart = 12;
                const resourceUrl = mraidCampaign.getResourceUrl();
                if(resourceUrl) {
                    kafkaObject.url = resourceUrl.getOriginalUrl();
                }
                sinon.assert.calledWith(<sinon.SinonStub>HttpKafka.sendEvent, 'events.playable.json', kafkaObject);
            });
        });
    });
});
*/
