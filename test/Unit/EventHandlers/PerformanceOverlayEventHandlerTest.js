System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "../TestHelpers/TestFixtures", "Views/Overlay", "AdUnits/PerformanceAdUnit", "EventHandlers/PerformanceOverlayEventHandler", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/Activity", "Models/Assets/Video", "Utilities/Request", "Managers/WakeUpManager", "Managers/FocusManager", "Managers/ThirdPartyEventManager", "Managers/SessionManager", "Managers/MetaDataManager", "Views/PerformanceEndScreen", "Managers/OperativeEventManagerFactory", "Views/Privacy", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, TestFixtures_1, Overlay_1, PerformanceAdUnit_1, PerformanceOverlayEventHandler_1, Platform_1, AdUnitContainer_1, Activity_1, Video_1, Request_1, WakeUpManager_1, FocusManager_1, ThirdPartyEventManager_1, SessionManager_1, MetaDataManager_1, PerformanceEndScreen_1, OperativeEventManagerFactory_1, Privacy_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (PerformanceOverlayEventHandler_1_1) {
                PerformanceOverlayEventHandler_1 = PerformanceOverlayEventHandler_1_1;
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
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
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
            describe('PerformanceOverlayEventHandlerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var overlay;
                var endScreen;
                var container;
                var performanceAdUnit;
                var video;
                var performanceAdUnitParameters;
                var performanceOverlayEventHandler;
                var request;
                var deviceInfo;
                var clientInfo;
                var forceQuitManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var campaign = TestFixtures_1.TestFixtures.getCampaign();
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    video = new Video_1.Video('', TestFixtures_1.TestFixtures.getSession());
                    var thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
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
                        showGDPRBanner: true,
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
                    performanceOverlayEventHandler = new PerformanceOverlayEventHandler_1.PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
                });
                describe('with onSkip', function () {
                    it('should show end screen', function () {
                        chai_1.assert.isDefined(endScreen, 'endScreen not defined');
                        sinon.spy(endScreen, 'show');
                        performanceOverlayEventHandler.onOverlaySkip(1);
                        if (endScreen) {
                            sinon.assert.called(endScreen.show);
                        }
                    });
                    it('should trigger onFinish', function () {
                        var spy = sinon.spy(performanceAdUnit.onFinish, 'trigger');
                        performanceOverlayEventHandler.onOverlaySkip(1);
                        sinon.assert.called(spy);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VPdmVybGF5RXZlbnRIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBlcmZvcm1hbmNlT3ZlcmxheUV2ZW50SGFuZGxlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQTZCQSxRQUFRLENBQUMsb0NBQW9DLEVBQUU7Z0JBRTNDLElBQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNyQyxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxPQUFnQixDQUFDO2dCQUNyQixJQUFJLFNBQStCLENBQUM7Z0JBQ3BDLElBQUksU0FBMEIsQ0FBQztnQkFDL0IsSUFBSSxpQkFBb0MsQ0FBQztnQkFDekMsSUFBSSxLQUFZLENBQUM7Z0JBQ2pCLElBQUksMkJBQXlELENBQUM7Z0JBQzlELElBQUksOEJBQThELENBQUM7Z0JBQ25FLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDO3dCQUM1QixnQkFBZ0Isa0JBQUE7d0JBQ2hCLGNBQWMsZ0JBQUE7cUJBQ2pCLENBQUMsQ0FBQztvQkFFSCxJQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFELElBQU0sUUFBUSxHQUFHLDJCQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQzVDLElBQU0sYUFBYSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztvQkFDdEQsVUFBVSxHQUFHLDJCQUFZLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzFELFVBQVUsR0FBRywyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ2pELElBQU0sWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsSUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDcEUsT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7b0JBQ25ELGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCxTQUFTLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksRUFBRSwyQkFBWSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFDOUYsS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLEVBQUUsRUFBRSwyQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7b0JBQ2pELElBQU0sc0JBQXNCLEdBQUcsSUFBSSwrQ0FBc0IsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ2pGLElBQU0sY0FBYyxHQUFHLElBQUksK0JBQWMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ2pFLElBQU0scUJBQXFCLEdBQUcsMkRBQTRCLENBQUMsMkJBQTJCLENBQUM7d0JBQ25GLFlBQVksRUFBRSxZQUFZO3dCQUMxQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsZUFBZSxFQUFFLGVBQWU7d0JBQ2hDLGNBQWMsRUFBRSxjQUFjO3dCQUM5QixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixRQUFRLEVBQUUsUUFBUTtxQkFDckIsQ0FBQyxDQUFDO29CQUVILElBQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztvQkFDNUUsSUFBTSxlQUFlLEdBQTBCO3dCQUMzQyxZQUFZLEVBQUUsWUFBWTt3QkFDMUIsUUFBUSxFQUFHLFVBQVUsQ0FBQyxXQUFXLEVBQUU7d0JBQ25DLE1BQU0sRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFO3dCQUM5QixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsY0FBYyxFQUFFLElBQUk7d0JBQ3BCLE9BQU8sRUFBRSxhQUFhLENBQUMsVUFBVSxFQUFFO3dCQUNuQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRTtxQkFDekMsQ0FBQztvQkFDRixTQUFTLEdBQUcsSUFBSSwyQ0FBb0IsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2hFLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDekYsSUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsQ0FBQztvQkFDMUQsSUFBTSwyQkFBMkIsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMseURBQTJCLENBQUMsQ0FBQztvQkFFMUYsMkJBQTJCLEdBQUc7d0JBQzFCLGdCQUFnQixFQUFFLDZCQUFXLENBQUMsU0FBUzt3QkFDdkMsWUFBWSxFQUFFLFlBQVk7d0JBQzFCLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixVQUFVLEVBQUUsVUFBVTt3QkFDdEIsVUFBVSxFQUFFLFVBQVU7d0JBQ3RCLHNCQUFzQixFQUFFLHNCQUFzQjt3QkFDOUMscUJBQXFCLEVBQUUscUJBQXFCO3dCQUM1QyxTQUFTLEVBQUUsMkJBQVksQ0FBQyxZQUFZLEVBQUU7d0JBQ3RDLFFBQVEsRUFBRSxRQUFRO3dCQUNsQixhQUFhLEVBQUUsYUFBYTt3QkFDNUIsT0FBTyxFQUFFLE9BQU87d0JBQ2hCLE9BQU8sRUFBRSxFQUFFO3dCQUNYLFNBQVMsRUFBRSxTQUFTO3dCQUNwQixPQUFPLEVBQUUsT0FBTzt3QkFDaEIsS0FBSyxFQUFFLEtBQUs7d0JBQ1osT0FBTyxFQUFFLE9BQU87d0JBQ2hCLFdBQVcsRUFBRSxXQUFXO3dCQUN4QiwyQkFBMkIsRUFBRSwyQkFBMkI7cUJBQzNELENBQUM7b0JBRUYsaUJBQWlCLEdBQUcsSUFBSSxxQ0FBaUIsQ0FBQyxZQUFZLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDckYsOEJBQThCLEdBQUcsSUFBSSwrREFBOEIsQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztnQkFDdEksQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLGFBQWEsRUFBRTtvQkFDcEIsRUFBRSxDQUFDLHdCQUF3QixFQUFFO3dCQUN6QixhQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO3dCQUNyRCxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDN0IsOEJBQThCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUVoRCxJQUFHLFNBQVMsRUFBRTs0QkFDVixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBaUIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO3lCQUN2RDtvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMseUJBQXlCLEVBQUU7d0JBQzFCLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO3dCQUM3RCw4QkFBOEIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2hELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM3QixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDIn0=