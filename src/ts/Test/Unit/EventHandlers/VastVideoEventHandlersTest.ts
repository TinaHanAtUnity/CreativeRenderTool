import 'mocha';
import * as sinon from 'sinon';

import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';
import { EventManager } from 'Managers/EventManager';
import { SessionManager } from 'Managers/SessionManager';
import { Session } from 'Models/Session';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { VideoOverlay } from 'Views/VideoOverlay';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { Platform } from 'Constants/Platform';
import { VastEndScreen } from 'Views/VastEndScreen';
import { AdUnit } from 'Utilities/AdUnit';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastVideoEventHandlers tests', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let adUnit: AdUnit;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let overlay: VideoOverlay;
    let vastEndScreen: VastEndScreen;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let eventManager: EventManager;
    let sessionManager: SessionManager;
    let testAdUnit: VastAdUnit;
    let videoAdUnitController: VideoAdUnitController;

    it('sends start events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has started
        // then the VAST start callback URL should be requested by the event manager
        const mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast impression', '123', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast creativeView', '123', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        VastVideoEventHandlers.onVideoStart(sessionManager, testAdUnit);

        mockEventManager.verify();
    });

    it('sends start events from VAST and custom tracking URLs', () => {
        // given a VAST placement
        // when the session manager is told that the video has started
        // then the VAST start callback URL should be requested by the event manager
        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);

        const customTracking = {
            'start': [
                'http://customTrackingUrl/start',
                'http://customTrackingUrl/start2',
                'http://customTrackingUrl/start3/%ZONE%/blah?sdkVersion=%SDK_VERSION%'
            ]
        };
        const campaignWithTrackers = new VastCampaign(vast, '12345', 'gamerId', 1, 10, customTracking);
        const videoAdUnitCtrl = new VideoAdUnitController(nativeBridge, adUnit, placement, campaignWithTrackers, overlay, null);
        const adUnitWithTrackers = new VastAdUnit(nativeBridge, adUnit, videoAdUnitCtrl);

        const mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://customTrackingUrl/start');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://customTrackingUrl/start2');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://customTrackingUrl/start3/123/blah?sdkVersion=2.0.0-alpha2');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast impression', '123', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast creativeView', '123', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        VastVideoEventHandlers.onVideoStart(sessionManager, adUnitWithTrackers);

        mockEventManager.verify();
    });

    it('sends complete events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        const mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast complete', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        VastVideoEventHandlers.onVideoCompleted(sessionManager, testAdUnit);

        mockEventManager.verify();
    });

    it('should hide ad unit when onVideoCompleted', () => {
        VastVideoEventHandlers.onVideoCompleted(sessionManager, testAdUnit);
        sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
    });

    it('should hide ad unit when onVideoError', () => {
        VastVideoEventHandlers.onVideoError(testAdUnit);
        sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
    });

    describe('with companion ad', () => {
        let vastAdUnit: VastAdUnit;
        beforeEach(() => {
            vastEndScreen = <VastEndScreen><any> {
                show: sinon.spy()
            };
            vastAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController, vastEndScreen);
        });

        it('should show end screen when onVideoCompleted', () => {
            VastVideoEventHandlers.onVideoCompleted(sessionManager, vastAdUnit);

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });

        it('should show end screen when onVideoError', () => {
            VastVideoEventHandlers.onVideoError(vastAdUnit);

            sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            sinon.assert.notCalled(<sinon.SinonSpy>testAdUnit.hide);
        });
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

        overlay = new VideoOverlay(nativeBridge, false, 'en');

        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', 'gamerId', 1);

        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });

        deviceInfo = new DeviceInfo(nativeBridge);

        clientInfo = TestFixtures.getClientInfo();
        wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
        eventManager = new EventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, undefined);
        sessionManager.setSession(new Session('123'));
        videoAdUnitController = new VideoAdUnitController(nativeBridge, adUnit, placement, campaign, overlay, null);
        testAdUnit = new VastAdUnit(nativeBridge, adUnit, videoAdUnitController);
        sinon.spy(testAdUnit, 'hide');
    });

});
