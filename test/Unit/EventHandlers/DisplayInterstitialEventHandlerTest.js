System.register(["mocha", "sinon", "Views/DisplayInterstitial", "Models/Placement", "Constants/Platform", "Test/Unit/TestHelpers/TestFixtures", "Managers/FocusManager", "Managers/ThirdPartyEventManager", "Managers/OperativeEventManager", "Utilities/Request", "AdUnits/Containers/AdUnitContainer", "AdUnits/DisplayInterstitialAdUnit", "AdUnits/Containers/Activity", "EventHandlers/DisplayInterstitialEventHandler", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, DisplayInterstitial_1, Placement_1, Platform_1, TestFixtures_1, FocusManager_1, ThirdPartyEventManager_1, OperativeEventManager_1, Request_1, AdUnitContainer_1, DisplayInterstitialAdUnit_1, Activity_1, DisplayInterstitialEventHandler_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (DisplayInterstitial_1_1) {
                DisplayInterstitial_1 = DisplayInterstitial_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (DisplayInterstitialAdUnit_1_1) {
                DisplayInterstitialAdUnit_1 = DisplayInterstitialAdUnit_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (DisplayInterstitialEventHandler_1_1) {
                DisplayInterstitialEventHandler_1 = DisplayInterstitialEventHandler_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (Privacy_1_1) {
                Privacy_1 = Privacy_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            },
            function (ForceQuitManager_1_1) {
                ForceQuitManager_1 = ForceQuitManager_1_1;
            }
        ],
        execute: function () {
            describe('DisplayInterstitialEventHandler', function () {
                var view;
                var nativeBridge;
                var placement;
                var campaign;
                var sandbox;
                var displayInterstitialAdUnitParameters;
                var displayInterstitialAdUnit;
                var displayInterstitialEventHandler;
                var operativeEventManager;
                var forceQuitManager;
                describe('on Display Interstitial Markup Campaign', function () {
                    eventHandlerTests();
                });
                function eventHandlerTests() {
                    beforeEach(function () {
                        sandbox = sinon.sandbox.create();
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                        placement = new Placement_1.Placement({
                            id: '123',
                            name: 'test',
                            default: true,
                            allowSkip: true,
                            skipInSeconds: 5,
                            disableBackButton: true,
                            useDeviceOrientationForVideo: false,
                            muteVideo: false
                        });
                        campaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                        sandbox.stub(nativeBridge, 'getApiLevel').returns(16);
                        var container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                        var focusManager = sinon.createStubInstance(FocusManager_1.FocusManager);
                        var request = sinon.createStubInstance(Request_1.Request);
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        var thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager_1.ThirdPartyEventManager);
                        operativeEventManager = sinon.createStubInstance(OperativeEventManager_1.OperativeEventManager);
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                        view = new DisplayInterstitial_1.DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);
                        displayInterstitialAdUnitParameters = {
                            forceOrientation: AdUnitContainer_1.Orientation.LANDSCAPE,
                            focusManager: focusManager,
                            container: container,
                            deviceInfo: deviceInfo,
                            clientInfo: clientInfo,
                            thirdPartyEventManager: thirdPartyEventManager,
                            operativeEventManager: operativeEventManager,
                            placement: placement,
                            campaign: campaign,
                            configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                            request: request,
                            options: {},
                            view: view,
                            gdprManager: gdprManager,
                            programmaticTrackingService: programmaticTrackingService
                        };
                        displayInterstitialAdUnit = new DisplayInterstitialAdUnit_1.DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
                        displayInterstitialEventHandler = new DisplayInterstitialEventHandler_1.DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
                        view.addEventHandler(displayInterstitialEventHandler);
                        view.render();
                        return view.show();
                    });
                    afterEach(function () {
                        view.hide();
                        sandbox.restore();
                    });
                    // TODO: Not sure about this test...
                    /*
                    it('should redirect when the redirect message is sent', () => {
                        const spy = sinon.spy();
            
                        displayInterstitialEventHandler.onDisplayInterstitialClick = spy;
                        window.postMessage({ type: 'redirect', href: 'https://unity3d.com' }, '*');
                        return new Promise((resolve, reject) => {
                            setTimeout(() => {
                                try {
                                    assert.isTrue(spy.calledWith('https://unity3d.com'));
                                    view.hide();
                                    resolve();
                                } catch (e) {
                                    view.hide();
                                    reject(e);
                                }
                            }, 100);
                        });
                    });
                    */
                    describe('on close', function () {
                        it('should hide the adUnit', function () {
                            sandbox.stub(displayInterstitialAdUnit, 'hide');
                            displayInterstitialEventHandler.onDisplayInterstitialClose();
                            sinon.assert.called(displayInterstitialAdUnit.hide);
                        });
                        it('should send the view diagnostic event', function () {
                            displayInterstitialEventHandler.onDisplayInterstitialClose();
                            sinon.assert.called(operativeEventManager.sendView);
                        });
                        it('should send the third quartile diagnostic event', function () {
                            displayInterstitialEventHandler.onDisplayInterstitialClose();
                            sinon.assert.called(operativeEventManager.sendThirdQuartile);
                        });
                    });
                }
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEaXNwbGF5SW50ZXJzdGl0aWFsRXZlbnRIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBdUJBLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRTtnQkFDeEMsSUFBSSxJQUF5QixDQUFDO2dCQUM5QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksU0FBb0IsQ0FBQztnQkFDekIsSUFBSSxRQUFxQyxDQUFDO2dCQUMxQyxJQUFJLE9BQTJCLENBQUM7Z0JBQ2hDLElBQUksbUNBQXlFLENBQUM7Z0JBQzlFLElBQUkseUJBQW9ELENBQUM7Z0JBQ3pELElBQUksK0JBQWdFLENBQUM7Z0JBQ3JFLElBQUkscUJBQTRDLENBQUM7Z0JBQ2pELElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFFBQVEsQ0FBQyx5Q0FBeUMsRUFBRTtvQkFDaEQsaUJBQWlCLEVBQUUsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxpQkFBaUI7b0JBQ3RCLFVBQVUsQ0FBQzt3QkFDUCxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQzt3QkFDakMsWUFBWSxHQUFHLDJCQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7d0JBQzlDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO3dCQUM5RCxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDOzRCQUN0QixFQUFFLEVBQUUsS0FBSzs0QkFDVCxJQUFJLEVBQUUsTUFBTTs0QkFDWixPQUFPLEVBQUUsSUFBSTs0QkFDYixTQUFTLEVBQUUsSUFBSTs0QkFDZixhQUFhLEVBQUUsQ0FBQzs0QkFDaEIsaUJBQWlCLEVBQUUsSUFB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