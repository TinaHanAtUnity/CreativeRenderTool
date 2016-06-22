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
        it('should replace "%ZONE%" in the url with the placement id', () => {
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
       it('should replace "%ZONE%" in the url with the placement id', () => {
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
});
