import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { Overlay } from 'Views/Overlay';
import { EventManager } from 'Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Placement } from 'Models/Placement';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';

describe('VastAdUnit', () => {

    let sandbox: sinon.SinonSandbox;
    let eventManager: EventManager;
    let adUnit: VastAdUnit;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        let placement = TestFixtures.getPlacement();
        let vast = new Vast([], []);
        let campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
        let overlay = <Overlay><any>sinon.createStubInstance(Overlay);
        let nativeBridge = TestFixtures.getNativeBridge();
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        eventManager = new EventManager(nativeBridge, request);
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);
    });

    afterEach(() => sandbox.restore);

    describe('sendTrackingEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            let placement = adUnit.getPlacement();
            let vast = (<VastCampaign> adUnit.getCampaign()).getVast();
            let urlTemplate = 'http://foo.biz/%ZONE%/123';
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            adUnit.sendTrackingEvent(eventManager, 'eventName', 'sessionId');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast eventName', 'sessionId', 'http://foo.biz/' + placement.getId() + '/123');
        });
    });

    describe('sendImpressionEvent', () => {
        let placement: Placement;
        let vast: Vast;

        beforeEach(() => {
            placement = adUnit.getPlacement();
            vast = (<VastCampaign> adUnit.getCampaign()).getVast();
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
        });

        it('should replace "%ZONE%" in the url with the placement id', () => {
            let urlTemplate = 'http://foo.biz/%ZONE%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            adUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');
            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/456');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version', () => {
            let urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            adUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/sdkVersion/456');
        });

        it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', () => {
            let urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            adUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/sdkVersion/456');
        });
    });

    describe('with click through url', () => {
        let vast: Vast;

        beforeEach(() => {
            vast = new Vast([], []);
            let placement = TestFixtures.getPlacement();
            let campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
            let overlay = <Overlay><any> sinon.createStubInstance(Overlay);
            let nativeBridge = TestFixtures.getNativeBridge();
            let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
            adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);
        });

        it('should return correct http:// url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('http://www.example.com/wpstyle/?p=364');

            let clickThroughURL = adUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return correct https:// url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('https://www.example.com/foo/?bar=baz&inga=42&quux');
            let clickThroughURL = adUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'https://www.example.com/foo/?bar=baz&inga=42&quux');
        });

        it('should return null for malformed url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('www.foo.com');
            let clickThroughURL = adUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should return null for a deeplink to an app', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('myapp://details?id=foo');
            let clickThroughURL = adUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should call video click tracking url', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns(['https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://wwww.tremor.com/click']);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            adUnit.sendVideoClickTrackingEvent(eventManager, 'foo');
            sinon.assert.calledTwice(<sinon.SinonSpy>eventManager.thirdPartyEvent);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            adUnit.sendVideoClickTrackingEvent(eventManager, 'foo');
            sinon.assert.notCalled(<sinon.SinonSpy>eventManager.thirdPartyEvent);
        });
    });
});
