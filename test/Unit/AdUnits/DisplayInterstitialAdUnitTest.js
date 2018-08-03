System.register(["mocha", "sinon", "AdUnits/DisplayInterstitialAdUnit", "AdUnits/Containers/AdUnitContainer", "Managers/SessionManager", "Utilities/Request", "Views/DisplayInterstitial", "Test/Unit/TestHelpers/TestFixtures", "AdUnits/Containers/Activity", "Constants/Platform", "Managers/ThirdPartyEventManager", "Managers/MetaDataManager", "Managers/WakeUpManager", "Managers/FocusManager", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "Views/Privacy", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, DisplayInterstitialAdUnit_1, AdUnitContainer_1, SessionManager_1, Request_1, DisplayInterstitial_1, TestFixtures_1, Activity_1, Platform_1, ThirdPartyEventManager_1, MetaDataManager_1, WakeUpManager_1, FocusManager_1, OperativeEventManagerFactory_1, GdprManager_1, Privacy_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (DisplayInterstitialAdUnit_1_1) {
                DisplayInterstitialAdUnit_1 = DisplayInterstitialAdUnit_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (DisplayInterstitial_1_1) {
                DisplayInterstitial_1 = DisplayInterstitial_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
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
            describe('DisplayInterstitialAdUnit', function () {
                var adUnit;
                var nativeBridge;
                var container;
                var sessionManager;
                var placement;
                var campaign;
                var view;
                var sandbox;
                var operativeEventManager;
                var thirdPartyEventManager;
                var deviceInfo;
                var clientInfo;
                var displayInterstitialAdUnitParameters;
                var forceQuitManager;
                describe('On static-interstial campaign', function () {
                    adUnitTests();
                });
                function adUnitTests() {
                    beforeEach(function () {
                        campaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                        forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                        sandbox = sinon.sandbox.create();
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID);
                        sandbox.stub(nativeBridge.WebPlayer, 'setSettings').returns(Promise.resolve());
                        sandbox.stub(nativeBridge.WebPlayer, 'clearSettings').returns(Promise.resolve());
                        placement = TestFixtures_1.TestFixtures.getPlacement();
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                        sandbox.stub(container, 'open').returns(Promise.resolve());
                        sandbox.stub(container, 'close').returns(Promise.resolve());
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                        sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
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
                        var privacy = new Privacy_1.Privacy(nativeBridge, configuration.isCoppaCompliant());
                        view = new DisplayInterstitial_1.DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);
                        view.render();
                        document.body.appendChild(view.container());
                        sandbox.stub(view, 'show');
                        sandbox.stub(view, 'hide');
                        displayInterstitialAdUnitParameters = {
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
                            view: view,
                            gdprManager: gdprManager,
                            programmaticTrackingService: programmaticTrackingService
                        };
                        adUnit = new DisplayInterstitialAdUnit_1.DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
                    });
                    afterEach(function () {
                        if (adUnit.isShowing()) {
                            adUnit.hide();
                        }
                        sandbox.restore();
                    });
                    describe('showing', function () {
                        it('should open the container', function () {
                            return adUnit.show().then(function () {
                                sinon.assert.called(container.open);
                            });
                        });
                        it('should open the view', function () {
                            return adUnit.show().then(function () {
                                sinon.assert.called(view.show);
                            });
                        });
                        it('should trigger onStart', function () {
                            var spy = sinon.spy();
                            adUnit.onStart.subscribe(spy);
                            return adUnit.show().then(function () {
                                sinon.assert.called(spy);
                            });
                        });
                    });
                    describe('hiding', function () {
                        beforeEach(function () {
                            return adUnit.show();
                        });
                        it('should close the view', function () {
                            return adUnit.hide().then(function () {
                                sinon.assert.called(view.hide);
                            });
                        });
                    });
                }
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJEaXNwbGF5SW50ZXJzdGl0aWFsQWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBMkJBLFFBQVEsQ0FBQywyQkFBMkIsRUFBRTtnQkFDbEMsSUFBSSxNQUFpQyxDQUFDO2dCQUN0QyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksU0FBMEIsQ0FBQztnQkFDL0IsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLFNBQW9CLENBQUM7Z0JBQ3pCLElBQUksUUFBcUMsQ0FBQztnQkFDMUMsSUFBSSxJQUF5QixDQUFDO2dCQUM5QixJQUFJLE9BQTJCLENBQUM7Z0JBQ2hDLElBQUkscUJBQTRDLENBQUM7Z0JBQ2pELElBQUksc0JBQThDLENBQUM7Z0JBQ25ELElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLG1DQUF5RSxDQUFDO2dCQUM5RSxJQUFJLGdCQUFrQyxDQUFDO2dCQUV2QyxRQUFRLENBQUMsK0JBQStCLEVBQUU7b0JBQ3RDLFdBQVcsRUFBRSxDQUFDO2dCQUNsQixDQUFDLENBQUMsQ0FBQztnQkFFSCxTQUFTLFdBQVc7b0JBQ2hCLFVBQVUsQ0FBQzt3QkFDUCxRQUFRLEdBQUcsMkJBQVksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO3dCQUV6RCxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUNBQWdCLENBQUMsQ0FBQzt3QkFDOUQsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQ2pDLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsQ0FBQyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUM5RCxPQUFPLENBQUMs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