System.register(["mocha", "sinon", "Native/NativeBridge", "../TestHelpers/TestFixtures", "Views/Overlay", "AdUnits/PerformanceAdUnit", "EventHandlers/PerformanceVideoEventHandler", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Utilities/Request", "Managers/ThirdPartyEventManager", "Managers/SessionManager", "Managers/MetaDataManager", "Managers/FocusManager", "Managers/WakeUpManager", "Views/PerformanceEndScreen", "Managers/OperativeEventManagerFactory", "AdUnits/VideoAdUnit", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, TestFixtures_1, Overlay_1, PerformanceAdUnit_1, PerformanceVideoEventHandler_1, Platform_1, AdUnitContainer_1, Activity_1, Video_1, Request_1, ThirdPartyEventManager_1, SessionManager_1, MetaDataManager_1, FocusManager_1, WakeUpManager_1, PerformanceEndScreen_1, OperativeEventManagerFactory_1, VideoAdUnit_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (PerformanceAdUnit_1_1) {
                PerformanceAdUnit_1 = PerformanceAdUnit_1_1;
            },
            function (PerformanceVideoEventHandler_1_1) {
                PerformanceVideoEventHandler_1 = PerformanceVideoEventHandler_1_1;
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
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
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
            describe('PerformanceVideoEventHandlersTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, overlay, endScreen;
                var container;
                var performanceAdUnit;
                var video;
                var performanceAdUnitParameters;
                var performanceVideoEventHandler;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    var request = new Request_1.Request(nativeBridge, wakeUpManager);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var campaign = TestFixtures_1.TestFixtures.getCampaign();
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: campaign
                    });
                    var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                    var endScreenParams = {
                        nativeBridge: nativeBridge,
                        language: deviceInfo.getLanguage(),
                        gameId: clientInfo.getGameId(),
                        privacy: privacy,
                        showGDPRBanner: false,
                        abGroup: configuration.getAbGroup(),
                        targetGameName: campaign.getGameName()
                    };
                    endScreen = new PerformanceEndScreen_1.PerformanceEndScreen(endScreenParams, campaign);
                    overlay = new Overlay_1.Overlay(nativeBridge, false, 'en', clientInfo.getGameId(), privacy, false);
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    performanceAdUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
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
                    performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                    var videoEventHandlerParams = {
                        nativeBrige: nativeBridge,
                        adUnit: performanceAdUnit,
                        campaign: campaign,
                        operativeEventManager: operativeEventManager,
                        thirdPartyEventManager: thirdPartyEventManager,
                        configuration: configuration,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        video: video,
                        adUnitStyle: undefined,
                        clientInfo: clientInfo
                    };
                    performanceVideoEventHandler = new PerformanceVideoEventHandler_1.PerformanceVideoEventHandler(videoEventHandlerParams);
                });
                describe('with onVideoCompleted', function () {
                    it('should show end screen', function () {
                        sinon.spy(endScreen, 'show');
                        performanceVideoEventHandler.onCompleted(video.getUrl());
                        sinon.assert.called(endScreen.show);
                    });
                });
                describe('with onVideoError', function () {
                    it('should show end screen', function () {
                        sinon.spy(endScreen, 'show');
                        // Set prepare called so that error will trigger
                        performanceAdUnit.setVideoState(VideoAdUnit_1.VideoState.PREPARING);
                        // Cause an error by giving too large duration
                        performanceVideoEventHandler.onPrepared(video.getUrl(), 50000, 1024, 768);
                        sinon.assert.called(endScreen.show);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VWaWRlb0V2ZW50SGFuZGxlcnNUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUGVyZm9ybWFuY2VWaWRlb0V2ZW50SGFuZGxlcnNUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUE2QkEsUUFBUSxDQUFDLG1DQUFtQyxFQUFFO2dCQUUxQyxJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLEVBQUUsT0FBZ0IsRUFBRSxTQUErQixDQUFDO2dCQUNsRixJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksaUJBQW9DLENBQUM7Z0JBQ3pDLElBQUksS0FBWSxDQUFDO2dCQUNqQixJQUFJLDJCQUF5RCxDQUFDO2dCQUM5RCxJQUFJLDRCQUEwRCxDQUFDO2dCQUMvRCxJQUFJLGdCQUFrQyxDQUFDO2dCQUV2QyxVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixDQUFDLENBQUM7b0JBRUgsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLG1DQUFnQixDQUFDLENBQUM7b0JBQzlELFNBQVMsR0FBRyxJQUFJLG1CQUFRLENBQUMsWUFBWSxFQUFFLDJCQUFZLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUM5RixLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsRUFBRSxFQUFFLDJCQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztvQkFFakQsSUFBTSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlB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