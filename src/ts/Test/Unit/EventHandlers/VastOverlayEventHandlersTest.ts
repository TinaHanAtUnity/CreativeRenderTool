import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { VastOverlayEventHandlers } from 'EventHandlers/VastOverlayEventHandlers';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EventManager } from 'Managers/EventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';

import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { Session } from 'Models/Session';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Video } from 'Models/Video';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastOverlayEventHandlersTest', () => {
    let campaign: VastCampaign;
    let placement: Placement;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let overlay: Overlay;

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, testAdUnit: VastAdUnit;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        const vastParser = TestFixtures.getVastParser();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', 'gamerId', 1);

        overlay = new Overlay(nativeBridge, false, 'en');
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));

        placement = new Placement({
            id: 'testPlacement',
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
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), new EventManager(nativeBridge, new Request(nativeBridge, new WakeUpManager(nativeBridge))));
        sessionManager.setSession(new Session('123'));

        testAdUnit = new VastAdUnit(nativeBridge, container, placement, campaign, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(testAdUnit, 'hide');
            VastOverlayEventHandlers.onSkip(testAdUnit);
        });

        it('should hide ad unit', () => {
            sinon.assert.called(<sinon.SinonSpy>testAdUnit.hide);
        });

        describe('When ad unit has an endscreen', () => {
            it('should hide endcard', () => {
                const vastEndScreen = <VastEndScreen><any> {
                    show: sinon.spy()
                };
                const vastAdUnit = new VastAdUnit(nativeBridge, container, placement, campaign, <Overlay><any>{hide: sinon.spy()}, TestFixtures.getDeviceInfo(Platform.ANDROID), null, vastEndScreen);
                VastOverlayEventHandlers.onSkip(vastAdUnit);
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            });
        });
    });

    describe('When calling onMute', () => {
        const testMuteEvent = function (muted: boolean) {
            const eventName = muted ? 'mute' : 'unmute';
            const mockEventManager = sinon.mock(sessionManager.getEventManager());
            mockEventManager.expects('thirdPartyEvent').withArgs(`vast ${eventName}`, '123', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=testPlacement`);

            VastOverlayEventHandlers.onMute(sessionManager, testAdUnit, muted);
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
    });

    describe('When calling onCallButton', () => {
        let vastAdUnit: VastAdUnit;
        let video: Video;

        beforeEach(() => {
            video = new Video('');
            vastAdUnit = new VastAdUnit(nativeBridge, container, TestFixtures.getPlacement(), <VastCampaign><any>{
                getVast: sinon.spy(),
                getVideo: () => video
            }, <Overlay><any>{}, TestFixtures.getDeviceInfo(Platform.ANDROID), null);
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
            sinon.stub(sessionManager, 'getSession').returns({getId: sinon.spy()});
        });

        it('should call video click through tracking url', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
        });

        it('should open click trough link in iOS web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foo.com');
        });

        it('should open click trough link in Android web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            VastOverlayEventHandlers.onCallButton(nativeBridge, sessionManager, vastAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': 'http://foo.com'
            });
        });
    });
});
