import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { VastAdUnit } from '../../src/ts/AdUnits/VastAdUnit';
import { VastCampaign } from '../../src/ts/Models/Vast/VastCampaign';
import { Vast } from '../../src/ts/Models/Vast/Vast';
import { Overlay } from '../../src/ts/Views/Overlay';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from '../../src/ts/Utilities/Request';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';

describe('VastAdUnit', () => {

    let sandbox;
    let eventManager;
    let adUnit: VastAdUnit;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        let placement = TestFixtures.getPlacement();
        let vast = new Vast([], []);
        let campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
        let overlay = <Overlay><any> sinon.createStubInstance(Overlay);
        let nativeBridge = TestFixtures.getNativeBridge();
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        eventManager = new EventManager(nativeBridge, request);
        adUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);
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

            sinon.assert.calledOnce(eventManager.thirdPartyEvent);
            sinon.assert.calledWith(eventManager.thirdPartyEvent, 'vast eventName', 'sessionId', 'http://foo.biz/' + placement.getId() + '/123');
        });
    });

    describe('sendImpressionEvent', () => {
       it('should replace "%ZONE%" in the url with the placement id', () => {
           let placement = adUnit.getPlacement();
           let vast = (<VastCampaign> adUnit.getCampaign()).getVast();
           let urlTemplate = 'http://foo.biz/%ZONE%/456';
           sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
           sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
           adUnit.sendImpressionEvent(eventManager, 'sessionId');

           sinon.assert.calledOnce(eventManager.thirdPartyEvent);
           sinon.assert.calledWith(eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/456');
       });
    });

    describe('with click through url', () => {
        let vast;

        beforeEach(() => {
            vast = new Vast([], []);
            let placement = TestFixtures.getPlacement();
            let campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
            let overlay = <Overlay><any> sinon.createStubInstance(Overlay);
            let nativeBridge = TestFixtures.getNativeBridge();
            adUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);
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
            sinon.assert.calledTwice(eventManager.thirdPartyEvent);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            adUnit.sendVideoClickTrackingEvent(eventManager, 'foo');
            sinon.assert.notCalled(eventManager.thirdPartyEvent);
        });
    });
});
