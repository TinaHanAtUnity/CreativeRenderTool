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

import EventTestVast from 'xml/EventTestVast.xml';


describe('VastAdUnit', () => {

    let sandbox: sinon.SinonSandbox;
    let eventManager: EventManager;
    let adUnit: VastAdUnit;
    let campaign: VastCampaign;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        let vastParser = TestFixtures.getVastParser();

        let vastXml = EventTestVast;

        let vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', 'gamerId', 1);

        let placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });
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

    describe('VastAdUnit progress event test', () => {

        const testQuartileEvent = (quartile: number, quartileEventName: string) => {
            let mockEventManager = sinon.mock(eventManager);
            mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${quartileEventName}`, '123', `http://localhost:3500/brands/14851/${quartileEventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

            const quartilePosition = campaign.getVast().getDuration() * 0.25 * quartile * 1000;
            adUnit.sendProgressEvents(eventManager, '123', quartilePosition + 100, quartilePosition - 100);
            mockEventManager.verify();
        };

        it('sends first quartile events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has completed
            // then the VAST complete callback URL should be requested by the event manager
            testQuartileEvent(1, 'firstQuartile');
        });

        it('sends midpoint events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has completed
            // then the VAST complete callback URL should be requested by the event manager
            testQuartileEvent(2, 'midpoint');
        });

        it('sends third quartile events from VAST', () => {
            // given a VAST placement
            // when the session manager is told that the video has completed
            // then the VAST complete callback URL should be requested by the event manager
            testQuartileEvent(3, 'thirdQuartile');
        });

        it('sends video click through tracking event from VAST', () => {
            let mockEventManager = sinon.mock(eventManager);
            mockEventManager.expects('thirdPartyEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

            adUnit.sendVideoClickTrackingEvent(eventManager, '123')
            mockEventManager.verify();
        });
    });
});


