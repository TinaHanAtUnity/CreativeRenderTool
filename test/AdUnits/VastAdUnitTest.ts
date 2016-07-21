import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { VastAdUnit } from '../../src/ts/AdUnits/VastAdUnit';
import { VastCampaign } from '../../src/ts/Models/Vast/VastCampaign';
import { Vast } from '../../src/ts/Models/Vast/Vast';
import { Overlay } from '../../src/ts/Views/Overlay';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { SinonStub } from '~sinon/lib/sinon';

describe('VastAdUnit', () => {

    let sandbox;
    let eventManager: EventManager;
    let adUnit: VastAdUnit;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        eventManager = <EventManager><any> sinon.createStubInstance(EventManager);
        let placement = TestFixtures.getPlacement();
        let vast = new Vast([], [], {});
        let campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
        let overlay = <Overlay><any> sinon.createStubInstance(Overlay);
        let nativeBridge = TestFixtures.getNativeBridge();
        adUnit = new VastAdUnit(nativeBridge, placement, campaign, overlay);
    });

    afterEach(() => sandbox.restore);

    describe('sendTrackingEvent', () => {
        it.skip('should replace "%ZONE%" in the url with the placement id', () => {
            let placement = adUnit.getPlacement();
            let vast = (<VastCampaign> adUnit.getCampaign()).getVast();
            let urlTemplate = 'http://foo.biz/%ZONE%/123';
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);

            adUnit.sendTrackingEvent(eventManager, 'eventName', 'sessionId');

            let stub = <SinonStub> eventManager.thirdPartyEvent;
            let args = stub.firstCall.args;
            sinon.assert.calledOnce(stub);
            assert.equal(args[0], 'vast eventName');
            assert.equal(args[1], 'sessionId');
            assert.equal(args[2], 'http://foo.biz/' + placement.getId() + '/123');
        });
    });

    describe('sendImpressionEvent', () => {
       it.skip('should replace "%ZONE%" in the url with the placement id', () => {
           let placement = adUnit.getPlacement();
           let vast = (<VastCampaign> adUnit.getCampaign()).getVast();
           let urlTemplate = 'http://foo.biz/%ZONE%/456';
           sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);

           adUnit.sendImpressionEvent(eventManager, 'sessionId');

           let stub = <SinonStub> eventManager.thirdPartyEvent;
           let args = stub.firstCall.args;
           sinon.assert.calledOnce(stub);
           assert.equal(args[0], 'vast impression');
           assert.equal(args[1], 'sessionId');
           assert.equal(args[2], 'http://foo.biz/' + placement.getId() + '/456');
       });
    });

    describe('with click through url', () => {
        let vast;

        beforeEach(() => {
            vast = new Vast([], [], {});
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
            let stub = <SinonStub> eventManager.thirdPartyEvent;
            adUnit.sendVideoClickTrackingEvent(eventManager, 'foo');
            sinon.assert.calledTwice(stub);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns([]);
            let stub = <SinonStub> eventManager.thirdPartyEvent;
            adUnit.sendVideoClickTrackingEvent(eventManager, 'foo');
            sinon.assert.notCalled(stub);
        });
    });
});
