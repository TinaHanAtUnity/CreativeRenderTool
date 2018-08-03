System.register(["mocha", "sinon", "chai", "Constants/Platform", "../TestHelpers/TestFixtures", "../TestHelpers/TestAdUnit", "Constants/Android/ScreenOrientation", "AdUnits/Containers/Activity", "AdUnits/Containers/AdUnitContainer", "Constants/Android/Rotation", "Managers/FocusManager", "Managers/MetaDataManager", "Managers/WakeUpManager", "Managers/ThirdPartyEventManager", "Managers/SessionManager", "Utilities/Request", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, Platform_1, TestFixtures_1, TestAdUnit_1, ScreenOrientation_1, Activity_1, AdUnitContainer_1, Rotation_1, FocusManager_1, MetaDataManager_1, WakeUpManager_1, ThirdPartyEventManager_1, SessionManager_1, Request_1, OperativeEventManagerFactory_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (TestAdUnit_1_1) {
                TestAdUnit_1 = TestAdUnit_1_1;
            },
            function (ScreenOrientation_1_1) {
                ScreenOrientation_1 = ScreenOrientation_1_1;
            },
            function (Activity_1_1) {
                Activity_1 = Activity_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (Rotation_1_1) {
                Rotation_1 = Rotation_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
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
            describe('AndroidAdUnitTest', function () {
                var nativeBridge;
                var container;
                var testAdUnit;
                var adUnitParams;
                var forceQuitManager;
                var testDisplay = {
                    rotation: Rotation_1.Rotation.ROTATION_0,
                    width: 800,
                    height: 600
                };
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID);
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    var clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    var request = new Request_1.Request(nativeBridge, wakeUpManager);
                    var thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    container = new Activity_1.Activity(nativeBridge, deviceInfo, forceQuitManager);
                    var gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: configuration,
                        campaign: TestFixtures_1.TestFixtures.getCampaign()
                    });
                    adUnitParams = {
                        forceOrientation: AdUnitContainer_1.Orientation.NONE,
                        focusManager: focusManager,
                        container: container,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        placement: TestFixtures_1.TestFixtures.getPlacement(),
                        campaign: TestFixtures_1.TestFixtures.getCampaign(),
                        configuration: configuration,
                        request: request,
                        options: {},
                        gdprManager: gdprManager,
                        programmaticTrackingService: programmaticTrackingService
                    };
                });
                describe('should open ad unit', function () {
                    var stub;
                    beforeEach(function () {
                        testAdUnit = new TestAdUnit_1.TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(nativeBridge.Sdk, 'logInfo').returns(Promise.resolve());
                        stub = sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
                    });
                    it('with all options true', function () {
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, true, true, true, { requestedOrientation: ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay }).then(function () {
                            sinon.assert.calledWith(stub, 1, ['videoplayer', 'webview'], ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_LANDSCAPE, [4 /* BACK */], 1 /* LOW_PROFILE */, true, true);
                            return;
                        });
                    });
                    it('with all options false', function () {
                        nativeBridge.setApiLevel(16); // act like Android 4.1, hw acceleration should be disabled
                        return container.open(testAdUnit, ['webview'], false, AdUnitContainer_1.Orientation.NONE, false, false, false, false, { requestedOrientation: ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE, display: testDisplay }).then(function () {
                            sinon.assert.calledWith(stub, 1, ['webview'], ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_LOCKED, [], 1 /* LOW_PROFILE */, false, false);
                            return;
                        });
                    });
                });
                it('should close ad unit', function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    var stub = sinon.stub(nativeBridge.AndroidAdUnit, 'close').returns(Promise.resolve());
                    return container.close().then(function () {
                        sinon.assert.calledOnce(stub);
                        return;
                    });
                });
                // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
                it('should reconfigure ad unit', function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.ANDROID);
                    container = new Activity_1.Activity(nativeBridge, TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
                    var stubViews = sinon.stub(nativeBridge.AndroidAdUnit, 'setViews').returns(Promise.resolve());
                    var stubOrientation = sinon.stub(nativeBridge.AndroidAdUnit, 'setOrientation').returns(Promise.resolve());
                    return container.reconfigure(0 /* ENDSCREEN */).then(function () {
                        sinon.assert.calledWith(stubViews, ['webview']);
                        sinon.assert.calledWith(stubOrientation, ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_FULL_SENSOR);
                        return;
                    });
                });
                describe('should handle Android lifecycle', function () {
                    var options;
                    beforeEach(function () {
                        testAdUnit = new TestAdUnit_1.TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(nativeBridge.AndroidAdUnit, 'open').returns(Promise.resolve());
                        options = { requestedOrientation: ScreenOrientation_1.ScreenOrientation.SCREEN_ORIENTATION_UNSPECIFIED, display: testDisplay };
                    });
                    it('with onResume', function () {
                        var onContainerForegroundTriggered = false;
                        var listener = {
                            onContainerShow: function () {
                                // EMPTY
                            },
                            onContainerDestroy: function () {
                                // EMPTY
                            },
                            onContainerBackground: function () {
                                // EMPTY
                            },
                            onContainerForeground: function () {
                                onContainerForegroundTriggered = true;
                            },
                            onContainerSystemMessage: function (message) {
                                // EMPTY
                            }
                        };
                        container.addEventHandler(listener);
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, options).then(function () {
                            nativeBridge.AndroidAdUnit.onResume.trigger(1);
                            chai_1.assert.isTrue(onContainerForegroundTriggered, 'onContainerForeground was not triggered when invoking onResume');
                            return;
                        });
                    });
                    it('with onPause', function () {
                        var onContainerDestroyTriggered = false;
                        var listener = {
                            onContainerShow: function () {
                                // EMPTY
                            },
                            onContainerDestroy: function () {
                                onContainerDestroyTriggered = true;
                            },
                            onContainerBackground: function () {
                                // EMPTY
                            },
                            onContainerForeground: function () {
                                // EMPTY
                            },
                            onContainerSystemMessage: function (message) {
                                // EMPTY
                            }
                        };
                        container.addEventHandler(listener);
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, options).then(function () {
                            nativeBridge.AndroidAdUnit.onPause.trigger(true, 1);
                            chai_1.assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onPause with finishing true');
                            return;
                        });
                    });
                    it('with onDestroy', function () {
                        var onContainerDestroyTriggered = false;
                        var listener = {
                            onContainerShow: function () {
                                // EMPTY
                            },
                            onContainerDestroy: function () {
                                onContainerDestroyTriggered = true;
                            },
                            onContainerBackground: function () {
                                // EMPTY
                            },
                            onContainerForeground: function () {
                                // EMPTY
                            },
                            onContainerSystemMessage: function (message) {
                                // EMPTY
                            }
                        };
                        container.addEventHandler(listener);
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, options).then(function () {
                            nativeBridge.AndroidAdUnit.onDestroy.trigger(true, 1);
                            chai_1.assert.isTrue(onContainerDestroyTriggered, 'onContainerDestroy was not triggered when invoking onDestroy with finishing true');
                            return;
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEFkVW5pdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbmRyb2lkQWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBOEJBLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDMUIsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLFNBQW1CLENBQUM7Z0JBQ3hCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxZQUFvRCxDQUFDO2dCQUN6RCxJQUFJLGdCQUFrQyxDQUFDO2dCQUN2QyxJQUFNLFdBQVcsR0FBUTtvQkFDckIsUUFBUSxFQUFFLG1CQUFRLENBQUMsVUFBVTtvQkFDN0IsS0FBSyxFQUFFLEdBQUc7b0JBQ1YsTUFBTSxFQUFFLEdBQUc7aUJBQ2QsQ0FBQztnQkFFRixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLDJCQUFZLENBQUMsZUFBZSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlELGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCxJQUFNLFVBQVUsR0FBRywyQkFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNoRCxJQUFNLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ3BELElBQU0sZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDMUQsSUFBTSxhQUFhLEdBQUcsSUFBSSw2QkFBYSxDQUFDLFlBQVksRUFBRSxZQUFZLENBQUMsQ0FBQztvQkFDcEUsSUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDekQsSUFBTSxzQkFBc0IsR0FBRyxJQUFJLCtDQUFzQixDQUFDLFlBQVks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