System.register(["mocha", "chai", "sinon", "Native/NativeBridge", "Managers/SessionManager", "EventHandlers/OverlayEventHandler", "../TestHelpers/TestFixtures", "Views/Overlay", "Managers/ThirdPartyEventManager", "Utilities/Request", "Constants/FinishState", "Utilities/Double", "Managers/WakeUpManager", "AdUnits/PerformanceAdUnit", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Managers/MetaDataManager", "Managers/FocusManager", "Views/PerformanceEndScreen", "Managers/OperativeEventManagerFactory", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, NativeBridge_1, SessionManager_1, OverlayEventHandler_1, TestFixtures_1, Overlay_1, ThirdPartyEventManager_1, Request_1, FinishState_1, Double_1, WakeUpManager_1, PerformanceAdUnit_1, Platform_1, AdUnitContainer_1, Activity_1, Video_1, MetaDataManager_1, FocusManager_1, PerformanceEndScreen_1, OperativeEventManagerFactory_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (OverlayEventHandler_1_1) {
                OverlayEventHandler_1 = OverlayEventHandler_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (FinishState_1_1) {
                FinishState_1 = FinishState_1_1;
            },
            function (Double_1_1) {
                Double_1 = Double_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
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
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
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
            describe('OverlayEventHandlerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, performanceAdUnit;
                var container;
                var sessionManager;
                var endScreen;
                var video;
                var metaDataManager;
                var focusManager;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var request;
                var overlay;
                var performanceAdUnitParameters;
                var overlayEventHandler;
                var campaign;
                var placement;
                var configuration;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    campaign = TestFixtures_1.TestFixtures.getCampaign();
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: campaign
                    });
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
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
                    placement = TestFixtures_1.TestFixtures.getPlacement();
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
                    performanceAdUnit = new PerformanceAdUnit_1.PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
                    overlayEventHandler = new OverlayEventHandler_1.OverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                });
                describe('When calling onSkip', function () {
                    beforeEach(function () {
                        sinon.spy(nativeBridge.VideoPlayer, 'pause');
                        sinon.spy(operativeEventManager, 'sendSkip');
                        sinon.spy(nativeBridge.AndroidAdUnit, 'setViews');
                        sinon.spy(container, 'reconfigure');
                        sinon.spy(overlay, 'hide');
                        overlayEventHandler.onOverlaySkip(1);
                    });
                    it('should pause video player', function () {
                        sinon.assert.called(nativeBridge.VideoPlayer.pause);
                    });
                    it('should set video inactive', function () {
                        chai_1.assert.isFalse(performanceAdUnit.isActive());
                    });
                    it('should set finish state', function () {
                        chai_1.assert.equal(performanceAdUnit.getFinishState(), FinishState_1.FinishState.SKIPPED);
                    });
                    it('should send skip', function () {
                        var params = { placement: placement,
                            videoOrientation: performanceAdUnit.getVideoOrientation(),
                            adUnitStyle: undefined,
                            asset: performanceAdUnit.getVideo(),
                            videoProgress: performanceAdUnit.getVideo().getPosition()
                        };
                        sinon.assert.calledWith(operativeEventManager.sendSkip, params);
                    });
                    it('should call reconfigure', function () {
                        sinon.assert.calledWith(container.reconfigure, 0 /* ENDSCREEN */);
                    });
                    it('should hide overlay', function () {
                        sinon.assert.called(overlay.hide);
                    });
                });
                describe('When calling onMute', function () {
                    beforeEach(function () {
                        sinon.spy(nativeBridge.VideoPlayer, 'setVolume');
                    });
                    it('should set volume to zero when muted', function () {
                        overlayEventHandler.onOverlayMute(true);
                        sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double_1.Double(0));
                    });
                    it('should set volume to 1 when not muted', function () {
                        overlayEventHandler.onOverlayMute(false);
                        sinon.assert.calledWith(nativeBridge.VideoPlayer.setVolume, new Double_1.Double(1));
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheUV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPdmVybGF5RXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBbUNBLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtnQkFFaEMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixFQUFFLGlCQUFvQyxDQUFDO2dCQUNyRSxJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksY0FBOEIsQ0FBQztnQkFDbkMsSUFBSSxTQUErQixDQUFDO2dCQUNwQyxJQUFJLEtBQVksQ0FBQztnQkFDakIsSUFBSSxlQUFnQyxDQUFDO2dCQUNyQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUkscUJBQTRDLENBQUM7Z0JBQ2pELElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLHNCQUE4QyxDQUFDO2dCQUNuRCxJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSwyQkFBeUQsQ0FBQztnQkFDOUQsSUFBSSxtQkFBNkQsQ0FBQztnQkFDbEUsSUFBSSxRQUE2QixDQUFDO2dCQUNsQyxJQUFJLFNBQW9CLENBQUM7Z0JBQ3pCLElBQUksYUFBNEIsQ0FBQztnQkFDakMsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsQ0FBQyxDQUFDO29CQUVI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