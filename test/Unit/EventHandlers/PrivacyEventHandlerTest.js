System.register(["mocha", "sinon", "Native/NativeBridge", "Views/Overlay", "Models/DeviceInfo", "Managers/ThirdPartyEventManager", "Utilities/Request", "Constants/Platform", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/ViewController", "Models/Assets/Video", "Managers/FocusManager", "Models/ClientInfo", "Managers/OperativeEventManager", "AdUnits/PerformanceAdUnit", "Views/PerformanceEndScreen", "Models/Campaigns/PerformanceCampaign", "EventHandlers/PrivacyEventHandler", "Models/Configuration", "Native/Api/Sdk", "Native/Api/UrlScheme", "Native/Api/Intent", "Views/GDPRPrivacy", "Models/Placement", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var sinon, NativeBridge_1, Overlay_1, DeviceInfo_1, ThirdPartyEventManager_1, Request_1, Platform_1, AdUnitContainer_1, ViewController_1, Video_1, FocusManager_1, ClientInfo_1, OperativeEventManager_1, PerformanceAdUnit_1, PerformanceEndScreen_1, PerformanceCampaign_1, PrivacyEventHandler_1, Configuration_1, Sdk_1, UrlScheme_1, Intent_1, GDPRPrivacy_1, Placement_1, GdprManager_1, ProgrammaticTrackingService_1;
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
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
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
            function (PrivacyEventHandler_1_1) {
                PrivacyEventHandler_1 = PrivacyEventHandler_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (UrlScheme_1_1) {
                UrlScheme_1 = UrlScheme_1_1;
            },
            function (Intent_1_1) {
                Intent_1 = Intent_1_1;
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
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            describe('PrivacyEventHandlerTest', function () {
                var nativeBridge;
                var adUnit;
                var adUnitParameters;
                var privacyEventHandler;
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
                        configuration: sinon.createStubInstance(Configuration_1.Configuration),
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
                    nativeBridge.UrlScheme = sinon.createStubInstance(UrlScheme_1.UrlSchemeApi);
                    nativeBridge.Intent = sinon.createStubInstance(Intent_1.IntentApi);
                    nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    privacyEventHandler = new PrivacyEventHandler_1.PrivacyEventHandler(nativeBridge, adUnitParameters);
                });
                describe('on onPrivacy', function () {
                    var url = 'http://example.com';
                    it('should open url iOS', function () {
                        nativeBridge.getPlatform.returns(Platform_1.Platform.IOS);
                        privacyEventHandler.onPrivacy('http://example.com');
                        sinon.assert.calledWith(nativeBridge.UrlScheme.open, 'http://example.com');
                    });
                    it('should open url Android', function () {
                        nativeBridge.getPlatform.returns(Platform_1.Platform.ANDROID);
                        privacyEventHandler.onPrivacy(url);
                        sinon.assert.calledWith(nativeBridge.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': url
                        });
                    });
                });
                describe('on onGDPROptOut', function () {
                    it('should send operative event with action `optout`', function () {
                        adUnitParameters.configuration.isOptOutEnabled.returns(false);
                        privacyEventHandler.onGDPROptOut(true);
                        sinon.assert.calledWith(adUnitParameters.gdprManager.sendGDPREvent, 'optout', GdprManager_1.GDPREventSource.USER);
                    });
                    it('should send operative event with action `optin`', function () {
                        adUnitParameters.configuration.isOptOutEnabled.returns(true);
                        adUnitParameters.configuration.isOptOutRecorded.returns(true);
                        privacyEventHandler.onGDPROptOut(false);
                        sinon.assert.calledWith(adUnitParameters.gdprManager.sendGDPREvent, 'optin');
                    });
                    it('should send operative event with action `skip`', function () {
                        adUnitParameters.configuration.isOptOutEnabled.returns(true);
                        adUnitParameters.configuration.isOptOutRecorded.returns(false);
                        privacyEventHandler.onGDPROptOut(false);
                        sinon.assert.calledWith(adUnitParameters.gdprManager.sendGDPREvent, 'skip');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeUV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQcml2YWN5RXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBNEJBLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtnQkFFaEMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE1BQXlCLENBQUM7Z0JBQzlCLElBQUksZ0JBQThDLENBQUM7Z0JBRW5ELElBQUksbUJBQXdDLENBQUM7Z0JBRTdDLFVBQVUsQ0FBQztvQkFDUCxnQkFBZ0IsR0FBRzt3QkFDZixnQkFBZ0IsRUFBRSw2QkFBVyxDQUFDLFNBQVM7d0JBQ3ZDLFlBQVksRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQzt3QkFDcEQsU0FBUyxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQywrQkFBYyxDQUFDO3dCQUNuRCxVQUFVLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUFVLENBQUM7d0JBQ2hELFVBQVUsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsdUJBQVUsQ0FBQzt3QkFDaEQsc0JBQXNCLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFDLCtDQUFzQixDQUFDO3dCQUN4RSxxQkFBcUIsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMsNkNBQXFCLENBQUM7d0JBQ3RFLFNBQVMsRUFBRSxLQUFLLENBQUMsa0JBQWtCLENBQUMscUJBQVMsQ0FBQzt3QkFDOUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx5Q0FBbUIsQ0FBQzt3QkFDdkQsYUFBYSxFQUFFLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyw2QkFBYSxDQUFDO3dCQUN0RCxPQUFPLEVBQUUsS0FBSyxDQUFDLGtCQUFrQixDQUFD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