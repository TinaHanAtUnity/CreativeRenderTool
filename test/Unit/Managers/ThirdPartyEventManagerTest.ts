import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { RequestApi } from 'Native/Api/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Parsers/CometCampaignParser';

class TestRequestApi extends RequestApi {

    public get(id: string, url: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

    public post(id: string, url: string, body?: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

}

describe('ThirdPartyEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let requestApi: TestRequestApi;
    let focusManager: FocusManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let metaDataManager: MetaDataManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
    });

    it('Send successful third party event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('Send click attribution event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    it('should send headers for event', () => {
        const url: string = 'https://www.example.net/third_party_event';
        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url, true).then(() => {
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
        const requestSpy = sinon.spy(request, 'get');
        const urlTemplate = 'http://foo.biz/%ZONE%/123';
        const placement = TestFixtures.getPlacement();
        thirdPartyEventManager.setTemplateValues({ '%ZONE%': placement.getId() });
        thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/' + placement.getId() + '/123', 'Should have replaced %ZONE% from the url');
    });

    it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
        const requestSpy = sinon.spy(request, 'get');
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager.setTemplateValues({ '%SDK_VERSION%': '12345' });
        thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    it('should replace template values given in constructor', () => {
        const requestSpy = sinon.spy(request, 'get');
        const urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request, { '%SDK_VERSION%': '12345' });
        thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
        assert(requestSpy.calledOnce, 'request get should\'ve been called');
        assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
    });

    describe('Sending Performance Tracking Urls', () => {

        let campaign: PerformanceCampaign;
        let sendEventStub: sinon.SinonSpy;

        beforeEach(() => {
            campaign = TestFixtures.getCampaign();
            sendEventStub = sinon.spy(thirdPartyEventManager, 'sendEvent');
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
