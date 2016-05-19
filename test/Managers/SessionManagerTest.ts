import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { SessionManager } from '../../src/ts/Managers/SessionManager';
import { VastCampaign } from '../../src/ts/Models/VastCampaign';
import { Placement } from '../../src/ts/Models/Placement';
import { ClientInfo } from '../../src/ts/Models/ClientInfo';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { Request } from '../../src/ts/Utilities/Request';
import { VastAdUnit } from '../../src/ts/AdUnits/VastAdUnit';
import { SessionManagerEventMetadataCreator } from '../../src/ts/Managers/SessionManager';
import { Session } from '../../src/ts/Models/Session';
import { WakeUpManager } from '../../src/ts/Managers/WakeUpManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('SessionManager', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

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
        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);
        let mockMetadataCreator = sinon.mock(metadataCreator);
        mockMetadataCreator.expects('createUniqueEventMetadata').returns(metadataPromise);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

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
        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);
        let mockMetadataCreator = sinon.mock(metadataCreator);
        mockMetadataCreator.expects('createUniqueEventMetadata').returns(metadataPromise);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

        return sessionManager.sendView(adUnit).then(() => {
            mockMetadataCreator.verify();
            mockEventManager.verify();
        });
    });

    it('sends impression events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST impression and creativeView callback URLs should be requested by the event manager
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast impression', '123', 'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130');
        mockEventManager.expects('thirdPartyEvent').withArgs('vast creativeView', '123', 'http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123');

        const metadataPromise = Promise.resolve(['42', {sessionId: '123'}]);
        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);
        let mockMetadataCreator = sinon.mock(metadataCreator);
        mockMetadataCreator.expects('createUniqueEventMetadata').returns(metadataPromise);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

        return sessionManager.sendShow(adUnit).then(() => {
            mockMetadataCreator.verify();
            mockEventManager.verify();
        });
    });

    const testMuteEvent = function (muted: boolean) {
        let eventName = muted ? 'mute' : 'unmute';
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${eventName}`, '123', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

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

    const testQuartileEvent = (quartile: number) => {
        let quartileEventName: string;
        if (quartile === 1) {
            quartileEventName = 'firstQuartile';
        }
        if (quartile === 2) {
            quartileEventName = 'midpoint';
        }
        if (quartile === 3) {
            quartileEventName = 'thirdQuartile';
        }

        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${quartileEventName}`, '123', `http://localhost:3500/brands/14851/${quartileEventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=123`);

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

        const session = new Session('123');
        const quartilePosition = campaign.getVast().getDuration() * 0.25 * quartile * 1000;
        sessionManager.sendProgress(adUnit, session, quartilePosition + 100, quartilePosition - 100);
        mockEventManager.verify();
    };

    it('sends first quartile events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        testQuartileEvent(1);
    });

    it('sends midpoint events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        testQuartileEvent(2);
    });

    it('sends third quartile events from VAST', () => {
        // given a VAST placement
        // when the session manager is told that the video has completed
        // then the VAST complete callback URL should be requested by the event manager
        testQuartileEvent(3);
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        let vastParser = TestFixtures.getVastParser();

        let json = {
            'abGroup': 3,
            'vast': {
                'data': '%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3CVAST%20version%3D%222.0%22%3E%0A%20%20%3CAd%20id%3D%22preroll-1%22%3E%0A%20%20%20%20%3CInLine%3E%0A%20%20%20%20%20%20%3CAdSystem%3E2.0%3C%2FAdSystem%3E%0A%20%20%20%20%20%20%3CAdTitle%3E5748406%3C%2FAdTitle%3E%0A%20%20%20%20%20%20%3CImpression%20id%3D%22blah%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fb.scorecardresearch.com%2Fb%3FC1%3D1%26C2%3D6000003%26C3%3D0000000200500000197000000%26C4%3Dus%26C7%3Dhttp%3A%2F%2Fwww.scanscout.com%26C8%3Dscanscout.com%26C9%3Dhttp%3A%2F%2Fwww.scanscout.com%26C10%3Dxn%26rn%3D-103217130%5D%5D%3E%3C%2FImpression%3E%0A%20%20%20%20%20%20%3CCreatives%3E%0A%20%20%20%20%20%20%20%20%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CLinear%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CDuration%3E00%3A00%3A30%3C%2FDuration%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22creativeView%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Flocalhost%3A3500%2Fbrands%2F14851%2FcreativeView%3FadvertisingTrackingId%3D123456%26androidId%3Daae7974a89efbcfd%26creativeId%3DCrEaTiVeId1%26demandSource%3Dtremor%26gameId%3D14851%26ip%3D192.168.69.69%26token%3D9690f425-294c-51e1-7e92-c23eea942b47%26ts%3D2016-04-21T20%253A46%253A36Z%26value%3D13.1%26zone%3D%25ZONE%25%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22mute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Flocalhost%3A3500%2Fbrands%2F14851%2Fmute%3FadvertisingTrackingId%3D123456%26androidId%3Daae7974a89efbcfd%26creativeId%3DCrEaTiVeId1%26demandSource%3Dtremor%26gameId%3D14851%26ip%3D192.168.69.69%26token%3D9690f425-294c-51e1-7e92-c23eea942b47%26ts%3D2016-04-21T20%253A46%253A36Z%26value%3D13.1%26zone%3D%25ZONE%25%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CTracking%20event%3D%22unmute%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Flocalhost%3A3500%2Fbrands%2F14851%2Funmute%3FadvertisingTrackingId%3D123456%26androidId%3Daae7974a89efbcfd%26creativeId%3DCrEaTiVeId1%26demandSource%3Dtremor%26gameId%3D14851%26ip%3D192.168.69.69%26token%3D9690f425-294c-51e1-7e92-c23eea942b47%26ts%3D2016-04-21T20%253A46%253A36Z%26value%3D13.1%26zone%3D%25ZONE%25%5D%5D%3E%3C%2FTracking%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FTrackingEvents%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CClickThrough%20id%3D%22scanscout%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fwww.target.com%5D%5D%3E%3C%2FClickThrough%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FVideoClicks%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CMediaFile%20height%3D%22396%22%20width%3D%22600%22%20bitrate%3D%22496%22%20type%3D%22video%2Fmp4%22%20delivery%3D%22progressive%22%3E%3C!%5BCDATA%5Bhttp%3A%2F%2Fstatic.applifier.com%2Fimpact%2Fvideos%2F104090%2Fe97394713b8efa50%2F1602-30s-v22r3-seven-knights-character-select%2Fm31-1000.mp4%5D%5D%3E%3C%2FMediaFile%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FMediaFiles%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FLinear%3E%0A%09%3C%2FCreative%3E%0A%09%3CCreative%3E%0A%20%20%20%20%20%20%20%20%20%20%3CCompanionAds%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3CCompanion%20height%3D%22250%22%20width%3D%22300%22%20id%3D%22555750%22%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%3CHTMLResource%3E%3C!%5BCDATA%5B%3CA%20onClick%3D%22var%20i%3D%20new%20Image(1%2C1)%3B%20i.src%3D%27http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D0%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%27%3B%22%20HREF%3D%22http%3A%2F%2Ftarget.com%22%20target%3D%22_blank%22%3E%0A%3CIMG%20SRC%3D%22http%3A%2F%2Fmedia.scanscout.com%2Fads%2Ftarget300x250Companion.jpg%22%20BORDER%3D0%20WIDTH%3D300%20HEIGHT%3D250%20ALT%3D%22Click%20Here%22%3E%0A%3C%2FA%3E%0A%3Cimg%20src%3D%22http%3A%2F%2Fapp.scanscout.com%2Fssframework%2Flog%2Flog.png%3Fa%3Dlogitemaction%26RI%3D555750%26CbC%3D1%26CbF%3Dtrue%26EC%3D1%26RC%3D0%26SmC%3D2%26CbM%3D1.0E-5%26VI%3D736e6b13bad531dc476bc3612749bc35%26admode%3Dpreroll%26PRI%3D-4827170214961170629%26RprC%3D0%26ADsn%3D17%26VcaI%3D192%2C197%26RrC%3D1%26VgI%3D736e6b13bad531dc476bc3612749bc35%26AVI%3D142%26Ust%3Dma%26Uctry%3Dus%26CI%3D1223187%26AC%3D4%26PI%3D567%26Udma%3D506%26ADI%3D5748406%26VclF%3Dtrue%22%20height%3D%221%22%20width%3D%221%22%3E%0A%5D%5D%3E%3C%2FHTMLResource%3E%0A%20%20%20%20%20%20%20%20%20%20%20%20%3C%2FCompanion%3E%0A%20%20%20%20%20%20%20%20%20%20%3C%2FCompanionAds%3E%0A%20%20%20%20%20%20%20%20%3C%2FCreative%3E%0A%20%20%20%20%20%20%3C%2FCreatives%3E%0A%20%20%20%20%3C%2FInLine%3E%0A%20%20%3C%2FAd%3E%0A%3C%2FVAST%3E',
                'tracking': {
                    'click': null,
                    'complete': [
                        'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                    ],
                    'firstQuartile': [
                        'http://localhost:3500/brands/14851/firstQuartile?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                    ],
                    'midpoint': [
                        'http://localhost:3500/brands/14851/midpoint?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                    ],
                    'start': [
                        'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                    ],
                    'thirdQuartile': [
                        'http://localhost:3500/brands/14851/thirdQuartile?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
                    ]
                }
            },
            'gamerId': '5712983c481291b16e1be03b'
        };
        let vast = vastParser.parseVast(json.vast);
        campaign = new VastCampaign(vast, json.gamerId, json.abGroup);

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

        deviceInfo = new DeviceInfo();

        clientInfo = TestFixtures.getClientInfo();
    });

});
