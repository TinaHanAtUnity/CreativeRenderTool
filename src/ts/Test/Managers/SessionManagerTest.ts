import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { EventManager } from 'Managers/EventManager';
import { SessionManager } from 'Managers/SessionManager';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { SessionManagerEventMetadataCreator } from 'Managers/SessionManager';
import { Session } from 'Models/Session';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { AndroidVideoAdUnitController } from 'AdUnits/AndroidVideoAdUnitController';

import SessionManagerVast from 'xml/SessionManagerVast.xml';

describe('SessionManager', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
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
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast start', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        const metadataPromise = Promise.resolve(['42', {sessionId: '123'}]);
        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);
        let mockMetadataCreator = sinon.mock(metadataCreator);
        mockMetadataCreator.expects('createUniqueEventMetadata').returns(metadataPromise);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let videoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, videoAdUnitController);

        return sessionManager.sendStart(adUnit).then(() => {
            mockMetadataCreator.verify();
            mockEventManager.verify();
        });
    });

    it('sends complete events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast complete', '123', 'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        const metadataPromise = Promise.resolve(['42', {sessionId: '123'}]);
        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);
        let mockMetadataCreator = sinon.mock(metadataCreator);
        mockMetadataCreator.expects('createUniqueEventMetadata').returns(metadataPromise);
        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        return sessionManager.sendView(adUnit).then(() => {
            mockMetadataCreator.verify();
            mockEventManager.verify();
        });
    });

    it('sends impression and creativeView events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST impression and creativeView callback URLs should be requested by the event manager
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast impression', '123', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=123');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast creativeView', '123', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager);
        sessionManager.setSession(new Session('123'));
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        sessionManager.sendImpressionEvent(adUnit);

        mockEventManager.verify();
    });

    const testMuteEvent = function (muted: boolean) {
        let eventName = muted ? 'mute' : 'unmute';
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${eventName}`, '123', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        sessionManager.sendMute(adUnit, new Session('123'), muted);
        mockEventManager.verify();
    };

    it('sends mute events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has been muted
        // then the VAST mute callback URL should be requested by the event manager
        testMuteEvent(true);
    });

    it('sends unmute events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has been unmuted
        // then the VAST unmute callback URL should be requested by the event manager
        testMuteEvent(false);
    });

    const testQuartileEvent = (quartile: number, quartileEventName: string) => {
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${quartileEventName}`, '123', `http://localhost:3500/brands/14851/${quartileEventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        const session = new Session('123');
        const quartilePosition = campaign.getVast().getDuration() * 0.25 * quartile * 1000;
        sessionManager.sendProgress(adUnit, session, quartilePosition + 100, quartilePosition - 100);
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
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, clientInfo, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let androidVideoAdUnitController = new AndroidVideoAdUnitController(nativeBridge, placement, campaign, overlay, null);
        let adUnit = new VastAdUnit(nativeBridge, androidVideoAdUnitController);

        const session = new Session('123');
        sessionManager.sendVideoClickTracking(adUnit, session);
        mockEventManager.verify();
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = new Overlay(nativeBridge, false, 'en');

        let vastParser = TestFixtures.getVastParser();

        let vastXml = SessionManagerVast;

        let vast = vastParser.parseVast(vastXml);
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
