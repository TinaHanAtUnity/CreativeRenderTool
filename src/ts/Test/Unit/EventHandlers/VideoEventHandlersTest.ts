import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { VideoEventHandlers } from 'EventHandlers/VideoEventHandlers';
import { Double } from 'Utilities/Double';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { SessionManager } from 'Managers/SessionManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request } from 'Utilities/Request';
import { Overlay } from 'Views/Overlay';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { Placement } from 'Models/Placement';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'AdUnits/XPromoAdUnit';
import { XPromoEndScreen } from 'Views/XPromoEndScreen';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { Campaign } from 'Models/Campaign';
import { XPromoOperativeEventManager } from 'Managers/XPromoOperativeEventManager';

describe('VideoEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: PerformanceEndScreen;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let sessionManager: SessionManager;
    let video: Video;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let operativeEventManagerParams: IOperativeEventManagerParams<Campaign>;
    let comScoreService: ComScoreTrackingService;
    let spyComScore: sinon.SinonSpy;
    let placement: Placement;
    let performanceCampaign: PerformanceCampaign;
    let vastCampaign: VastCampaign;
    let xPromoCampaign: XPromoCampaign;
    let xPromoAdUnitParameters: IXPromoAdUnitParameters;
    let xPromoEndScreen: XPromoEndScreen;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        const configuration = TestFixtures.getConfiguration();

        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        vastCampaign = TestFixtures.getEventVastCampaign();
        performanceCampaign = TestFixtures.getCampaign();

        operativeEventManagerParams = {
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: performanceCampaign
        };

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);

        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
        video = new Video('', TestFixtures.getSession());

        placement = TestFixtures.getPlacement();
        overlay = new Overlay(nativeBridge, false, 'en', configuration.getGamerId(), configuration.getAbGroup());
        endScreen = new PerformanceEndScreen(nativeBridge, performanceCampaign, true, 'en', '12345');

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: placement,
            campaign: vastCampaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video
        };

        performanceAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: performanceCampaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video
        };

        xPromoCampaign = TestFixtures.getXPromoCampaign();
        xPromoEndScreen = new XPromoEndScreen(nativeBridge, xPromoCampaign, true, 'en', '12345');
        xPromoAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: xPromoCampaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: xPromoEndScreen,
            overlay: overlay,
            video: video
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        sinon.stub(performanceAdUnit, 'isPrepareCalled').returns(true);
        sinon.stub(performanceAdUnitParameters.campaign, 'getAbGroup').returns(5);
        spyComScore = sinon.spy(comScoreService, 'sendEvent');
    });

    afterEach(() => {
        spyComScore.restore();
    });

    describe('with onVideoPlay', () => {
        it('should set progress interval', () => {
            sinon.stub(nativeBridge.VideoPlayer, 'setProgressEventInterval').returns(Promise.resolve(void(0)));
            VideoEventHandlers.onVideoPlay(nativeBridge, performanceAdUnit);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setProgressEventInterval, performanceAdUnit.getProgressInterval());
        });
    });

    describe('with video start', () => {
        beforeEach(() => {
            video = new Video('', TestFixtures.getSession());
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        });

        it('should set video started', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 1, TestFixtures.getConfiguration(), performanceCampaign, placement);

            assert.isTrue(performanceAdUnit.getVideo().hasStarted());
        });

        it('should send start event to backend', () => {
            sinon.spy(operativeEventManager, 'sendStart');

            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 1, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendStart, placement);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 1, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, placement.getId());
        });

        it('should send comscore play event', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 1, TestFixtures.getConfiguration(), performanceCampaign, placement);

            const positionAtSkip = performanceAdUnit.getVideo().getPosition();
            const comScoreDuration = (performanceAdUnit.getVideo().getDuration()).toString(10);
            const sessionId = performanceCampaign.getSession().getId();
            const creativeId = performanceCampaign.getCreativeId();
            const category = undefined;
            const subCategory = undefined;
            sinon.assert.calledWith(<sinon.SinonSpy>comScoreService.sendEvent, 'play', sessionId, comScoreDuration, positionAtSkip, creativeId, category, subCategory);
        });
    });

    describe('with onVideoProgress', () => {
        beforeEach(() => {
            sinon.spy(performanceAdUnit.getVideo(), 'setPosition');
            sinon.spy(overlay, 'setVideoProgress');
        });

        it('with positive position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 5, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, -5, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send first quartile event', () => {
            sinon.spy(operativeEventManager, 'sendFirstQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(4000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 6000, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendFirstQuartile, placement);
        });

        it('should send midpoint event', () => {
            sinon.spy(operativeEventManager, 'sendMidpoint');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 11000, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendMidpoint, placement);
        });

        it('should send third quartile event', () => {
            sinon.spy(operativeEventManager, 'sendThirdQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            VideoEventHandlers.onVideoProgress(nativeBridge, operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, 16000, TestFixtures.getConfiguration(), performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, placement);
        });
    });

    describe('with onVideoCompleted', () => {
        let prom: Promise<boolean>;

        beforeEach(() => {
            prom = Promise.resolve(false);

            sinon.spy(nativeBridge, 'invoke');
            sinon.spy(operativeEventManager, 'sendView');
            sinon.spy(overlay, 'hide');
        });

        it('should set video to inactive', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, performanceCampaign, placement);

            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finnish state to COMPLETED', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, performanceCampaign, placement);

            assert.equal(performanceAdUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, performanceCampaign, placement);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, placement);
        });

        it('should hide overlay', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, performanceCampaign, placement);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
        });

        it('should send comscore end event', () => {
            VideoEventHandlers.onVideoCompleted(operativeEventManager, thirdPartyEventManager, comScoreService, performanceAdUnit, performanceCampaign, placement);
            const positionAtSkip = performanceAdUnit.getVideo().getPosition();
            const comScoreDuration = (performanceAdUnit.getVideo().getDuration()).toString(10);
            const sessionId = performanceCampaign.getSession().getId();
            const creativeId = performanceCampaign.getCreativeId();
            const category = undefined;
            const subCategory = undefined;
            sinon.assert.calledWith(<sinon.SinonSpy>comScoreService.sendEvent, 'end', sessionId, comScoreDuration, positionAtSkip, creativeId, category, subCategory);
        });

        it('should send view event to HttpKafka on XPromos', () => {
            operativeEventManagerParams.campaign = TestFixtures.getXPromoCampaign();
            const xPromoOperativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            sinon.spy(xPromoOperativeEventManager, 'sendView');
            sinon.spy(xPromoOperativeEventManager, 'sendHttpKafkaEvent');

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);

            VideoEventHandlers.onVideoCompleted(xPromoOperativeEventManager, thirdPartyEventManager, comScoreService, xPromoAdUnit, xPromoAdUnitParameters.campaign, placement);

            sinon.assert.notCalled(<sinon.SinonSpy>comScoreService.sendEvent);
            sinon.assert.notCalled(<sinon.SinonSpy>xPromoOperativeEventManager.sendView);
            sinon.assert.calledWith(<sinon.SinonSpy>xPromoOperativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoview.v1.json', 'view', placement, xPromoAdUnit.getVideoOrientation());
        });
    });

    describe('with onVideoPrepared', () => {
        let seekResolved: Promise<void>, volumeResolved: Promise<void>;

        beforeEach(() => {
            seekResolved = Promise.resolve(void(0));
            volumeResolved = Promise.resolve(void(0));

            sinon.stub(nativeBridge.VideoPlayer, 'seekTo').returns(seekResolved);
            sinon.stub(nativeBridge.VideoPlayer, 'setVolume').returns(volumeResolved);
            sinon.spy(nativeBridge.VideoPlayer, 'play');
        });

        it('should set video duration for overlay', () => {
            sinon.stub(overlay, 'setVideoDuration');

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            return volumeResolved.then(() => {
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            performanceAdUnit.getVideo().setPosition(123);

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessageVisible');
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessageVisible, true);

            stub.restore();
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessage');

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Performance Ad');

            stub.restore();
        });

        it('should set debug message to programmatic ad if the ad unit is VAST', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            const vast = new Vast([], []);
            sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
            vastCampaign = TestFixtures.getEventVastCampaign();
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            operativeEventManagerParams.campaign = vastCampaign;
            vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, vastCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Programmatic Ad');

            stub.restore();
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(false);
            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setDebugMessage);

            stub.restore();
        });

        it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', () => {
            sinon.stub(overlay, 'setCallButtonVisible');

            vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            operativeEventManagerParams.campaign = vastCampaign;
            vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, vastCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setCallButtonVisible, true);
        });

        it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', () => {
            sinon.stub(overlay, 'setCallButtonVisible');

            vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            operativeEventManagerParams.campaign = vastCampaign;
            vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, vastCampaign);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should not set call button visibility to true if the ad unit is not VAST', () => {
            sinon.stub(overlay, 'setCallButtonVisible');

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setCallButtonVisible);
        });

        it('should set fade enabled to false if the ad unit is VAST and has a click trough URL', () => {
            sinon.stub(overlay, 'setFadeEnabled');

            vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            operativeEventManagerParams.campaign = vastCampaign;
            vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, vastCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setFadeEnabled, false);
        });

        it('should not set fade enabled to false if the ad unit is VAST but there is no click trough URL', () => {
            sinon.stub(overlay, 'setFadeEnabled');

            vastCampaign = <VastCampaign><any>{
                getVideo: () => video
            };
            vastAdUnitParameters.campaign = vastCampaign;
            operativeEventManagerParams.campaign = vastCampaign;
            vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'isPrepareCalled').returns(true);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
            VideoEventHandlers.onVideoPrepared(nativeBridge, vastAdUnit, 10, vastCampaign);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setFadeEnabled);
        });

        it('should fade out overlay controls if the ad unit is not VAST', () => {
            sinon.stub(overlay, 'setFadeEnabled');

            VideoEventHandlers.onVideoPrepared(nativeBridge, performanceAdUnit, 10, performanceCampaign);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setFadeEnabled);
        });

        it('should set debug message to xpromo ad if the ad unit is XPromoAdUnit', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            xPromoAdUnit.setPrepareCalled(true);
            VideoEventHandlers.onVideoPrepared(nativeBridge, xPromoAdUnit, 10, xPromoCampaign);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'XPromo');

            stub.restore();
        });
    });

    describe('with onPrepareError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.stub(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error', () => {
            VideoEventHandlers.onPrepareError(nativeBridge, performanceAdUnit, performanceCampaign, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.hide);
        });
    });

    describe('with onAndroidGenericVideoError', () => {
        let sandbox: sinon.SinonSandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            sandbox.stub(Diagnostics, 'trigger');
            sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
            sinon.stub(performanceAdUnit, 'hide');
            sinon.spy(container, 'reconfigure');
            sinon.spy(overlay, 'hide');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error, video started', () => {
            performanceAdUnit.getVideo().setStarted(true);
            VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, performanceAdUnit, performanceCampaign, 1, 0, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.hide);
        });

        it('should set video to inactive and video to finish state to error, video not started', () => {
            VideoEventHandlers.onAndroidGenericVideoError(nativeBridge, performanceAdUnit, performanceCampaign, 1, 0, 'http://test.video.url');

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.hide);
        });
    });

    describe('with video start on XPromos', () => {
        beforeEach(() => {
            video = new Video('', TestFixtures.getSession());
        });

        it('should send start event to HttpKafka on XPromos', () => {
            operativeEventManagerParams.campaign = TestFixtures.getXPromoCampaign();
            const xPromoOperativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);

            sinon.spy(xPromoOperativeEventManager, 'sendHttpKafkaEvent');
            sinon.spy(xPromoOperativeEventManager, 'sendEvent');
            operativeEventManagerParams.campaign = xPromoCampaign;
            xPromoAdUnitParameters.operativeEventManager = xPromoOperativeEventManager;

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);

            VideoEventHandlers.onVideoProgress(nativeBridge, xPromoOperativeEventManager, thirdPartyEventManager, comScoreService, xPromoAdUnit, 1, TestFixtures.getConfiguration(), xPromoCampaign, placement);

            sinon.assert.notCalled(<sinon.SinonSpy>xPromoOperativeEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>xPromoOperativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videostart.v1.json', 'start', placement, xPromoAdUnit.getVideoOrientation());
        });
    });
});
