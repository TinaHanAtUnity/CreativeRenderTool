System.register(["mocha", "sinon", "chai", "Utilities/Double", "AdUnits/VastAdUnit", "Models/Vast/Vast", "Constants/FinishState", "Native/NativeBridge", "Managers/SessionManager", "../TestHelpers/TestFixtures", "Managers/ThirdPartyEventManager", "Utilities/Request", "Views/Overlay", "Managers/WakeUpManager", "Utilities/Diagnostics", "AdUnits/PerformanceAdUnit", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Utilities/TestEnvironment", "Managers/MetaDataManager", "Managers/FocusManager", "Views/PerformanceEndScreen", "AdUnits/XPromoAdUnit", "Views/XPromoEndScreen", "Managers/OperativeEventManagerFactory", "EventHandlers/PerformanceVideoEventHandler", "EventHandlers/XPromoVideoEventHandler", "EventHandlers/VastVideoEventHandler", "EventHandlers/AndroidVideoEventHandler", "AdUnits/VideoAdUnit", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, Double_1, VastAdUnit_1, Vast_1, FinishState_1, NativeBridge_1, SessionManager_1, TestFixtures_1, ThirdPartyEventManager_1, Request_1, Overlay_1, WakeUpManager_1, Diagnostics_1, PerformanceAdUnit_1, Platform_1, AdUnitContainer_1, Activity_1, Video_1, TestEnvironment_1, MetaDataManager_1, FocusManager_1, PerformanceEndScreen_1, XPromoAdUnit_1, XPromoEndScreen_1, OperativeEventManagerFactory_1, PerformanceVideoEventHandler_1, XPromoVideoEventHandler_1, VastVideoEventHandler_1, AndroidVideoEventHandler_1, VideoAdUnit_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Double_1_1) {
                Double_1 = Double_1_1;
            },
            function (VastAdUnit_1_1) {
                VastAdUnit_1 = VastAdUnit_1_1;
            },
            function (Vast_1_1) {
                Vast_1 = Vast_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (PerformanceAdUnit_1_1) {
                PerformanceAdUnit_1 = PerformanceAdUnit_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (TestEnvironment_1_1) {
                TestEnvironment_1 = TestEnvironment_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
            },
            function (XPromoAdUnit_1_1) {
                XPromoAdUnit_1 = XPromoAdUnit_1_1;
            },
            function (XPromoEndScreen_1_1) {
                XPromoEndScreen_1 = XPromoEndScreen_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (PerformanceVideoEventHandler_1_1) {
                PerformanceVideoEventHandler_1 = PerformanceVideoEventHandler_1_1;
            },
            function (XPromoVideoEventHandler_1_1) {
                XPromoVideoEventHandler_1 = XPromoVideoEventHandler_1_1;
            },
            function (VastVideoEventHandler_1_1) {
                VastVideoEventHandler_1 = VastVideoEventHandler_1_1;
            },
            function (AndroidVideoEventHandler_1_1) {
                AndroidVideoEventHandler_1 = AndroidVideoEventHandler_1_1;
            },
            function (VideoAdUnit_1_1) {
                VideoAdUnit_1 = VideoAdUnit_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('VideoEventHandlersTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, overlay, endScreen;
                var container;
                var performanceAdUnit;
                var sessionManager;
                var video;
                var metaDataManager;
                var focusManager;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var request;
                var performanceAdUnitParameters;
                var vastAdUnitParameters;
                var operativeEventManagerParams;
                var placement;
                var performanceCampaign;
                var vastCampaign;
                var xPromoCampaign;
                var xPromoAdUnitParameters;
                var xPromoEndScreen;
                var performanceVideoEventHandler;
                var videoEventHandlerParams;
                var programmaticTrackingService;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    vastCampaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                    performanceCampaign = TestFixtures_1.TestFixtures.getCampaign();
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
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
                    operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                    video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                    placement = TestFixtures_1.TestFixtures.getPlacement();
                    var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                    overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                    var endScreenParams = {
                        nativeBridge: nativeBridge,
                        language: 'en',
                        gameId: '12345',
                        privacy: privacy,
                        showGDPRBanner: false,
                        abGroup: configuration.getAbGroup(),
                        targetGameName: performanceCampaign.getGameName()
                    };
                    endScreen = new PerformanceEndScreen_1.PerformanceEndScreen(endScreenParams, performanceCampaign);
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    vastAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: placement,
                        campaign: vastCampaign,
                        configuration: configuration,
                        request: request,
                        options: {},
                        endScreen: undefined,
                        overlay: overlay,
                        video: video,
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    performanceAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        campaign: performanceCampaign,
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
                    var xpromoPrivacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                    xPromoCampaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                    var xpromoEndScreenParams = {
                        nativeBridge: nativeBridge,
                        language: 'en',
                        gameId: '12345',
                        privacy: xpromoPrivacy,
                        showGDPRBanner: false,
                        abGroup: configuration.getAbGroup(),
                        targetGameName: xPromoCampaign.getGameName()
                    };
                    xPromoEndScreen = new XPromoEndScreen_1.XPromoEndScreen(xpromoEndScreenParams, xPromoCampaign);
                    xPromoAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        campaign: xPromoCampaign,
                        configuration: configuration,
                        request: request,
                        options: {},
                        endScreen: xPromoEndScreen,
                        overlay: overlay,
                        video: video,
                        privacy: privacy,
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                    performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                    videoEventHandlerParams = {
                        nativeBrige: nativeBridge,
                        adUnit: performanceAdUnit,
                        campaign: performanceCampaign,
                        operativeEventManager: operativeEventManager,
                        thirdPartyEventManager: thirdPartyEventManager,
                        configuration: configuration,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        video: video,
                        adUnitStyle: undefined,
                        clientInfo: clientInfo
                    };
                    performanceVideoEventHandler = new PerformanceVideoEventHandler_1.PerformanceVideoEventHandler(videoEventHandlerParams);
                    performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                });
                describe('with onVideoPlay', function () {
                    it('should set progress interval', function () {
                        sinon.stub(nativeBridge.VideoPlayer, 'setProgressEventInterval').returns(Promise.resolve(void (0)));
                        performanceVideoEventHandler.onPlay(video.getUrl());
                        sinon.assert.calledWith(nativeBridge.VideoPlayer.setProgressEventInterval, performanceAdUnit.getProgressInterval());
                    });
                });
                describe('with video start', function () {
                    beforeEach(function () {
                        video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                        performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.READY);
                        videoEventHandlerParams.adUnit = performanceAdUnit;
                        performanceVideoEventHandler = new PerformanceVideoEventHandler_1.PerformanceVideoEventHandler(videoEventHandlerParams);
                    });
                    it('should set video started', function () {
                        performanceVideoEventHandler.onProgress(1);
                        chai_1.assert.isTrue(performanceAdUnit.getVideoState() === VideoAdUnit_1.VideoState.PLAYING);
                    });
                    it('should send start event to backend', function () {
                        sinon.spy(operativeEventManager, 'sendStart');
                        performanceVideoEventHandler.onProgress(1);
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: videoEventHandlerParams.video };
                        sinon.assert.calledWith(operativeEventManager.sendStart, params);
                    });
                    it('should invoke onUnityAdsStart callback ', function () {
                        sinon.stub(nativeBridge.Listener, 'sendStartEvent').returns(Promise.resolve(void (0)));
                        performanceVideoEventHandler.onProgress(1);
                        sinon.assert.calledWith(nativeBridge.Listener.sendStartEvent, placement.getId());
                    });
                });
                describe('with onVideoProgress', function () {
                    beforeEach(function () {
                        sinon.spy(performanceAdUnit.getVideo(), 'setPosition');
                        sinon.spy(overlay, 'setVideoProgress');
                    });
                    it('with positive position, should set video position and video progress', function () {
                        performanceVideoEventHandler.onProgress(5);
                        sinon.assert.calledWith(performanceAdUnit.getVideo().setPosition, 5);
                        sinon.assert.calledWith(overlay.setVideoProgress, 5);
                    });
                    it('with negative position, should set video position and video progress', function () {
                        performanceVideoEventHandler.onProgress(-5);
                        sinon.assert.notCalled(performanceAdUnit.getVideo().setPosition);
                        sinon.assert.calledWith(overlay.setVideoProgress, -5);
                    });
                    it('should send first quartile event', function () {
                        sinon.spy(operativeEventManager, 'sendFirstQuartile');
                        performanceAdUnit.getVideo().setDuration(20000);
                        performanceAdUnit.getVideo().setPosition(4000);
                        performanceVideoEventHandler.onProgress(6000);
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo() };
                        sinon.assert.calledWith(operativeEventManager.sendFirstQuartile, params);
                    });
                    it('should send midpoint event', function () {
                        sinon.spy(operativeEventManager, 'sendMidpoint');
                        performanceAdUnit.getVideo().setDuration(20000);
                        performanceAdUnit.getVideo().setPosition(9000);
                        performanceVideoEventHandler.onProgress(11000);
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo() };
                        sinon.assert.calledWith(operativeEventManager.sendMidpoint, params);
                    });
                    it('should send third quartile event', function () {
                        sinon.spy(operativeEventManager, 'sendThirdQuartile');
                        performanceAdUnit.getVideo().setDuration(20000);
                        performanceAdUnit.getVideo().setPosition(14000);
                        performanceVideoEventHandler.onProgress(16000);
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo() };
                        sinon.assert.calledWith(operativeEventManager.sendThirdQuartile, params);
                    });
                });
                describe('with onVideoCompleted', function () {
                    var prom;
                    beforeEach(function () {
                        prom = Promise.resolve(false);
                        sinon.spy(nativeBridge, 'invoke');
                        sinon.spy(operativeEventManager, 'sendView');
                        sinon.spy(overlay, 'hide');
                    });
                    it('should set video to inactive', function () {
                        performanceVideoEventHandler.onCompleted(video.getUrl());
                        chai_1.assert.isFalse(performanceAdUnit.isActive());
                    });
                    it('should set finnish state to COMPLETED', function () {
                        performanceVideoEventHandler.onCompleted(video.getUrl());
                        chai_1.assert.equal(performanceAdUnit.getFinishState(), FinishState_1.FinishState.COMPLETED);
                    });
                    it('should send view to session manager', function () {
                        performanceVideoEventHandler.onCompleted(video.getUrl());
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: videoEventHandlerParams.video };
                        sinon.assert.calledWith(operativeEventManager.sendView, params);
                    });
                    it('should hide overlay', function () {
                        performanceVideoEventHandler.onCompleted(video.getUrl());
                        var adUnitOverlay = performanceAdUnit.getOverlay();
                        if (adUnitOverlay) {
                            sinon.assert.called(adUnitOverlay.hide);
                        }
                    });
                    it('should send view event to HttpKafka on XPromos', function () {
                        operativeEventManagerParams.campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        var xPromoOperativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        sinon.spy(xPromoOperativeEventManager, 'sendView');
                        sinon.spy(xPromoOperativeEventManager, 'sendHttpKafkaEvent');
                        var xPromoAdUnit = new XPromoAdUnit_1.XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
                        videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
                        videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
                        var xPromoVideoEventHandler = new XPromoVideoEventHandler_1.XPromoVideoEventHandler(videoEventHandlerParams);
                        xPromoVideoEventHandler.onCompleted('https://test.com');
                        var params = { placement: xPromoAdUnitParameters.placement,
                            videoOrientation: xPromoAdUnit.getVideoOrientation() };
                        sinon.assert.called(xPromoOperativeEventManager.sendView);
                        sinon.assert.calledWith(xPromoOperativeEventManager.sendHttpKafkaEvent, 'ads.xpromo.operative.videoview.v1.json', 'view', params);
                    });
                });
                describe('with onVideoPrepared', function () {
                    var seekResolved, volumeResolved;
                    beforeEach(function () {
                        seekResolved = Promise.resolve(void (0));
                        volumeResolved = Promise.resolve(void (0));
                        sinon.stub(nativeBridge.VideoPlayer, 'seekTo').returns(seekResolved);
                        sinon.stub(nativeBridge.VideoPlayer, 'setVolume').returns(volumeResolved);
                        sinon.spy(nativeBridge.VideoPlayer, 'play');
                    });
                    it('should set video duration for overlay', function () {
                        sinon.stub(overlay, 'setVideoDuration');
                        performanceVideoEventHandler.onPrepared(video.getUrl(), 10, 1024, 768);
                        sinon.assert.calledWith(overlay.setVideoDuration, 10);
                    });
                    it('should set video volume to 1.0 by default', function () {
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double_1.Double(1));
                    });
                    it('should set video volume to 0.0 when overlay says it is muted', function () {
                        overlay.isMuted = sinon.mock().returns(true);
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double_1.Double(0));
                    });
                    it('should just play when video position is set to 0', function () {
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        return volumeResolved.then(function () {
                            sinon.assert.called(nativeBridge.VideoPlayer.play);
                            sinon.assert.notCalled(nativeBridge.VideoPlayer.seekTo);
                        });
                    });
                    it('should seek and play when video position is set to greater than 0', function () {
                        performanceAdUnit.getVideo().setPosition(123);
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        return volumeResolved.then(function () { return seekResolved; }).then(function () {
                            sinon.assert.calledWith(nativeBridge.VideoPlayer.seekTo, 123);
                            sinon.assert.called(nativeBridge.VideoPlayer.play);
                        });
                    });
                    it('should set debug message visibility to true if the debug overlay is enabled in the metadata', function () {
                        var stub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get').returns(true);
                        sinon.stub(overlay, 'setDebugMessageVisible');
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(overlay.setDebugMessageVisible, true);
                        stub.restore();
                    });
                    it('should set debug message to performance ad if the ad unit is not VAST', function () {
                        var stub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get').returns(true);
                        sinon.stub(overlay, 'setDebugMessage');
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(overlay.setDebugMessage, 'Performance Ad');
                        stub.restore();
                    });
                    it('should set debug message to programmatic ad if the ad unit is VAST', function () {
                        sinon.stub(overlay, 'setDebugMessage');
                        var stub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get').returns(true);
                        var vast = new Vast_1.Vast([], []);
                        sinon.stub(vast, 'getVideoUrl').returns(video.getUrl());
                        vastCampaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                        sinon.stub(vastCampaign, 'getVideo').returns(video);
                        operativeEventManagerParams.campaign = vastCampaign;
                        vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        videoEventHandlerParams.campaign = vastCampaign;
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
                        var vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(overlay.setDebugMessage, 'Programmatic Ad');
                        stub.restore();
                    });
                    it('should not set debug message when the debug overlay is disabled in the metadata', function () {
                        sinon.stub(overlay, 'setDebugMessage');
                        var stub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get').returns(false);
                        performanceVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.notCalled(overlay.setDebugMessage);
                        stub.restore();
                    });
                    it('should set call button visibility to true if the ad unit is VAST and has a click trough URL', function () {
                        sinon.stub(overlay, 'setCallButtonVisible');
                        vastCampaign = {
                            getVideo: function () { return video; }
                        };
                        vastAdUnitParameters.campaign = vastCampaign;
                        operativeEventManagerParams.campaign = vastCampaign;
                        vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
                        videoEventHandlerParams.campaign = vastCampaign;
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
                        var vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(overlay.setCallButtonVisible, true);
                    });
                    it('should not set call button visibility to true if the ad unit is VAST but there is no click trough URL', function () {
                        sinon.stub(overlay, 'setCallButtonVisible');
                        vastCampaign = {
                            getVideo: function () { return video; }
                        };
                        vastAdUnitParameters.campaign = vastCampaign;
                        operativeEventManagerParams.campaign = vastCampaign;
                        vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
                        videoEventHandlerParams.campaign = vastCampaign;
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
                        var vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.notCalled(overlay.setCallButtonVisible);
                    });
                    it('should set fade enabled to false if the ad unit is VAST and has a click trough URL', function () {
                        sinon.stub(overlay, 'setFadeEnabled');
                        vastCampaign = {
                            getVideo: function () { return video; }
                        };
                        vastAdUnitParameters.campaign = vastCampaign;
                        operativeEventManagerParams.campaign = vastCampaign;
                        vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('http://foo.com');
                        videoEventHandlerParams.campaign = vastCampaign;
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
                        var vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.calledWith(overlay.setFadeEnabled, false);
                    });
                    it('should not set fade enabled to false if the ad unit is VAST but there is no click trough URL', function () {
                        sinon.stub(overlay, 'setFadeEnabled');
                        vastCampaign = {
                            getVideo: function () { return video; }
                        };
                        vastAdUnitParameters.campaign = vastCampaign;
                        operativeEventManagerParams.campaign = vastCampaign;
                        vastAdUnitParameters.operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        var vastAdUnit = new VastAdUnit_1.VastAdUnit(nativeBridge, vastAdUnitParameters);
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns(null);
                        videoEventHandlerParams.campaign = vastCampaign;
                        videoEventHandlerParams.adUnit = vastAdUnit;
                        videoEventHandlerParams.operativeEventManager = vastAdUnitParameters.operativeEventManager;
                        var vastVideoEventHandler = new VastVideoEventHandler_1.VastVideoEventHandler(videoEventHandlerParams);
                        vastVideoEventHandler.onPrepared(video.getUrl(), video.getDuration(), 1024, 768);
                        sinon.assert.notCalled(overlay.setFadeEnabled);
                    });
                    it('should set debug message to xpromo ad if the ad unit is XPromoAdUnit', function () {
                        sinon.stub(overlay, 'setDebugMessage');
                        var stub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get').returns(true);
                        var xPromoAdUnit = new XPromoAdUnit_1.XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
                        xPromoAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
                        var xPromoVideoEventHandler = new XPromoVideoEventHandler_1.XPromoVideoEventHandler(videoEventHandlerParams);
                        xPromoVideoEventHandler.onPrepared('https://test.com', 10000, 1024, 768);
                        sinon.assert.calledWith(overlay.setDebugMessage, 'XPromo');
                        stub.restore();
                    });
                });
                describe('with onPrepareError', function () {
                    var sandbox;
                    beforeEach(function () {
                        sandbox = sinon.sandbox.create();
                        sandbox.stub(Diagnostics_1.Diagnostics, 'trigger');
                        sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
                        sinon.stub(performanceAdUnit, 'hide');
                        sinon.spy(container, 'reconfigure');
                        sinon.spy(overlay, 'hide');
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('should set video to inactive and video to finish state to error', function () {
                        videoEventHandlerParams.adUnit = performanceAdUnit;
                        var androidVideoEventHandler = new AndroidVideoEventHandler_1.AndroidVideoEventHandler(videoEventHandlerParams);
                        androidVideoEventHandler.onPrepareError('http://test.video.url');
                        chai_1.assert.isFalse(performanceAdUnit.isActive());
                        chai_1.assert.equal(performanceAdUnit.getFinishState(), FinishState_1.FinishState.ERROR);
                        var adUnitOverlay = performanceAdUnit.getOverlay();
                        if (adUnitOverlay) {
                            sinon.assert.called(adUnitOverlay.hide);
                        }
                        sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
                        sinon.assert.called(performanceAdUnit.hide);
                    });
                });
                describe('with onAndroidGenericVideoError', function () {
                    var sandbox;
                    beforeEach(function () {
                        sandbox = sinon.sandbox.create();
                        sandbox.stub(Diagnostics_1.Diagnostics, 'trigger');
                        sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
                        sinon.stub(performanceAdUnit, 'hide');
                        sinon.spy(container, 'reconfigure');
                        sinon.spy(overlay, 'hide');
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('should set video to inactive and video to finish state to error, video started', function () {
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PLAYING);
                        videoEventHandlerParams.adUnit = performanceAdUnit;
                        var androidVideoEventHandler = new AndroidVideoEventHandler_1.AndroidVideoEventHandler(videoEventHandlerParams);
                        androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);
                        chai_1.assert.isFalse(performanceAdUnit.isActive());
                        chai_1.assert.equal(performanceAdUnit.getFinishState(), FinishState_1.FinishState.ERROR);
                        var adUnitOverlay = performanceAdUnit.getOverlay();
                        if (adUnitOverlay) {
                            sinon.assert.called(adUnitOverlay.hide);
                        }
                        sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
                        sinon.assert.notCalled(performanceAdUnit.hide);
                    });
                    it('should set video to inactive and video to finish state to error, video not started', function () {
                        var androidVideoEventHandler = new AndroidVideoEventHandler_1.AndroidVideoEventHandler(videoEventHandlerParams);
                        androidVideoEventHandler.onGenericError('http://test.video.url', 1, 0);
                        chai_1.assert.isFalse(performanceAdUnit.isActive());
                        chai_1.assert.equal(performanceAdUnit.getFinishState(), FinishState_1.FinishState.ERROR);
                        var adUnitOverlay = performanceAdUnit.getOverlay();
                        if (adUnitOverlay) {
                            sinon.assert.called(adUnitOverlay.hide);
                        }
                        sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
                        sinon.assert.called(performanceAdUnit.hide);
                    });
                });
                describe('with video start on XPromos', function () {
                    beforeEach(function () {
                        video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                    });
                    it('should send start event to HttpKafka on XPromos', function (done) {
                        operativeEventManagerParams.campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        var xPromoOperativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                        sinon.stub(metaDataManager, 'fetch').callsFake(function () {
                            return Promise.resolve(undefined);
                        });
                        sinon.stub(xPromoOperativeEventManager, 'sendHttpKafkaEvent').callsFake(function () {
                            done();
                        });
                        operativeEventManagerParams.campaign = xPromoCampaign;
                        xPromoAdUnitParameters.operativeEventManager = xPromoOperativeEventManager;
                        var xPromoAdUnit = new XPromoAdUnit_1.XPromoAdUnit(nativeBridge, xPromoAdUnitParameters);
                        xPromoAdUnit.setVideoState(VideoAdUnit_1.VideoState.READY);
                        videoEventHandlerParams.campaign = operativeEventManagerParams.campaign;
                        videoEventHandlerParams.adUnit = xPromoAdUnit;
                        videoEventHandlerParams.operativeEventManager = xPromoOperativeEventManager;
                        var xPromoVideoEventHandler = new XPromoVideoEventHandler_1.XPromoVideoEventHandler(videoEventHandlerParams);
                        xPromoVideoEventHandler.onProgress(1);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9FdmVudEhhbmRsZXJzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlZpZGVvRXZlbnRIYW5kbGVyc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQW9EQSxRQUFRLENBQUMsd0JBQXdCLEVBQUU7Z0JBRS9CLElBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsRUFBRSxPQUFnQixFQUFFLFNBQStCLENBQUM7Z0JBQ2xGLElBQUksU0FBMEIsQ0FBQztnQkFDL0IsSUFBSSxpQkFBb0MsQ0FBQztnQkFDekMsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLEtBQVksQ0FBQztnQkFDakIsSUFBSSxlQUFnQyxDQUFDO2dCQUNyQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUkscUJBQTRDLENBQUM7Z0JBQ2pELElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksMkJBQXlELENBQUM7Z0JBQzlELElBQUksb0JBQTJDLENBQUM7Z0JBQ2hELElBQUksMkJBQW1FLENBQUM7Z0JBQ3hFLElBQUksU0FBb0IsQ0FBQztnQkFDekIsSUFBSSxtQkFBd0MsQ0FBQztnQkFDN0MsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGNBQThCLENBQUM7Z0JBQ25DLElBQUksc0JBQStDLENBQUM7Z0JBQ3BELElBQUksZUFBZ0MsQ0FBQztnQkFDckMsSUFBSSw0QkFBMEQsQ0FBQztnQkFDL0QsSUFBSSx1QkFBaUQsQ0FBQztnQkFDdEQsSUFBSSwyQkFBd0QsQ0FBQztnQkFDN0QsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUVILFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzlDLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BELGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCxTQUFTLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksRUFBRSwyQkFBWSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDOUYsSUFBTSxhQUFhLEdBQUcsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUV0RCxJQUFNLGFBQWEsR0FBRyxJQUFJLDZCQUFhLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUNwRSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDbkQsVUFBVSxHQUFHLDJCQUFZLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzFELFVBQVUsR0FBRywyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBRWpELHNCQUFzQixHQUFHLElBQUksK0NBQXNCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUMzRSxjQUFjLEdBQUcsSUFBSSwrQkFBYyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDM0QsWUFBWSxHQUFHLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztvQkFDbkQsbUJBQW1CLEdBQUcsMkJBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFDakQsMkJBQTJCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHlEQUEyQixDQUFDLENBQUM7b0JBRXBGLDJCQUEyQixHQUFHO3dCQUMxQixZQUFZLEVBQUUsWUFBWTt3QkFDMUIsT0FBTyxFQUFFLE9BQU87d0JBQ2hCLGVBQWUsRUFBRSxlQUFlO3dCQUNoQyxjQUFjLEVBQUUsY0FBYzt3QkFDOUIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixhQUFhLEVBQUUsYUFBYTt3QkFDNUIsUUFBUSxFQUFFLG1CQUFtQjtxQkFDaEMsQ0FBQztvQkFFRixxQkFBcUIsR0FBRywyREFBNEIsQ0FBQywyQkFBMkIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO29CQUM5RyxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsRUFBRSxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDakQsU0FBUyxHQUFHLDJCQUFZLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQ3hDLElBQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztvQkFDNUUsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUV6RixJQUFNLGVBQWUsR0FBMEI7d0JBQzNDLFlBQVksRUFBRSxZQUFZO3dCQUMxQixRQUFRLEVBQUcsSUFBSTt3QkFDZixNQUFNLEVBQUUsT0FBTzt3QkFDZixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsY0FBYyxFQUFFLEtBQUs7d0JBQ3JCLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFFO3dCQUNuQyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsV0FBVyxFQUFFO3FCQUNwRCxDQUFDO29CQUNGLFNBQVMsR0FBRyxJQUFJLDJDQUFvQixDQUFDLGVBQWUsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO29CQUMzRSxJQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMseUJBQVcsQ0FBQyxDQUFDO29CQUUxRCxvQkFBb0IsR0FBRzt3QkFDbkIsZ0JBQWdCLEVBQUUsNkJBQVcsQ0FBQyxTQUFTO3dCQUN2QyxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLFVBQVUsRUFBRSxVQUFVO3dCQUN0QixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsc0JBQXNCLEVBQUUsc0JBQXNCO3dCQUM5QyxxQkFBcUIsRUFBRSxxQkFBcUI7d0JBQzVDLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixRQUFRLEVBQUUsWUFBWTt3QkFDdEIsYUFBYSxFQUFFLGFBQWE7d0JBQzVCLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixPQUFPLEVBQUUsRUFBRTt3QkFDWCxTQUFTLEVBQUUsU0FBUzt3QkFDcEIsT0FBTyxFQUFFLE9BQU87d0JBQ2hCLEtBQUssRUFBRSxLQUFLO3dCQUNaLFdBQVcsRUFBRSxXQUFXO3dCQUN4QiwyQkFBMkIsRUFBRSwyQkFBMkI7cUJBQzNELENBQUM7b0JBRUYsMkJBQTJCLEdBQUc7d0JBQzFCLGdCQUFnQixFQUFFLDZCQUFXLENBQUMsU0FBUzt3QkFDdkMsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMscUJBQXFCLEVBQUUscUJBQXFCO3dCQUM1QyxTQUFTLEVBQUUsMkJBQVksQ0FBQyxZQUFZLEVBQUU7d0JBQ3RDLFFBQVEsRUFBRSxtQkFBbUI7d0JBQzdCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsU0FBUyxFQUFFLFNBQVM7d0JBQ3BCLE9BQU8sRUFBRSxPQUFPO3dCQUNoQixLQUFLLEVBQUUsS0FBSzt3QkFDWixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsV0FBVyxFQUFFLFdBQVc7d0JBQ3hCLDJCQUEyQixFQUFFLDJCQUEyQjtxQkFDM0QsQ0FBQztvQkFFRixJQUFNLGFBQWEsR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7b0JBQ2xGLGNBQWMsR0FBRywyQkFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUM7b0JBQ2xELElBQU0scUJBQXFCLEdBQTBCO3dCQUNqRCxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsUUFBUSxFQUFHLElBQUk7d0JBQ2YsTUFBTSxFQUFFLE9BQU87d0JBQ2YsT0FBTyxFQUFFLGFBQWE7d0JBQ3RCLGNBQWMsRUFBRSxLQUFLO3dCQUNyQixPQUFPLEVBQUUsYUFBYSxDQUFDLFVBQVUsRUFBRTt3QkFDbkMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxXQUFXLEVBQUU7cUJBQy9DLENBQUM7b0JBQ0YsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDN0Usc0JBQXNCLEdBQUc7d0JBQ3JCLGdCQUFnQixFQUFFLDZCQUFXLENBQUMsU0FBUzt3QkFDdkMsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMscUJBQXFCLEVBQUUscUJBQXFCO3dCQUM1QyxTQUFTLEVBQUUsMkJBQVksQ0FBQyxZQUFZLEVBQUU7d0JBQ3RDLFFBQVEsRUFBRSxjQUFjO3dCQUN4QixhQUFhLEVBQUUsYUFBYTt3QkFDNUIsT0FBTyxFQUFFLE9BQU87d0JBQ2hCLE9BQU8sRUFBRSxFQUFFO3dCQUNYLFNBQVMsRUFBRSxlQUFlO3dCQUMxQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsS0FBSyxFQUFFLEtBQUs7d0JBQ1osT0FBTyxFQUFFLE9BQU87d0JBQ2hCLFdBQVcsRUFBRSxXQUFXO3dCQUN4QiwyQkFBMkIsRUFBRSwyQkFBMkI7cUJBQzNELENBQUM7b0JBRUYsaUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFFckYsdUJBQXVCLEdBQUc7d0JBQ3RCLFdBQVcsRUFBRSxZQUFZO3dCQUN6QixNQUFNLEVBQUUsaUJBQWlCO3dCQUN6QixRQUFRLEVBQUUsbUJBQW1CO3dCQUM3QixxQkFBcUIsRUFBRSxxQkFBcUI7d0JBQzVDLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMsYUFBYSxFQUFFLGFBQWE7d0JBQzVCLFNBQVMsRUFBRSwyQkFBWSxDQUFDLFlBQVksRUFBRTt3QkFDdEMsS0FBSyxFQUFFLEtBQUs7d0JBQ1osV0FBVyxFQUFFLFNBQVM7d0JBQ3RCLFVBQVUsRUFBRSxVQUFVO3FCQUN6QixDQUFDO29CQUVGLDRCQUE0QixHQUFHLElBQUksMkRBQTRCLENBQW1FLHVCQUF1QixDQUFDLENBQUM7b0JBQzNKLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx3QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3pCLEVBQUUsQ0FBQyw4QkFBOEIsRUFBRTt3QkFDL0IsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLDBCQUEwQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkcsNEJBQTRCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO3dCQUNwRCxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsWUFBWSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7b0JBQ3hJLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILFFBQVEsQ0FBQyxrQkFBa0IsRUFBRTtvQkFDekIsVUFBVSxDQUFDO3dCQUNQLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxFQUFFLEVBQUUsMkJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO3dCQUNqRCxpQkFBaUIsR0FBRyxJQUFJLHFDQUFpQixDQUFDLFlBQVksRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO3dCQUNyRixpQkFBaUIsQ0FBQyxhQUFhLENBQUMsd0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbEQsdUJBQXVCLENBQUMsTUFBTSxHQUFHLGlCQUFpQixDQUFDO3dCQUNuRCw0QkFBNEIsR0FBRyxJQUFJLDJEQUE0QixDQUFtRSx1QkFBdUIsQ0FBQyxDQUFDO29CQUMvSixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsMEJBQTBCLEVBQUU7d0JBQzNCLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFM0MsYUFBTSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLEVBQUUsS0FBSyx3QkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUM1RSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7d0JBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBRTlDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFM0MsSUFBTSxNQUFNLEdBQTBCLEVBQUUsU0FBUyxFQUFFLFNBQVM7NEJBQ3hELGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFOzRCQUN6RCxXQUFXLEVBQUUsU0FBUzs0QkFDdEIsS0FBSyxFQUFFLHVCQUF1QixDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUUzQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIscUJBQXFCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNyRixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUU7d0JBQzFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRXRGLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLFlBQVksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNyRyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsc0JBQXNCLEVBQUU7b0JBQzdCLFVBQVUsQ0FBQzt3QkFDUCxLQUFLLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUN2RCxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO29CQUMzQyxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsc0VBQXNFLEVBQUU7d0JBQ3ZFLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFM0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDckYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHNFQUFzRSxFQUFFO3dCQUN2RSw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFNUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQWlCLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO3dCQUNqRixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFFLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxrQ0FBa0MsRUFBRTt3QkFDbkMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO3dCQUV0RCxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDL0MsNEJBQTRCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUU5QyxJQUFNLE1BQU0sR0FBMEIsRUFBRSxTQUFTLEVBQUUsU0FBUzs0QkFDeEQsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsbUJBQW1CLEVBQUU7NEJBQ3pELFdBQVcsRUFBRSxTQUFTOzRCQUN0QixLQUFLLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQzt3QkFFMUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLHFCQUFxQixDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUM3RixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUU7d0JBQzdCLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsY0FBYyxDQUFDLENBQUM7d0JBRWpELGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDaEQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUMvQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBRS9DLElBQU0sTUFBTSxHQUEwQixFQUFFLFNBQVMsRUFBRSxTQUFTOzRCQUN4RCxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRTs0QkFDekQsV0FBVyxFQUFFLFNBQVM7NEJBQ3RCLEtBQUssRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO3dCQUUxQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIscUJBQXFCLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN4RixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsa0NBQWtDLEVBQUU7d0JBQ25DLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFFdEQsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNoRCxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ2hELDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFL0MsSUFBTSxNQUFNLEdBQTBCLEVBQUUsU0FBUyxFQUFFLFNBQVM7NEJBQ3hELGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFOzRCQUN6RCxXQUFXLEVBQUUsU0FBUzs0QkFDdEIsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7d0JBRTFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixxQkFBcUIsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDN0YsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLHVCQUF1QixFQUFFO29CQUM5QixJQUFJLElBQXNCLENBQUM7b0JBRTNCLFVBQVUsQ0FBQzt3QkFDUCxJQUFJLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFOUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ2xDLEtBQUssQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUM7d0JBQzdDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMvQixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUU7d0JBQy9CLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt3QkFFekQsYUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUNqRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUU7d0JBQ3hDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt3QkFFekQsYUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUUsRUFBRSx5QkFBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUM1RSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUU7d0JBQ3RDLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt3QkFFekQsSUFBTSxNQUFNLEdBQTBCLEVBQUUsU0FBUyxFQUFFLFNBQVM7NEJBQ3hELGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFOzRCQUN6RCxXQUFXLEVBQUUsU0FBUzs0QkFDdEIsS0FBSyxFQUFFLHVCQUF1QixDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUUzQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIscUJBQXFCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUNwRixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUU7d0JBQ3RCLDRCQUE0QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt3QkFFekQsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3JELElBQUcsYUFBYSxFQUFFOzRCQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFpQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNEO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTt3QkFDakQsMkJBQTJCLENBQUMsUUFBUSxHQUFHLDJCQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDeEUsSUFBTSwyQkFBMkIsR0FBZ0MsMkRBQTRCLENBQUMsMkJBQTJCLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt3QkFDdkosS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUU3RCxJQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsWUFBWSxFQUFFLHNCQUFzQixDQUFDLENBQUM7d0JBQzVFLHVCQUF1QixDQUFDLFFBQVEsR0FBRywyQkFBMkIsQ0FBQyxRQUFRLENBQUM7d0JBQ3hFLHVCQUF1QixDQUFDLHFCQUFxQixHQUFHLDJCQUEyQixDQUFDO3dCQUM1RSxJQUFNLHVCQUF1QixHQUFHLElBQUksaURBQXVCLENBQXNGLHVCQUF1QixDQUFDLENBQUM7d0JBRTFLLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUV4RCxJQUFNLE1BQU0sR0FBMEIsRUFBRSxTQUFTLEVBQUUsc0JBQXNCLENBQUMsU0FBUzs0QkFDL0UsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLG1CQUFtQixFQUFFLEVBQUMsQ0FBQzt3QkFFMUQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWlCLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUMxRSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsMkJBQTJCLENBQUMsa0JBQWtCLEVBQUUsd0NBQXdDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN0SixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsc0JBQXNCLEVBQUU7b0JBQzdCLElBQUksWUFBMkIsRUFBRSxjQUE2QixDQUFDO29CQUUvRCxVQUFVLENBQUM7d0JBQ1AsWUFBWSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLGNBQWMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUUxQyxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO3dCQUNyRSxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO3dCQUMxRSxLQUFLLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ2hELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTt3QkFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FBQzt3QkFFeEMsNEJBQTRCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUV2RSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUMxRSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsMkNBQTJDLEVBQUU7d0JBQzVDLDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFeEYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLFlBQVksQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLElBQUksZUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9GLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw4REFBOEQsRUFBRTt3QkFDL0QsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM3Qyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXhGLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxJQUFJLGVBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvRixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsa0RBQWtELEVBQUU7d0JBQ25ELDRCQUE0QixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFeEYsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDOzRCQUN2QixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDbkUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQWlCLFlBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzVFLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxtRUFBbUUsRUFBRTt3QkFDcEUsaUJBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUU5Qyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ3hGLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFNLE9BQUEsWUFBWSxFQUFaLENBQVksQ0FBQyxDQUFDLElBQUksQ0FBQzs0QkFDaEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLFlBQVksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUM5RSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsWUFBWSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdkUsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDZGQUE2RixFQUFFO3dCQUM5RixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGlDQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO3dCQUM5Qyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXhGLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixPQUFPLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBRTlFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVFQUF1RSxFQUFFO3dCQUN4RSxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGlDQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM5RCxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO3dCQUV2Qyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXhGLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixPQUFPLENBQUMsZUFBZSxFQUFFLGdCQUFnQixDQUFDLENBQUM7d0JBRW5GLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLG9FQUFvRSxFQUFFO3dCQUNyRSxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO3dCQUN2QyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGlDQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUM5RCxJQUFNLElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQzt3QkFDeEQsWUFBWSxHQUFHLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzt3QkFDbkQsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNwRCwyQkFBMkIsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO3dCQUNwRCxvQkFBb0IsQ0FBQyxxQkFBcUIsR0FBRywyREFBNEIsQ0FBQywyQkFBMkIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO3dCQUNuSSxJQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7d0JBQ3RFLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx3QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUN0RCx1QkFBdUIsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO3dCQUNoRCx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO3dCQUM1Qyx1QkFBdUIsQ0FBQyxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDM0YsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLDZDQUFxQixDQUFxRCx1QkFBdUIsQ0FBQyxDQUFDO3dCQUNySSxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRWpGLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixPQUFPLENBQUMsZUFBZSxFQUFFLGlCQUFpQixDQUFDLENBQUM7d0JBRXBGLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGlGQUFpRixFQUFFO3dCQUNsRixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO3dCQUN2QyxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLGlDQUFlLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUMvRCw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRXhGLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFpQixPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7d0JBRWhFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbkIsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDZGQUE2RixFQUFFO3dCQUM5RixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO3dCQUU1QyxZQUFZLEdBQXNCOzRCQUM5QixRQUFRLEVBQUUsY0FBTSxPQUFBLEtBQUssRUFBTCxDQUFLO3lCQUN4QixDQUFDO3dCQUNGLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQzdDLDJCQUEyQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQ3BELG9CQUFvQixDQUFDLHFCQUFxQixHQUFHLDJEQUE0QixDQUFDLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLENBQUM7d0JBQ25JLElBQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFDdEUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLHdCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQzVFLHVCQUF1QixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQ2hELHVCQUF1QixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7d0JBQzVDLHVCQUF1QixDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDO3dCQUMzRixJQUFNLHFCQUFxQixHQUFHLElBQUksNkNBQXFCLENBQXFELHVCQUF1QixDQUFDLENBQUM7d0JBQ3JJLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDaEYsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHVHQUF1RyxFQUFFO3dCQUN4RyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO3dCQUU1QyxZQUFZLEdBQXNCOzRCQUM5QixRQUFRLEVBQUUsY0FBTSxPQUFBLEtBQUssRUFBTCxDQUFLO3lCQUN4QixDQUFDO3dCQUNGLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQzdDLDJCQUEyQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQ3BELG9CQUFvQixDQUFDLHFCQUFxQixHQUFHLDJEQUE0QixDQUFDLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLENBQUM7d0JBQ25JLElBQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFDdEUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLHdCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoRSx1QkFBdUIsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO3dCQUNoRCx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO3dCQUM1Qyx1QkFBdUIsQ0FBQyxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQyxxQkFBcUIsQ0FBQzt3QkFDM0YsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLDZDQUFxQixDQUFxRCx1QkFBdUIsQ0FBQyxDQUFDO3dCQUNySSxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBRWpGLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFpQixPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLG9GQUFvRixFQUFFO3dCQUNyRixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3dCQUV0QyxZQUFZLEdBQXNCOzRCQUM5QixRQUFRLEVBQUUsY0FBTSxPQUFBLEtBQUssRUFBTCxDQUFLO3lCQUN4QixDQUFDO3dCQUNGLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQzdDLDJCQUEyQixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQ3BELG9CQUFvQixDQUFDLHFCQUFxQixHQUFHLDJEQUE0QixDQUFDLDJCQUEyQixDQUFDLDJCQUEyQixDQUFDLENBQUM7d0JBQ25JLElBQU0sVUFBVSxHQUFHLElBQUksdUJBQVUsQ0FBQyxZQUFZLEVBQUUsb0JBQW9CLENBQUMsQ0FBQzt3QkFDdEUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLHdCQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RELEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHlCQUF5QixDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQzVFLHVCQUF1QixDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7d0JBQ2hELHVCQUF1QixDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7d0JBQzVDLHVCQUF1QixDQUFDLHFCQUFxQixHQUFHLG9CQUFvQixDQUFDLHFCQUFxQixDQUFDO3dCQUMzRixJQUFNLHFCQUFxQixHQUFHLElBQUksNkNBQXFCLENBQXFELHVCQUF1QixDQUFDLENBQUM7d0JBQ3JJLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzt3QkFFakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzNFLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyw4RkFBOEYsRUFBRTt3QkFDL0YsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzt3QkFFdEMsWUFBWSxHQUFzQjs0QkFDOUIsUUFBUSxFQUFFLGNBQU0sT0FBQSxLQUFLLEVBQUwsQ0FBSzt5QkFDeEIsQ0FBQzt3QkFDRixvQkFBb0IsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO3dCQUM3QywyQkFBMkIsQ0FBQyxRQUFRLEdBQUcsWUFBWSxDQUFDO3dCQUNwRCxvQkFBb0IsQ0FBQyxxQkFBcUIsR0FBRywyREFBNEIsQ0FBQywyQkFBMkIsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO3dCQUNuSSxJQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7d0JBQ3RFLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx3QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUN0RCxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDaEUsdUJBQXVCLENBQUMsUUFBUSxHQUFHLFlBQVksQ0FBQzt3QkFDaEQsdUJBQXVCLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQzt3QkFDNUMsdUJBQXVCLENBQUMscUJBQXFCLEdBQUcsb0JBQW9CLENBQUMscUJBQXFCLENBQUM7d0JBQzNGLElBQU0scUJBQXFCLEdBQUcsSUFBSSw2Q0FBcUIsQ0FBcUQsdUJBQXVCLENBQUMsQ0FBQzt3QkFDckkscUJBQXFCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUVqRixLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBaUIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNuRSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsc0VBQXNFLEVBQUU7d0JBQ3ZFLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7d0JBQ3ZDLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsaUNBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBRTlELElBQU0sWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLEVBQUUsc0JBQXNCLENBQUMsQ0FBQzt3QkFDNUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyx3QkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNqRCx1QkFBdUIsQ0FBQyxRQUFRLEdBQUcsMkJBQTJCLENBQUMsUUFBUSxDQUFDO3dCQUN4RSxJQUFNLHVCQUF1QixHQUFHLElBQUksaURBQXVCLENBQXNGLHVCQUF1QixDQUFDLENBQUM7d0JBRTFLLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUV6RSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsT0FBTyxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFFM0UsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUNuQixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMscUJBQXFCLEVBQUU7b0JBQzVCLElBQUksT0FBMkIsQ0FBQztvQkFFaEMsVUFBVSxDQUFDO3dCQUNQLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMvQixDQUFDLENBQUMsQ0FBQztvQkFFSCxTQUFTLENBQUM7d0JBQ04sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsaUVBQWlFLEVBQUU7d0JBQ2xFLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQzt3QkFDbkQsSUFBTSx3QkFBd0IsR0FBRyxJQUFJLG1EQUF3QixDQUFDLHVCQUF1QixDQUFDLENBQUM7d0JBQ3ZGLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3dCQUVqRSxhQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzdDLGFBQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEVBQUUseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFcEUsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3JELElBQUcsYUFBYSxFQUFFOzRCQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFpQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNEO3dCQUNELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixTQUFTLENBQUMsV0FBVyxvQkFBOEIsQ0FBQzt3QkFDNUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWlCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNoRSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsaUNBQWlDLEVBQUU7b0JBQ3hDLElBQUksT0FBMkIsQ0FBQztvQkFFaEMsVUFBVSxDQUFDO3dCQUNQLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO3dCQUNqQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlCQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7d0JBQ3JDLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQzt3QkFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDdEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ3BDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUMvQixDQUFDLENBQUMsQ0FBQztvQkFFSCxTQUFTLENBQUM7d0JBQ04sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO29CQUN0QixDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsZ0ZBQWdGLEVBQUU7d0JBQ2pGLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyx3QkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNwRCx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUM7d0JBQ25ELElBQU0sd0JBQXdCLEdBQUcsSUFBSSxtREFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3dCQUN2Rix3QkFBd0IsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUV2RSxhQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzdDLGFBQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEVBQUUseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFcEUsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3JELElBQUcsYUFBYSxFQUFFOzRCQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFpQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNEO3dCQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixTQUFTLENBQUMsV0FBVyxvQkFBOEIsQ0FBQzt3QkFDNUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQWlCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNuRSxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsb0ZBQW9GLEVBQUU7d0JBQ3JGLElBQU0sd0JBQXdCLEdBQUcsSUFBSSxtREFBd0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO3dCQUN2Rix3QkFBd0IsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO3dCQUV2RSxhQUFNLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQzdDLGFBQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsY0FBYyxFQUFFLEVBQUUseUJBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFFcEUsSUFBTSxhQUFhLEdBQUcsaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUM7d0JBQ3JELElBQUcsYUFBYSxFQUFFOzRCQUNkLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFpQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7eUJBQzNEO3dCQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFpQixTQUFTLENBQUMsV0FBVyxvQkFBOEIsQ0FBQzt3QkFDNUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQWlCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNoRSxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsNkJBQTZCLEVBQUU7b0JBQ3BDLFVBQVUsQ0FBQzt3QkFDUCxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsRUFBRSxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFDckQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGlEQUFpRCxFQUFFLFVBQUMsSUFBSTt3QkFDdkQsMkJBQTJCLENBQUMsUUFBUSxHQUFHLDJCQUFZLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzt3QkFDeEUsSUFBTSwyQkFBMkIsR0FBZ0MsMkRBQTRCLENBQUMsMkJBQTJCLENBQUMsMkJBQTJCLENBQUMsQ0FBQzt3QkFDdkosS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUMzQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RDLENBQUMsQ0FBQyxDQUFDO3dCQUVILEtBQUssQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUM7NEJBQ3BFLElBQUksRUFBRSxDQUFDO3dCQUNYLENBQUMsQ0FBQyxDQUFDO3dCQUVILDJCQUEyQixDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUM7d0JBQ3RELHNCQUFzQixDQUFDLHFCQUFxQixHQUFHLDJCQUEyQixDQUFDO3dCQUUzRSxJQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsWUFBWSxFQUFFLHNCQUFzQixDQUFDLENBQUM7d0JBQzVFLFlBQVksQ0FBQyxhQUFhLENBQUMsd0JBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDN0MsdUJBQXVCLENBQUMsUUFBUSxHQUFHLDJCQUEyQixDQUFDLFFBQVEsQ0FBQzt3QkFDeEUsdUJBQXVCLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQzt3QkFDOUMsdUJBQXVCLENBQUMscUJBQXFCLEdBQUcsMkJBQTJCLENBQUM7d0JBQzVFLElBQU0sdUJBQXVCLEdBQUcsSUFBSSxpREFBdUIsQ0FBc0YsdUJBQXVCLENBQUMsQ0FBQzt3QkFFMUssdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxQyxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=