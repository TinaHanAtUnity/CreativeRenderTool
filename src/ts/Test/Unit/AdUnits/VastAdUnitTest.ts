import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Placement } from 'Models/Placement';
import { Platform } from 'Constants/Platform';
import { VastEndScreen } from 'Views/VastEndScreen';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastAdUnit', () => {

    let sandbox: sinon.SinonSandbox;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let vastAdUnit: VastAdUnit;
    let campaign: VastCampaign;
    let focusManager: FocusManager;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', TestFixtures.getSession(), 'gamerId', 1);

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

        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        const nativeBridge = TestFixtures.getNativeBridge();
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const activity = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const vastCampaign = new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 12);
        const video = vastCampaign.getVideo();
        const sessionManager = new SessionManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());

        vastAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: activity,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: vastCampaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video
        };

        vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
    });

    afterEach(() => sandbox.restore);

    describe('sendTrackingEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const placement = vastAdUnit.getPlacement();
            const vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            const urlTemplate = 'http://foo.biz/%ZONE%/123';
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendTrackingEvent('eventName', 'sessionId', 1234);

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast eventName', 'sessionId', 'http://foo.biz/' + placement.getId() + '/123');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const placement = vastAdUnit.getPlacement();
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/%ZONE%/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            const vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendTrackingEvent('start', 'sessionId', 1234);

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast start', 'sessionId', 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/' + placement.getId() + '/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=1234');
        });
    });

    describe('sendImpressionEvent', () => {
        let placement: Placement;
        let vast: Vast;

        beforeEach(() => {
            placement = vastAdUnit.getPlacement();
            vast = (<VastCampaign> vastAdUnit.getCampaign()).getVast();
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
        });

        it('should replace "%ZONE%" in the url with the placement id', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent('sessionId', 1234);
            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/456');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version', () => {
            const urlTemplate = 'http://foo.biz/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent('sessionId', 1234);

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast impression', 'sessionId', 'http://foo.biz/1234/456');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent('sessionId', 1234);

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast impression', 'sessionId', 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=1234');
        });

        it('should replace both "%ZONE%" and "%SDK_VERSION%" in the url with corresponding parameters', () => {
            const urlTemplate = 'http://foo.biz/%ZONE%/%SDK_VERSION%/456';
            sandbox.stub(vast, 'getImpressionUrls').returns([ urlTemplate ]);
            vastAdUnit.sendImpressionEvent('sessionId', 1234);

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast impression', 'sessionId', 'http://foo.biz/' + placement.getId() + '/1234/456');
        });
    });

    describe('with click through url', () => {
        let vast: Vast;

        beforeEach(() => {
            vast = new Vast([], []);
            const video = new Video('');
            sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
            campaign = new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 12);
            sinon.stub(campaign, 'getVideo').returns(video);
            const nativeBridge = TestFixtures.getNativeBridge();
            const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = campaign;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
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
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo', 1234);
            sinon.assert.calledTwice(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vast, 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo', 1234);
            sinon.assert.notCalled(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
        });
    });

    describe('VastAdUnit progress event test', () => {

        const testQuartileEvent = (quartile: number, quartileEventName: string) => {
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs(`vast ${quartileEventName}`, '123', `http://localhost:3500/brands/14851/${quartileEventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

            const duration = campaign.getVast().getDuration();
            if(!duration) {
                assert.fail('Missing duration in VAST ad');
            } else {
                const quartilePosition = duration * 0.25 * quartile * 1000;
                vastAdUnit.sendProgressEvents(thirdPartyEventManager, '123', 2000, quartilePosition + 100, quartilePosition - 100);
                mockEventManager.verify();
            }
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
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

            vastAdUnit.sendVideoClickTrackingEvent('123', 1234);
            mockEventManager.verify();
        });
    });

    describe('with companion ad', () => {
        let vast: Vast;
        let vastEndScreen: VastEndScreen;

        beforeEach(() => {
            vast = new Vast([], []);
            const video = new Video('');
            sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
            campaign = new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 12);
            sinon.stub(campaign, 'getVideo').returns(video);
            const nativeBridge = TestFixtures.getNativeBridge();
            const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
            vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = campaign;
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
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

        it('it should fire companion tracking events', () => {
            const width = 320;
            const height = 480;
            const url = 'http://example.com/companionCreativeView';
            const companion = new VastCreativeCompanionAd('foobarCompanion', 'Creative', height, width, 'http://example.com/img.png', 'http://example.com/clickme', {
                'creativeView': [url]
            });
            sandbox.stub(vast, 'getLandscapeOrientedCompanionAd').returns(companion);
            sandbox.stub(vast, 'getPortraitOrientedCompanionAd').returns(companion);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('companion', '123', companion.getEventTrackingUrls('creativeView')[0]);
            vastAdUnit.sendCompanionTrackingEvent('123', 1234);
            mockEventManager.verify();
        });

        it('should hide and then remove endscreen on hide', () => {
            sinon.stub(vastEndScreen, 'hide');
            sinon.stub(vastEndScreen, 'remove');
            vastAdUnit.hide();
            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.hide);
            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.remove);
        });
    });
});
