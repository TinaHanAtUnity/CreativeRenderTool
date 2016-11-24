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
import { Overlay } from 'Views/Overlay';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';
import { Platform } from 'Constants/Platform';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastVideoEventHandlers tests', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let overlay: Overlay;

    it('sends start events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has started
        // then the VAST start callback URL should be requested by the event manager
        const wakeUpManager = new WakeUpManager(nativeBridge);
        const request = new Request(nativeBridge, wakeUpManager);
        const eventManager = new EventManager(nativeBridge, request);
        const mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast impression', '123', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast creativeView', '123', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        const sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, undefined);
        sessionManager.setSession(new Session('123'));
        const videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID), placement, campaign, overlay, null);
        const adUnit = new VastAdUnit(nativeBridge, videoAdUnitController);

        VastVideoEventHandlers.onVideoStart(sessionManager, adUnit);

        mockEventManager.verify();
    });

    it('sends complete events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        const wakeUpManager = new WakeUpManager(nativeBridge);
        const request = new Request(nativeBridge, wakeUpManager);
        const eventManager = new EventManager(nativeBridge, request);
        const mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast complete', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        const sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, undefined);
        sessionManager.setSession(new Session('123'));
        const androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID), placement, campaign, overlay, null);
        const adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        VastVideoEventHandlers.onVideoCompleted(sessionManager, adUnit);
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = new Overlay(nativeBridge, false, 'en');

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
    });

});
