import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { VideoOverlay } from 'Views/VideoOverlay';
import { EventManager } from 'Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Placement } from 'Models/Placement';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Platform } from 'Constants/Platform';
import { VastEndScreen } from 'Views/VastEndScreen';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastAdUnit', () => {

    let sandbox: sinon.SinonSandbox;
    let eventManager: EventManager;
    let vastAdUnit: VastAdUnit;
    let campaign: VastCampaign;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', 'gamerId', 1);

        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });
        const overlay = <VideoOverlay><any>sinon.createStubInstance(VideoOverlay);
        const nativeBridge = TestFixtures.getNativeBridge();
        const wakeUpManager = new WakeUpManager(nativeBridge);
        const request = new Request(nativeBridge, wakeUpManager);
        const adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        eventManager = new EventManager(nativeBridge, request);
        const videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, null);
        vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController);
    });

    afterEach(() => sandbox.restore);

    describe('sendTrackingEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const placement = vastAdUnit.getPlacement();
            const vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            const urlTemplate = 'http://foo.biz/%ZONE%/123';
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            vastAdUnit.sendTrackingEvent(eventManager, 'eventName', 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast eventName', 'sessionId', 'http://foo.biz/' + placement.getId() + '/123');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const placement = vastAdUnit.getPlacement();
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/%ZONE%/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            const vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            vastAdUnit.sendTrackingEvent(eventManager, 'start', 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast start', 'sessionId', 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/' + placement.getId() + '/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=sdkVersion');
        });
    });

    describe('sendImpressionEvent', () => {
        let placement: Placement;
        let vast: Vast;

        beforeEach(() => {
            placement = vastAdUnit.getPlacement();
            vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
        });

        it('should replace "%ZONE%" in the url with the placement id', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');
            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/456');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version', () => {
            const urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/sdkVersion/456');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=sdkVersion');
        });

        it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent(eventManager, 'sessionId', 'sdkVersion');

            sinon.assert.calledOnce(<sinon.SinonSpy>eventManager.thirdPartyEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/sdkVersion/456');
        });
    });

    describe('with click through url', () => {
        let vast: Vast;

        beforeEach(() => {
            vast = new Vast([], []);
            const placement = TestFixtures.getPlacement();
            campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
            const overlay = <VideoOverlay><any> sinon.createStubInstance(VideoOverlay);
            const nativeBridge = TestFixtures.getNativeBridge();
            const adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            const videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, null);
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController);
        });

        it('should return correct http:// url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return correct https:// url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('https://www.example.com/foo/?bar=baz&inga=42&quux');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'https://www.example.com/foo/?bar=baz&inga=42&quux');
        });

        it('should return null for malformed url', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('www.foo.com');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should return null for a deeplink to an app', () => {
            sandbox.stub(vast, 'getVideoClickThroughURL').returns('myapp://details?id=foo');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should call video click tracking url', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns(['https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://wwww.tremor.com/click']);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent(eventManager, 'foo', 'sdkVersion');
            sinon.assert.calledTwice(<sinon.SinonSpy>eventManager.thirdPartyEvent);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(eventManager, 'thirdPartyEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent(eventManager, 'foo', 'sdkVersion');
            sinon.assert.notCalled(<sinon.SinonSpy>eventManager.thirdPartyEvent);
        });
    });

    describe('VastAdUnit progress event test', () => {

        const testQuartileEvent = (quartile: number, quartileEventName: string) => {
            const mockEventManager = sinon.mock(eventManager);
            mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${quartileEventName}`, '123', `http://localhost:3500/brands/14851/${quartileEventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

            const quartilePosition = campaign.getVast().getDuration() * 0.25 * quartile * 1000;
            vastAdUnit.sendProgressEvents(eventManager, '123', 'sdkVersion', quartilePosition + 100, quartilePosition - 100);
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
            const mockEventManager = sinon.mock(eventManager);
            mockEventManager.expects('thirdPartyEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

            vastAdUnit.sendVideoClickTrackingEvent(eventManager, '123', 'sdkVersion');
            mockEventManager.verify();
        });
    });

    describe('with companion ad', () => {
        let vast: Vast;
        let vastEndScreen: VastEndScreen;

        beforeEach(() => {
            vast = new Vast([], []);
            const placement = TestFixtures.getPlacement();
            campaign = new VastCampaign(vast, 'campaignId', 'gamerId', 12);
            const overlay = <VideoOverlay><any> sinon.createStubInstance(VideoOverlay);
            const nativeBridge = TestFixtures.getNativeBridge();
            const adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
            const videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, null);
            vastEndScreen = <VastEndScreen><any> {
                hide: sinon.spy(),
                remove: sinon.spy()
            };
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController, vastEndScreen);
        });

        it('should return correct companion click through url', () => {
            sandbox.stub(vast, 'getCompanionClickThroughUrl').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return null when companion click through url is invalid', () => {
            sandbox.stub(vast, 'getCompanionClickThroughUrl').returns('blah');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, null);
        });

        it('should return endscreen', () => {
            const endScreen = vastAdUnit.getEndScreen();
            assert.equal(endScreen, vastEndScreen);
        });

        it('should hide and then remove endscreen on hide', () => {
            vastAdUnit.hide();
            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.hide);
            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.remove);
        });
    });
});
