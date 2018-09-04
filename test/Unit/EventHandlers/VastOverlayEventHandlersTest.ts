import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { SessionManager } from 'Managers/SessionManager';
import { VastOverlayEventHandler } from 'EventHandlers/VastOverlayEventHandler';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';

import { Placement } from 'Models/Placement';
import { ClientInfo } from 'Models/ClientInfo';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { Request } from 'Utilities/Request';
import { MOAT } from 'Views/MOAT';
import { MoatViewabilityService } from 'Utilities/MoatViewabilityService';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { GdprManager } from 'Managers/GdprManager';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Privacy } from 'Views/Privacy';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

describe('VastOverlayEventHandlersTest', () => {
    let campaign: VastCampaign;
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
    let moat: MOAT;
    let sandbox: sinon.SinonSandbox;
    let privacy: AbstractPrivacy;
    let programmaticTrackingService: ProgrammaticTrackingService;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        campaign = TestFixtures.getEventVastCampaign();
        clientInfo = TestFixtures.getClientInfo();
        privacy = new Privacy(nativeBridge, true);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
        sinon.stub(request, 'followRedirectChain').callsFake((url) => {
            return Promise.resolve(url);
        });

        const configuration = TestFixtures.getConfiguration();
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });

        const gdprManager = sinon.createStubInstance(GdprManager);

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: campaign.getVideo(),
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);

        moat = sinon.createStubInstance(MOAT);
        sandbox.stub(MoatViewabilityService, 'getMoat').returns(moat);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(vastAdUnit, 'hide');

        });

        it('should hide ad unit', () => {
            vastOverlayEventHandler.onOverlaySkip(1);
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });

        describe('When ad unit has an endscreen', () => {
            it('should hide endcard', () => {
                const endScreenPrivacy = new Privacy(nativeBridge, false);
                const vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId(), endScreenPrivacy);
                sinon.spy(vastEndScreen, 'show');
                vastAdUnitParameters.endScreen = vastEndScreen;
                vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
                sinon.spy(vastAdUnit, 'hide');
                vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
                vastOverlayEventHandler.onOverlaySkip(1);
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.show);
            });
        });
    });

    describe('When calling onMute', () => {

        beforeEach(() => {
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
        });

        const testMuteEvent = (muted: boolean) => {
            const eventName = muted ? 'mute' : 'unmute';
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs(`vast ${eventName}`, '12345', `http://localhost:3500/brands/14851/${eventName}?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%`);

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

        it('should call volumeChange when mute is true', () => {
            vastOverlayEventHandler.onOverlayMute(true);
            sinon.assert.called(<sinon.SinonStub>moat.volumeChange);
        });

        it('should call play when mute is false', () => {
            vastOverlayEventHandler.onOverlayMute(false);
            sinon.assert.called(<sinon.SinonStub>moat.volumeChange);
        });
    });

    describe('When calling onCallButton', () => {
        beforeEach(() => {
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            vastOverlayEventHandler = new VastOverlayEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            sinon.stub(vastAdUnit, 'sendVideoClickTrackingEvent').returns(sinon.spy());
        });

        it('should call video click through tracking url', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendVideoClickTrackingEvent);
            });
        });

        it('should open click trough link in iOS web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://foo.com');
            });
        });

        it('should open click trough link in Android web browser when call button is clicked', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch').resolves();
            vastOverlayEventHandler.onOverlayCallButton().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'http://foo.com'
                });
            });
        });
    });
});
