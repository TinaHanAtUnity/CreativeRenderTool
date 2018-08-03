System.register(["mocha", "sinon", "Native/NativeBridge", "Views/Overlay", "Models/DeviceInfo", "Managers/ThirdPartyEventManager", "Utilities/Request", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/ViewController", "Models/Assets/Video", "Managers/FocusManager", "Models/ClientInfo", "Managers/OperativeEventManager", "AdUnits/PerformanceAdUnit", "Views/PerformanceEndScreen", "Models/Campaigns/PerformanceCampaign", "Views/GDPRPrivacy", "Models/Placement", "Managers/GdprManager", "EventHandlers/OverlayEventHandler", "../TestHelpers/TestFixtures", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, Overlay_1, DeviceInfo_1, ThirdPartyEventManager_1, Request_1, AdUnitContainer_1, ViewController_1, Video_1, FocusManager_1, ClientInfo_1, OperativeEventManager_1, PerformanceAdUnit_1, PerformanceEndScreen_1, PerformanceCampaign_1, GDPRPrivacy_1, Placement_1, GdprManager_1, OverlayEventHandler_1, TestFixtures_1, ProgrammaticTrackingService_1;
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
            function (Overlay_1_1) {
                Overlay_1 = Overlay_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (ViewController_1_1) {
                ViewController_1 = ViewController_1_1;
            },
            function (Video_1_1) {
                Video_1 = Video_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (PerformanceAdUnit_1_1) {
                PerformanceAdUnit_1 = PerformanceAdUnit_1_1;
            },
            function (PerformanceEndScreen_1_1) {
                PerformanceEndScreen_1 = PerformanceEndScreen_1_1;
            },
            function (PerformanceCampaign_1_1) {
                PerformanceCampaign_1 = PerformanceCampaign_1_1;
            },
            function (GDPRPrivacy_1_1) {
                GDPRPrivacy_1 = GDPRPrivacy_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (OverlayEventHandler_1_1) {
                OverlayEventHandler_1 = OverlayEventHandler_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            describe('GDPREventHandlerTest', function () {
                var nativeBridge;
                var adUnit;
                var adUnitParameters;
                var gdprEventHandler;
                beforeEach(function () {
                    adUnitParameters = {
                        forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                        focusManager: sinon.createStubInstance(FocusManager_1.FocusManager),
                        container: sinon.createStubInstance(ViewController_1.ViewController),
                        deviceInfo: sinon.createStubInstance(DeviceInfo_1.DeviceInfo),
                        clientInfo: sinon.createStubInstance(ClientInfo_1.ClientInfo),
                        thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager),
                        operativeEventManager: sinon.createStubInstance(OperativeEventManager_1.OperativeEventManager),
                        placement: sinon.createStubInstance(Placement_1.Placement),
                        campaign: sinon.createStubInstance(PerformanceCampaign_1.PerformanceCampaign),
                        configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                        request: sinon.createStubInstance(Request_1.Request),
                        options: {},
                        endScreen: sinon.createStubInstance(PerformanceEndScreen_1.PerformanceEndScreen),
                        overlay: sinon.createStubInstance(Overlay_1.Overlay),
                        video: sinon.createStubInstance(Video_1.Video),
                        privacy: sinon.createStubInstance(GDPRPrivacy_1.GDPRPrivacy),
                        gdprManager: sinon.createStubInstance(GdprManager_1.GdprManager),
                        programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService)
                    };
                    adUnit = sinon.createStubInstance(PerformanceAdUnit_1.PerformanceAdUnit);
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    gdprEventHandler = new OverlayEventHandler_1.OverlayEventHandler(nativeBridge, adUnit, adUnitParameters);
                });
                describe('When calling onGDPRPopupSkipped', function () {
                    beforeEach(function () {
                        adUnitParameters.configuration.set('optOutRecorded', false);
                        sinon.spy(adUnitParameters.configuration, 'setOptOutRecorded');
                    });
                    it('should send GDPR skip event', function () {
                        gdprEventHandler.onGDPRPopupSkipped();
                        sinon.assert.calledWith(adUnitParameters.configuration.setOptOutRecorded, true);
                        sinon.assert.calledWith(adUnitParameters.gdprManager.sendGDPREvent, GdprManager_1.GDPREventAction.SKIP);
                    });
                    it('GDPR skip event should not be sent', function () {
                        adUnitParameters.configuration.set('optOutRecorded', true);
                        gdprEventHandler.onGDPRPopupSkipped();
                        sinon.assert.notCalled(adUnitParameters.gdprManager.sendGDPREvent);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0RQUkV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJHRFBSRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBd0JBLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTtnQkFFN0IsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE1BQXlCLENBQUM7Z0JBQzlCLElBQUksZ0JBQThDLENBQUM7Z0JBRW5ELElBQUksZ0JBQTBELENBQUM7Z0JBRS9ELFVBQVUsQ0FBQztvQkFDUCxnQkFBZ0IsR0FBRzt3QkFDZixnQkFBZ0IsRUFBRSw2QkFBVyxDQUFDLFNBQVM7d0JBQ3ZDLFlBQVksRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQzt3QkFDcEQsU0FBUyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywrQkFBYyxDQUFDO3dCQUNuRCxVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUM7d0JBQ2hELFVBQVUsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsdUJBQVUsQ0FBQzt3QkFDaEQsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLCtDQUFzQixDQUFDO3dCQUN4RSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsNkNBQXFCLENBQUM7d0JBQ3RFLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMscUJBQVMsQ0FBQzt3QkFDOUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5Q0FBbUIsQ0FBQzt3QkFDdkQsYUFBYSxFQUFFLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUU7d0JBQzlDLE9BQU8sRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsaUJBQU8sQ0FBQzt3QkFDMUMsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsU0FBUyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywyQ0FBb0IsQ0FBQzt3QkFDekQsT0FBTyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBTyxDQUFDO3dCQUMxQyxLQUFLLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGFBQUssQ0FBQzt3QkFDdEMsT0FBTyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5QkFBVyxDQUFDO3dCQUM5QyxXQUFXLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUM7d0JBQ2xELDJCQUEyQixFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5REFBMkIsQ0FBQztxQkFDckYsQ0FBQztvQkFFRixNQUFNLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHFDQUFpQixDQUFDLENBQUM7b0JBQ3JELFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUN0RCxnQkFBZ0IsR0FBRyxJQUFJLHlDQUFtQixDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztnQkFDdkYsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLGlDQUFpQyxFQUFFO29CQUN4QyxVQUFVLENBQUM7d0JBQ1AsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDNUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztvQkFDbkUsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFO3dCQUM5QixnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO3dCQUV0QyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUNoRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBaUIsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSw2QkFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUM5RyxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsb0NBQW9DLEVBQUU7d0JBQ3JDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzNELGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLENBQUM7d0JBRXRDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFpQixnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ3ZGLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==