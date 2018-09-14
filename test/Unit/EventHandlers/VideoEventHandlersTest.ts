import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { AndroidVideoEventHandler } from 'Ads/EventHandlers/AndroidVideoEventHandler';
import { IVideoEventHandlerParams } from 'Ads/EventHandlers/BaseVideoEventHandler';
import { GdprManager } from 'Ads/Managers/GdprManager';
import {
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Overlay } from 'Ads/Views/Overlay';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

import { Double } from 'Core/Utilities/Double';
import { Request } from 'Core/Utilities/Request';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceVideoEventHandler } from 'Performance/EventHandlers/PerformanceVideoEventHandler';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastAdUnitParameters, VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastVideoEventHandler } from 'VAST/EventHandlers/VastVideoEventHandler';
import { Vast } from 'VAST/Models/Vast';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IXPromoAdUnitParameters, XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoVideoEventHandler } from 'XPromo/EventHandlers/XPromoVideoEventHandler';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoEndScreen } from 'XPromo/Views/XPromoEndScreen';

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
    let placement: Placement;
    let performanceCampaign: PerformanceCampaign;
    let vastCampaign: VastCampaign;
    let xPromoCampaign: XPromoCampaign;
    let xPromoAdUnitParameters: IXPromoAdUnitParameters;
    let xPromoEndScreen: XPromoEndScreen;
    let performanceVideoEventHandler: PerformanceVideoEventHandler;
    let videoEventHandlerParams: IVideoEventHandlerParams;
    let programmaticTrackingService: ProgrammaticTrackingService;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();

        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        vastCampaign = TestFixtures.getEventVastCampaign();
        performanceCampaign = TestFixtures.getCampaign();
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        operativeEventManagerParams = {
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            campaign: performanceCampaign
        };

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
        video = new Video('', TestFixtures.getSession());
        placement = TestFixtures.getPlacement();
        const privacy = new Privacy(nativeBridge, coreConfig.isCoppaCompliant());
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);

        const endScreenParams : IEndScreenParameters = {
            nativeBridge: nativeBridge,
            language : 'en',
            gameId: '12345',
            privacy: privacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: performanceCampaign.getGameName()
        };
        endScreen = new PerformanceEndScreen(endScreenParams, performanceCampaign);
        const gdprManager = sinon.createStubInstance(GdprManager);

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: vastCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        performanceAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: performanceCampaign,
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

        const xpromoPrivacy = new Privacy(nativeBridge, coreConfig.isCoppaCompliant());
        xPromoCampaign = TestFixtures.getXPromoCampaign();
        const xpromoEndScreenParams : IEndScreenParameters = {
            nativeBridge: nativeBridge,
            language : 'en',
            gameId: '12345',
            privacy: xpromoPrivacy,
            showGDPRBanner: false,
            abGroup: coreConfig.getAbGroup(),
            targetGameName: xPromoCampaign.getGameName()
        };
        xPromoEndScreen = new XPromoEndScreen(xpromoEndScreenParams, xPromoCampaign);
        xPromoAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: xPromoCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            endScreen: xPromoEndScreen,
            overlay: overlay,
            video: video,
            privacy: privacy,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);

        videoEventHandlerParams = {
            nativeBrige: nativeBridge,
            adUnit: performanceAdUnit,
            campaign: performanceCampaign,
            operativeEventManager: operativeEventManager,
            thirdPartyEventManager: thirdPartyEventManager,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            placement: TestFixtures.getPlacement(),
            video: video,
            adUnitStyle: undefined,
            clientInfo: clientInfo
        };

        performanceVideoEventHandler = new PerformanceVideoEventHandler(<IVideoEventHandlerParams<PerformanceAdUnit, PerformanceCampaign>>videoEventHandlerParams);
        performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            performanceAdUnit.setVideoState(VideoState.READY);
            videoEventHandlerParams.adUnit = performanceAdUnit;
            performanceVideoEventHandler = new PerformanceVideoEventHandler(<IVideoEventHandlerParams<PerformanceAdUnit, PerformanceCampaign>>videoEventHandlerParams);
        });

        it('should set video started', () => {
            performanceVideoEventHandler.onProgress(1);

            assert.isTrue(performanceAdUnit.getVideoState() === VideoState.PLAYING);
        });

        it('should send start event to backend', () => {
            sinon.spy(operativeEventManager, 'sendStart');

            performanceVideoEventHandler.onProgress(1);

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: videoEventHandlerParams.video };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendStart, params);
        });

        it('should invoke onUnityAdsStart callback ', () => {
            sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

            performanceVideoEventHandler.onProgress(1);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendStartEvent, placement.getId());
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

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendFirstQuartile, params);
        });

        it('should send midpoint event', () => {
            sinon.spy(operativeEventManager, 'sendMidpoint');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(9000);
            performanceVideoEventHandler.onProgress(11000);

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendMidpoint, params);
        });

        it('should send third quartile event', () => {
            sinon.spy(operativeEventManager, 'sendThirdQuartile');

            performanceAdUnit.getVideo().setDuration(20000);
            performanceAdUnit.getVideo().setPosition(14000);
            performanceVideoEventHandler.onProgress(16000);

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo() };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile, params);
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

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: performanceAdUnit.getVideoOrientation(),
                adUnitStyle: undefined,
                asset: videoEventHandlerParams.video };

            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendView, params);
        });

        it('should hide overlay', () => {
            performanceVideoEventHandler.onCompleted(video.getUrl());

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }
        });

        it('should send view event to HttpKafka on XPromos', () => {
            operativeEventManagerParams.campaign = TestFixtures.getXPromoCampaign();
            const xPromoOperativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            sinon.spy(xPromoOperativeEventManager, 'sendView');
            sinon.spy(xPromoOperativeEventManager, 'sendHttpKafkaEvent');

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
            videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
            const xPromoVideoEventHandler = new XPromoVideoEventHandler(<IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

            xPromoVideoEventHandler.onCompleted('https://test.com');

            const params: IOperativeEventParams = { placement: xPromoAdUnitParameters.placement,
                videoOrientation: xPromoAdUnit.getVideoOrientation()};

            sinon.assert.called(<sinon.SinonSpy>xPromoOperativeEventManager.sendView);
            sinon.assert.calledWith(<sinon.SinonSpy>xPromoOperativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoview.v1.json', 'view', params);
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

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(1));
        });

        it('should set video volume to 0.0 when overlay says it is muted', () => {
            overlay.isMuted = sinon.mock().returns(true);
            performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.VideoPlayer.setVolume, new Double(0));
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
            performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            performanceAdUnit.setVideoState(VideoState.PREPARING);
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
            xPromoAdUnit.setVideoState(VideoState.PREPARING);
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
            videoEventHandlerParams.adUnit = performanceAdUnit;
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
            sinon.spy(endScreen, 'show');
            sinon.spy(performanceAdUnit, 'onVideoError');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set video to inactive and video to finish state to error, video started', () => {
            performanceAdUnit.setVideoState(VideoState.PLAYING);
            videoEventHandlerParams.adUnit = performanceAdUnit;
            const androidVideoEventHandler = new AndroidVideoEventHandler(videoEventHandlerParams);
            androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);

            assert.isFalse(performanceAdUnit.isActive());
            assert.equal(performanceAdUnit.getFinishState(), FinishState.ERROR);

            const adUnitOverlay = performanceAdUnit.getOverlay();
            if(adUnitOverlay) {
                sinon.assert.called(<sinon.SinonSpy>adUnitOverlay.hide);
            }

            sinon.assert.calledWith(<sinon.SinonSpy>container.reconfigure, ViewConfiguration.ENDSCREEN);
            sinon.assert.notCalled(<sinon.SinonSpy>performanceAdUnit.hide);
            sinon.assert.called(<sinon.SinonSpy>performanceAdUnit.onVideoError);
            sinon.assert.called(<sinon.SinonSpy>endScreen.show);
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

        it('should send start event to HttpKafka on XPromos', (done) => {
            operativeEventManagerParams.campaign = TestFixtures.getXPromoCampaign();
            const xPromoOperativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
            sinon.stub(metaDataManager, 'fetch').callsFake(() => {
                return Promise.resolve(undefined);
            });

            sinon.stub(xPromoOperativeEventManager, 'sendHttpKafkaEvent').callsFake(() => {
                done();
            });

            operativeEventManagerParams.campaign = xPromoCampaign;
            xPromoAdUnitParameters.operativeEventManager = xPromoOperativeEventManager;

            const xPromoAdUnit = new XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
            xPromoAdUnit.setVideoState(VideoState.READY);
            videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
            videoEventHandlerParams.adUnit = xPromoAdUnit;
            videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
            const xPromoVideoEventHandler = new XPromoVideoEventHandler(<IVideoEventHandlerParams<XPromoAdUnit, XPromoCampaign, XPromoOperativeEventManager>>videoEventHandlerParams);

            xPromoVideoEventHandler.onProgress(1);
        });
    });
});
