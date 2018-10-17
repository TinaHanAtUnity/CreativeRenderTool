import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { RequestApi } from 'Core/Native/Request';

import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('ThirdPartyEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let focusManager: FocusManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManager;
    let metaDataManager: MetaDataManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
<<<<<<< HEAD:test-old/Unit/Managers/ThirdPartyEventManagerTest.ts
        requestApi = nativeBridge.RequestManager = new TestRequestApi(nativeBridge);
        request = new RequestManager(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new RequestManager(nativeBridge, wakeUpManager);

=======
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = sinon.createStubInstance(Request);
        (<sinon.SinonStub>request.get).returns(Promise.resolve({}));
        // request = new Request(nativeBridge, wakeUpManager);
>>>>>>> master:test/Unit/Managers/ThirdPartyEventManagerTest.ts
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
    });

    it('Send successful third party event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = <sinon.SinonSpy>request.get;

        thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url);
        assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
        assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
    });

    it('Send click attribution event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = <sinon.SinonSpy>request.get;

        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('should send headers for event', () => {
        const url: string = 'https://www.example.net/third_party_event';
        const requestSpy = <sinon.SinonSpy>request.get;

        return thirdPartyEventManager.sendWithGet('click', 'abcde-12345', url, true).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            let userAgentHeaderExists = false;
            for(const header of requestSpy.getCall(0).args[1]) {
                if(header[0] === 'User-Agent') {
                    userAgentHeaderExists = true;
                }
            }
            assert.isTrue(userAgentHeaderExists, 'User-Agent header should exist in headers');
        });
    });

    it('should replace "%ZONE%" in the url with the placement id', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%ZONE%/123';
        const placement = TestFixtures.getPlacement();
        thirdPartyEventManager.setTemplateValues({ '%ZONE%': placement.getId() });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/' + placement.getId() + '/123', 'Should have replaced %ZONE% from the url');
    });

    it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager.setTemplateValues({ '%SDK_VERSION%': '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    it('should replace template values given in constructor', () => {
        const requestSpy = <sinon.SinonSpy>request.get;
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request, { '%SDK_VERSION%': '12345' });
        thirdPartyEventManager.sendWithGet('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    describe('Sending Performance Tracking Urls', () => {

        let campaign: PerformanceCampaign;
        let sendEventStub: sinon.SinonSpy;

        beforeEach(() => {
            campaign = TestFixtures.getCampaign();
            sendEventStub = sinon.spy(thirdPartyEventManager, 'sendWithGet');
        });

        // Currently used events
        [
            ICometTrackingUrlEvents.START,
            ICometTrackingUrlEvents.CLICK,
            ICometTrackingUrlEvents.FIRST_QUARTILE,
            ICometTrackingUrlEvents.MIDPOINT,
            ICometTrackingUrlEvents.THIRD_QUARTILE,
            ICometTrackingUrlEvents.ERROR,
            ICometTrackingUrlEvents.LOADED_IMPRESSION,
            ICometTrackingUrlEvents.COMPLETE,
            ICometTrackingUrlEvents.SKIP
        ].forEach((event) =>
            it(`should send the tracking event: ${event}`, () => {
                return thirdPartyEventManager.sendPerformanceTrackingEvent(campaign, event).then(() => {
                    sinon.assert.calledWith(sendEventStub, event, campaign.getSession().getId(), campaign.getTrackingUrls()[event][0]);
                }).catch(() => {
                    assert.fail(`Tracking url was not sent for event: ${event}`);
                });
            })
        );

        // Currently unused events
        [
            ICometTrackingUrlEvents.ENDCARD_CLICK,
            ICometTrackingUrlEvents.STALLED,
            ICometTrackingUrlEvents.SHOW
        ].forEach((event) =>
            it(`should not send the tracking event: ${event}`, () => {
                return thirdPartyEventManager.sendPerformanceTrackingEvent(campaign, event).then(() => {
                    assert.fail(`Tracking url was sent for ${event}`);
                }).catch(() => {
                    // Pass
                });
            })
        );

        afterEach(() => {
            sendEventStub.restore();
        });
    });
});
