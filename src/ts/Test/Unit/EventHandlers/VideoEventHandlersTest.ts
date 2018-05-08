import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

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
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { PerformanceVideoEventHandler } from 'EventHandlers/PerformanceVideoEventHandler';
import { XPromoVideoEventHandler } from 'EventHandlers/XPromoVideoEventHandler';
import { VastVideoEventHandler } from 'EventHandlers/VastVideoEventHandler';
import { AndroidVideoEventHandler } from 'EventHandlers/AndroidVideoEventHandler';
import { Privacy } from 'Views/Privacy';

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
    let performanceVideoEventHandler: PerformanceVideoEventHandler;
    let videoEventHandlerParams: IVideoEventHandlerParams;

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
        const gdprParams = {
            gdpr: false,
            optOutRecorded: false,
            optOutEnabled: false,
        };
        const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
        endScreen = new PerformanceEndScreen(nativeBridge, performanceCampaign, 'en', '12345', privacy, gdprParams);

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
            video: video,
            privacy: privacy
        };

        const xpromoPrivacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());
        xPromoCampaign = TestFixtures.getXPromoCampaign();
        xPromoEndScreen = new XPromoEndScreen(nativeBridge, xPromoCampaign, 'en', '12345', xpromoPrivacy, gdprParams);
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
            video: video,
            privacy: privacy
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

        videoEventHandlerParams = {
            nativeBrige: nativeBridge,
            adUnit: performanceAdUnit,
            campaign: performanceCampaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            comScoreTrackingService: comScoreService,
            configuration: configuration,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };

        performanceVideoEventHandler = new PerformanceVideoEventHandler(<IVideoEventHandlerParams<PerformanceAdUnit, PerformanceCampaign>>videoEventHandlerParams);

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
            performanceVideoEventHandler.onPlay(video.getUrl());
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setProgressEventInterval, performanceAdUnit.getProgressInterval());
        });
    });

    describe('with video start', () => {
        beforeEach(() => {
            video = new Video('', TestFixtures.getSession());
            performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        });

        it('should set video started', () => {
            performanceVideoEventHandler.onProgress(1);

            assert.isTrue(performanceAdUnit.getVideo().hasStarted());
        });

        it('should send start event to backend', () => {
            sinon.spy(operativeEventManager, 'sendStart');

            performanceVideoEventHandler.onProgress(1);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendStart, placement);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            performanceVideoEventHandler.onProgress(1);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, placement.getId());
        });

        it('should send comscore play event', () => {
            performanceVideoEventHandler.onProgress(1);

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
            performanceVideoEventHandler.onProgress(5);

            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition, 5);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, 5);
        });

        it('with negative position, should set video position and video progress', () => {
            performanceVideoEventHandler.onProgress(-5);

            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.getVideo().setPosition);
            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoProgress, -5);
        });

        it('should send first quartile event', () => {
            sinon.spy(operativeEventManager, 'sendFirstQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(4000);
            performanceVideoEventHandler.onProgress(6000);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendFirstQuartile, placement);
        });

        it('should send midpoint event', () => {
            sinon.spy(operativeEventManager, 'sendMidpoint');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            performanceVideoEventHandler.onProgress(11000);

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendMidpoint, placement);
        });

        it('should send third quartile event', () => {
            sinon.spy(operativeEventManager, 'sendThirdQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            performanceVideoEventHandler.onProgress(16000);

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
            performanceVideoEventHandler.onCompleted(video.getUrl());

            assert.isFalse(performanceAdUnit.isActive());
        });

        it('should set finnish state to COMPLETED', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());

            assert.equal(performanceAdUnit.getFinishState(), FinishState.COMPLETED);
        });

        it('should send view to session manager', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, placement);
        });

        it('should hide overlay', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
        });

        it('should send comscore end event', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());
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
            sinon.spy(xPromoOperativeEventManager, 'sendViewEvent');
            sinon.spy(xPromoOperativeEventManager, 'sendHttpKafkaEvent');

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
            videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
            const xPromoVideoEventHandler = new XPromoVideoEventHandler(<IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

            xPromoVideoEventHandler.onCompleted('https://test.com');

            sinon.assert.notCalled(<sinon.SinonSpy>comScoreService.sendEvent);
            sinon.assert.notCalled(<sinon.SinonSpy>xPromoOperativeEventManager.sendView);
            sinon.assert.called(<sinon.SinonSpy>xPromoOperativeEventManager.sendViewEvent);
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

            performanceVideoEventHandler.onPrepared(video.getUrl(), 10, 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setVideoDuration, 10);
        });

        it('should set video volume to 1.0 by default', () => {
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1.0));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0.0));
        });

        it('should just play when video position is set to 0', () => {
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            return volumeResolved.then(() => {
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo);
            });
        });

        it('should seek and play when video position is set to greater than 0', () => {
            performanceAdUnit.getVideo().setPosition(123);

            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
            return volumeResolved.then(() => seekResolved).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.seekTo, 123);
                sinon.assert.called(<sinon.SinonSpy>nativeBridge.VideoPlayer.play);
            });
        });

        it('should set debug message visibility to true if the debug overlay is enabled in the metadata', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessageVisible');
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessageVisible, true);

            stub.restore();
        });

        it('should set debug message to performance ad if the ad unit is not VAST', () => {
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);
            sinon.stub(overlay, 'setDebugMessage');

            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

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
            videoEventHandlerParams.campaign = vastCampaign;
            videoEventHandlerParams.adUnit = vastAdUnit;
            videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
            const vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>overlay.setDebugMessage, 'Programmatic Ad');

            stub.restore();
        });

        it('should not set debug message when the debug overlay is disabled in the metadata', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(false);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

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
            videoEventHandlerParams.campaign = vastCampaign;
            videoEventHandlerParams.adUnit = vastAdUnit;
            videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
            const vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

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
            videoEventHandlerParams.campaign = vastCampaign;
            videoEventHandlerParams.adUnit = vastAdUnit;
            videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
            const vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

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
            videoEventHandlerParams.campaign = vastCampaign;
            videoEventHandlerParams.adUnit = vastAdUnit;
            videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
            const vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

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
            videoEventHandlerParams.campaign = vastCampaign;
            videoEventHandlerParams.adUnit = vastAdUnit;
            videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
            const vastVideoEventHandler = new VastVideoEventHandler(<IVideoEventHandlerParams<VastAdUnit, VastCampaign>>videoEventHandlerParams);
            vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.notCalled(<sinon.SinonSpy>overlay.setFadeEnabled);
        });

        it('should set debug message to xpromo ad if the ad unit is XPromoAdUnit', () => {
            sinon.stub(overlay, 'setDebugMessage');
            const stub = sinon.stub(TestEnvironment, 'get').returns(true);

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            xPromoAdUnit.setPrepareCalled(true);
            videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
            const xPromoVideoEventHandler = new XPromoVideoEventHandler(<IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

            xPromoVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);

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
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onPrepareError('http://test.video.url');

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
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            performanceAdUnit.getVideo().setStarted(true);
            androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);

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
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);

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

            sinon.spy(xPromoOperativeEventManager, 'sendStartEvent');
            sinon.spy(xPromoOperativeEventManager, 'sendEvent');
            operativeEventManagerParams.campaign = xPromoCampaign;
            xPromoAdUnitParameters.operativeEventManager = xPromoOperativeEventManager;

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
            videoEventHandlerParams.adUnit = xPromoAdUnit;
            videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
            const xPromoVideoEventHandler = new XPromoVideoEventHandler(<IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

            xPromoVideoEventHandler.onProgress(1);

            sinon.assert.notCalled(<sinon.SinonSpy>xPromoOperativeEventManager.sendEvent);
            sinon.assert.called(<sinon.SinonSpy>xPromoOperativeEventManager.sendStartEvent);
        });
    });
});
