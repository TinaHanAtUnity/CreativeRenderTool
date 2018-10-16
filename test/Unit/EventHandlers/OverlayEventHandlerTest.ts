import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { IOperativeSkipEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Overlay } from 'Ads/Views/Overlay';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Privacy } from 'Ads/Views/Privacy';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { KeyCode } from 'Core/Constants/Android/KeyCode';

describe('OverlayEventHandlerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, performanceAdUnit: PerformanceAdUnit;
    let storageBridge: StorageBridge;
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
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        storageBridge = new StorageBridge(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();

        campaign = TestFixtures.getCampaign();
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request, storageBridge);
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: campaign
        });
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        video = new Video('', TestFixtures.getSession());
        const gdprManager = sinon.createStubInstance(GdprManager);
        const privacy = new Privacy(nativeBridge, campaign, gdprManager, false, false);
        const endScreenParams : IEndScreenParameters = {
            nativeBridge: nativeBridge,
            language : deviceInfo.getLanguage(),
            gameId: clientInfo.getGameId(),
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: campaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, campaign);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false, true);
        placement = TestFixtures.getPlacement();
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
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video,
            privacy: privacy,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

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

    describe('When calling onKeyCode', () => {
        beforeEach(() => {
            sinon.spy(overlayEventHandler, 'onOverlaySkip');
            sinon.spy(overlayEventHandler, 'onOverlayClose');
            sinon.stub(placement, 'allowSkipInSeconds').returns(3);
            sinon.stub(performanceAdUnit, 'isShowing').returns(true);
            sinon.stub(performanceAdUnit, 'canPlayVideo').returns(true);

        });

        it('should call onOverlaySkip if video is playing and skipping is allowed', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);

            overlayEventHandler.onKeyEvent(KeyCode.BACK);

            sinon.assert.called(<sinon.SinonSpy>overlayEventHandler.onOverlaySkip);
        });

        it('should not call onOverlaySkip if progress < allowSkipInSeconds', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(2900);

            overlayEventHandler.onKeyEvent(KeyCode.BACK);

            sinon.assert.notCalled(<sinon.SinonSpy>overlayEventHandler.onOverlaySkip);
        });

        it('should not call onOverlaySkip if the key code is wrong', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);

            overlayEventHandler.onKeyEvent(3);

            sinon.assert.notCalled(<sinon.SinonSpy>overlayEventHandler.onOverlaySkip);
        });

        it('should not call onOverlaySkip if skipping is not allowed', () => {
            sinon.stub(placement, 'allowSkip').returns(false);
            sinon.stub(video, 'getPosition').returns(3001);

            overlayEventHandler.onKeyEvent(KeyCode.BACK);

            sinon.assert.notCalled(<sinon.SinonSpy>overlayEventHandler.onOverlaySkip);
        });

        it('should call onOverlayClose if skipEndCardOnClose is enabled', () => {
            sinon.stub(placement, 'allowSkip').returns(true);
            sinon.stub(video, 'getPosition').returns(3001);
            sinon.stub(placement, 'skipEndCardOnClose').returns(true);

            overlayEventHandler.onKeyEvent(KeyCode.BACK);

            sinon.assert.called(<sinon.SinonSpy>overlayEventHandler.onOverlayClose);
            sinon.assert.notCalled(<sinon.SinonSpy>overlayEventHandler.onOverlaySkip);
        });
    });
});
