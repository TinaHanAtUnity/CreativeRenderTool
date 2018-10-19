import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ICometTrackingUrlEvents } from 'Performance/Parsers/CometCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from '../../src/ts/Core/Constants/Platform';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';

describe('ThirdPartyEventManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    let focusManager: FocusManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManager;
    let metaDataManager: MetaDataManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

        metaDataManager = new MetaDataManager(core);
        focusManager = new FocusManager(platform, core);
        const wakeUpManager = new WakeUpManager(core);
        request = sinon.createStubInstance(Request);
        (<sinon.SinonStub>request.get).returns(Promise.resolve({}));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
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
        thirdPartyEventManager = new ThirdPartyEventManager(core, request, { '%SDK_VERSION%': '12345' });
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
