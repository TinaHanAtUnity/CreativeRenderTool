import 'mocha';
import * as sinon from 'sinon';

import { MRAIDEventHandlers } from 'EventHandlers/MRAIDEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { EventManager } from 'Managers/EventManager';
import { Request, INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { Platform } from 'Constants/Platform';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Activity } from 'AdUnits/Containers/Activity';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { MRAID } from 'Views/MRAID';
import { Placement } from 'Models/Placement';
import { HttpKafka } from 'Utilities/HttpKafka';
import { FocusManager } from 'Managers/FocusManager';

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

            sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge),
                new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager))), metaDataManager);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);
            sinon.stub(sessionManager, 'sendView').returns(resolvedPromise);
            sinon.stub(sessionManager, 'sendThirdQuartile').returns(resolvedPromise);
            sinon.stub(nativeBridge.Listener, 'sendClickEvent').returns(Promise.resolve());
            sinon.stub(request, 'followRedirectChain').callsFake((url) => {
                return Promise.resolve(url);
            });
            sinon.spy(nativeBridge.Intent, 'launch');

            const mraidCampaign = TestFixtures.getPlayableMRAIDCampaign();
            mraidView = new MRAID(nativeBridge, placement, mraidCampaign);

            mraidAdUnit = new MRAIDAdUnit(nativeBridge, container, sessionManager, placement, mraidCampaign, mraidView, {});

            sinon.stub(mraidAdUnit, 'sendClick');
        });

        it('should send a click with session manager', () => {
            MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendClick, mraidAdUnit);
        });

        it('should send a view with session manager', () => {
            MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendView, mraidAdUnit);
        });

        it('should send a third quartile event with session manager', () => {
            MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>sessionManager.sendThirdQuartile, mraidAdUnit);
        });
        it('should send a native click event', () => {
            MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent, placement.getId());
        });

        describe('with follow redirects', () => {

            it('with response that contains location, it should launch intent', () => {
                const mraidCampaign = TestFixtures.getPlayableMRAIDCampaignFollowsRedirects();
                mraidView = new MRAID(nativeBridge, placement, mraidCampaign);

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, container, sessionManager, placement, mraidCampaign, mraidView, {});

                sinon.stub(sessionManager.getEventManager(), 'clickAttributionEvent').returns(Promise.resolve({
                    url: 'http://foo.url.com',
                    response: 'foo response',
                    responseCode: 200,
                    headers: [['location', 'market://foobar.com']]
                }));

                MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

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

                mraidAdUnit = new MRAIDAdUnit(nativeBridge, container, sessionManager, placement, mraidCampaign, mraidView, {});

                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>sessionManager.sendClick).restore();
                sinon.stub(sessionManager, 'sendClick').returns(resolvedPromise);

                MRAIDEventHandlers.onClick(nativeBridge, mraidAdUnit, sessionManager, request, 'http://example.net');

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
                });
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
            MRAIDEventHandlers.onAnalyticsEvent(mraidCampaign, 15, 12, 'win_screen', {'level': 2});

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
            MRAIDEventHandlers.onAnalyticsEvent(mraidCampaign, 15, 12, 'win_screen', undefined);

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
