import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { VastOverlayEventHandler } from 'EventHandlers/VastOverlayEventHandler';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';

import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Video } from 'Models/Assets/Video';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { Request } from 'Utilities/Request';

import EventTestVast from 'xml/EventTestVast.xml';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

describe('VastOverlayEventHandlersTest', () => {
    let campaign: VastCampaign;
    let placement: Placement;
    let overlay: Overlay;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let vastAdUnit: VastAdUnit;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let vastOverlayEventHandler: VastOverlayEventHandler;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        const vastParser = TestFixtures.getVastParser();
        const vastXml = EventTestVast;
        const vast = vastParser.parseVast(vastXml);
        campaign = new VastCampaign(vast, '12345', TestFixtures.getSession(), 'gamerId', 1);

        clientInfo = TestFixtures.getClientInfo();

        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

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

        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
        sinon.stub(request, 'followRedirectChain').callsFake((url) => {
            return Promise.resolve(url);
        });

        vastAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: undefined,
            overlay: <Overlay><any>{hide: sinon.spy()},
            video: campaign.getVideo()
        };

        vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(vastAdUnit, 'hide');
            vastOverlayEventHandler.onOverlaySkip(1);
        });

        it('should hide ad unit', () => {
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });

        describe('When ad unit has an endscreen', () => {
            it('should hide endcard', () => {
                const vastEndScreen = <VastEndScreen><any> {
                    show: sinon.spy()
                };
                vastAdUnitParameters.endScreen = vastEndScreen;
                vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
                vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                vastOverlayEventHandler.onOverlaySkip(1);
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            });
        });
    });

    describe('When calling onMute', () => {
        const testMuteEvent = function(muted: boolean) {
            const eventName = muted ? 'mute' : 'unmute';
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs(`vast ${eventName}`, '12345', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=testPlacement`);

            vastOverlayEventHandler.onOverlayMute(muted);
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
        let video: Video;

        beforeEach(() => {
            video = new Video('');
            campaign = <VastCampaign><any>{
                getVast: sinon.spy(),
                getVideo: () => video,
                getSession: () => TestFixtures.getSession()
            };
            overlay = <Overlay><any>{};
            vastAdUnitParameters.campaign = campaign;
            vastAdUnitParameters.overlay = overlay;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
        });

        it('should call video click through tracking url', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
            });
        });

        it('should open click trough link in iOS web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foo.com');
            });
        });

        it('should open click trough link in Android web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'http://foo.com'
                });
            });
        });
    });
});
