import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { EventManager } from '../../src/ts/Managers/EventManager';
import { SessionManager } from '../../src/ts/Managers/SessionManager';
import { VastCampaign } from '../../src/ts/Models/Vast/VastCampaign';
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
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

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

    it('sends video click through tracking event from VAST', () => {
        let wakeUpManager = new WakeUpManager(nativeBridge);
        let request = new Request(nativeBridge, wakeUpManager);
        let eventManager = new EventManager(nativeBridge, request);
        let mockEventManager = sinon.mock(eventManager);
        mockEventManager.expects('thirdPartyEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

        let metadataCreator = new SessionManagerEventMetadataCreator(eventManager, deviceInfo, nativeBridge);

        let sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metadataCreator);
        let adUnit = new VastAdUnit(nativeBridge, placement, campaign, null);

        const session = new Session('123');
        sessionManager.sendVideoClickTracking(adUnit, session);
        mockEventManager.verify();
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        let vastParser = TestFixtures.getVastParser();

        let vastXml = `
            <?xml version="1.0" encoding="UTF-8"?>
            <VAST version="2.0">
              <Ad id="preroll-1">
                <InLine>
                  <AdSystem>2.0</AdSystem>
                  <AdTitle>5748406</AdTitle>
                  <Impression id="blah"><![CDATA[http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130&zone=%ZONE%]]></Impression>
                  <Creatives>
                    <Creative>
                      <Linear>
                        <Duration>00:00:30</Duration>
                        <TrackingEvents>
                          <Tracking event="complete"><![CDATA[http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="firstQuartile"><![CDATA[http://localhost:3500/brands/14851/firstQuartile?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="midpoint"><![CDATA[http://localhost:3500/brands/14851/midpoint?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="start"><![CDATA[http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="thirdQuartile"><![CDATA[http://localhost:3500/brands/14851/thirdQuartile?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="creativeView"><![CDATA[http://localhost:3500/brands/14851/creativeView?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="mute"><![CDATA[http://localhost:3500/brands/14851/mute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                          <Tracking event="unmute"><![CDATA[http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                        </TrackingEvents>
                        <VideoClicks>
                          <ClickThrough id="scanscout"><![CDATA[http://www.target.com]]></ClickThrough>
            <ClickTracking>http://myTrackingURL.com/click</ClickTracking>
                        </VideoClicks>
                        <MediaFiles>
                            <MediaFile height="396" width="600" bitrate="496" type="video/mp4" delivery="progressive"><![CDATA[http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4]]></MediaFile>
                        </MediaFiles>
                      </Linear>
                </Creative>
                <Creative>
                      <CompanionAds>
                        <Companion height="250" width="300" id="555750">
                          <HTMLResource><![CDATA[<A onClick="var i= new Image(1,1); i.src='http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=0&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true';" HREF="http://target.com" target="_blank">
            <IMG SRC="http://media.scanscout.com/ads/target300x250Companion.jpg" BORDER=0 WIDTH=300 HEIGHT=250 ALT="Click Here">
            </A>
            <img src="http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=1&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true" height="1" width="1">
            ]]></HTMLResource>
                        </Companion>
                      </CompanionAds>
                    </Creative>
                  </Creatives>
                </InLine>
              </Ad>
            </VAST>`;

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
