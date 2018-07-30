import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { OverlayEventHandler } from 'EventHandlers/OverlayEventHandler';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager, IOperativeSkipEventParams } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { Placement } from 'Models/Placement';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { Configuration } from 'Models/Configuration';
import { Privacy } from 'Views/Privacy';
import { GdprManager } from 'Managers/GdprManager';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { ForceQuitManager } from 'Managers/ForceQuitManager';

describe('OverlayEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;
    let endScreen: PerformanceEndScreen;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let overlay: Overlay;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let overlayEventHandler: OverlayEventHandler<PerformanceCampaign>;
    let campaign: PerformanceCampaign;
    let placement: Placement;
    let configuration: Configuration;
    let forceQuitManager: ForceQuitManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        forceQuitManager = sinon.createStubInstance(ForceQuitManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        configuration = TestFixtures.getConfiguration();

        campaign = TestFixtures.getCampaign();
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
        video = new Video('', TestFixtures.getSession());

        const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
        endScreen = new PerformanceEndScreen(nativeBridge, campaign, deviceInfo.getLanguage(), clientInfo.getGameId(), privacy, false);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
        placement = TestFixtures.getPlacement();
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        performanceAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video,
            privacy: privacy,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };
        sinon.stub(performanceAdUnitParameters.campaign, 'getAbGroup').returns(5);

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        overlayEventHandler = new OverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
    });

    describe('When calling onSkip', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'pause');
            sinon.spy(operativeEventManager, 'sendSkip');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');

            overlayEventHandler.onOverlaySkip(1);
        });

        it('should pause video player', () => {
            sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.pause);
        });

        it('should set video inactive', () => {
            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finish state', () => {
            assert.equal(performanceAdUnit.getFinishState(), FinishState.SKIPPED);
        });

        it('should send skip', () => {
            const params: IOperativeSkipEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo(),
                videoProgress: performanceAdUnit.getVideo().getPosition()
            };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendSkip, params);
        });

        it('should call reconfigure', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
        });

        it('should hide overlay', () => {
            sinon.assert.called(<sinon.SinonSpy>overlay.hide);
        });
    });

    describe('When calling onMute', () => {
        beforeEach(() => {
            sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
        });

        it('should set volume to zero when muted', () => {
            overlayEventHandler.onOverlayMute(true);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0));
        });

        it('should set volume to 1 when not muted', () => {
            overlayEventHandler.onOverlayMute(false);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1));
        });
    });

});
