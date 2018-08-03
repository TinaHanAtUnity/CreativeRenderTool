System.register(["mocha", "sinon", "chai", "Constants/Platform", "../TestHelpers/TestFixtures", "../TestHelpers/TestAdUnit", "Constants/iOS/UIInterfaceOrientationMask", "AdUnits/Containers/AdUnitContainer", "AdUnits/Containers/ViewController", "Managers/FocusManager", "Managers/SessionManager", "Managers/ThirdPartyEventManager", "Managers/WakeUpManager", "Managers/MetaDataManager", "Utilities/Request", "Managers/OperativeEventManagerFactory", "Managers/GdprManager", "ProgrammaticTrackingService/ProgrammaticTrackingService", "Managers/ForceQuitManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, Platform_1, TestFixtures_1, TestAdUnit_1, UIInterfaceOrientationMask_1, AdUnitContainer_1, ViewController_1, FocusManager_1, SessionManager_1, ThirdPartyEventManager_1, WakeUpManager_1, MetaDataManager_1, Request_1, OperativeEventManagerFactory_1, GdprManager_1, ProgrammaticTrackingService_1, ForceQuitManager_1;
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
            function (UIInterfaceOrientationMask_1_1) {
                UIInterfaceOrientationMask_1 = UIInterfaceOrientationMask_1_1;
            },
            function (AdUnitContainer_1_1) {
                AdUnitContainer_1 = AdUnitContainer_1_1;
            },
            function (ViewController_1_1) {
                ViewController_1 = ViewController_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
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
            describe('IosAdUnitTest', function () {
                var nativeBridge;
                var container;
                var testAdUnit;
                var focusManager;
                var adUnitParams;
                var forceQuitManager;
                var defaultOptions = {
                    supportedOrientations: UIInterfaceOrientationMask_1.UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
                    supportedOrientationsPlist: UIInterfaceOrientationMask_1.UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL,
                    shouldAutorotate: true,
                    statusBarOrientation: 4,
                    statusBarHidden: false
                };
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.IOS);
                    var clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    forceQuitManager = sinon.createStubInstance(ForceQuitManager_1.ForceQuitManager);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    var request = new Request_1.Request(nativeBridge, wakeUpManager);
                    var thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    var deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                    container = new ViewController_1.ViewController(nativeBridge, TestFixtures_1.TestFixtures.getIosDeviceInfo(), focusManager, clientInfo, forceQuitManager);
                    var campaign = TestFixtures_1.TestFixtures.getCampaign();
                    var configuration = TestFixtures_1.TestFixtures.getConfiguration();
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
                        campaign: campaign
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
                        campaign: campaign,
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
                        stub = sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
                    });
                    it('with all options true', function () {
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, true, true, true, defaultOptions).then(function () {
                            sinon.assert.calledWith(stub, ['videoplayer', 'webview'], UIInterfaceOrientationMask_1.UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT, false, true, true, true);
                            return;
                        });
                    });
                    it('with all options false', function () {
                        return container.open(testAdUnit, ['webview'], false, AdUnitContainer_1.Orientation.NONE, false, false, false, false, defaultOptions).then(function () {
                            sinon.assert.calledWith(stub, ['webview'], UIInterfaceOrientationMask_1.UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL, true, false, false, false);
                            return;
                        });
                    });
                });
                it('should close ad unit', function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.IOS);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    container = new ViewController_1.ViewController(nativeBridge, TestFixtures_1.TestFixtures.getIosDeviceInfo(), focusManager, TestFixtures_1.TestFixtures.getClientInfo(), forceQuitManager);
                    var stub = sinon.stub(nativeBridge.IosAdUnit, 'close').returns(Promise.resolve());
                    return container.close().then(function () {
                        sinon.assert.calledOnce(stub);
                        return;
                    });
                });
                // note: when reconfigure method is enhanced with some actual parameters, this test needs to be refactored
                it('should reconfigure ad unit', function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(Platform_1.Platform.IOS);
                    container = new ViewController_1.ViewController(nativeBridge, TestFixtures_1.TestFixtures.getIosDeviceInfo(), focusManager, TestFixtures_1.TestFixtures.getClientInfo(), forceQuitManager);
                    var stubViews = sinon.stub(nativeBridge.IosAdUnit, 'setViews').returns(Promise.resolve());
                    var stubOrientation = sinon.stub(nativeBridge.IosAdUnit, 'setSupportedOrientations').returns(Promise.resolve());
                    return container.reconfigure(0 /* ENDSCREEN */).then(function () {
                        sinon.assert.calledWith(stubViews, ['webview']);
                        sinon.assert.calledWith(stubOrientation, UIInterfaceOrientationMask_1.UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_ALL);
                        return;
                    });
                });
                it('should trigger onShow', function () {
                    testAdUnit = new TestAdUnit_1.TestAdUnit(nativeBridge, adUnitParams);
                    sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
                    var onShowTriggered = false;
                    var listener = {
                        onContainerShow: function () {
                            onShowTriggered = true;
                        },
                        onContainerDestroy: function () {
                            // EMPTY
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
                    return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(function () {
                        nativeBridge.IosAdUnit.onViewControllerDidAppear.trigger();
                        chai_1.assert.isTrue(onShowTriggered, 'onShow was not triggered with onViewControllerDidAppear');
                        return;
                    });
                });
                describe('should handle iOS notifications', function () {
                    var onContainerSystemMessage;
                    var onContainerVisibilityChanged;
                    beforeEach(function () {
                        var listener = {
                            onContainerShow: function () {
                                // EMPTY
                            },
                            onContainerDestroy: function () {
                                // EMPTY
                            },
                            onContainerBackground: function () {
                                onContainerVisibilityChanged = true;
                            },
                            onContainerForeground: function () {
                                onContainerVisibilityChanged = true;
                            },
                            onContainerSystemMessage: function (message) {
                                onContainerSystemMessage = true;
                            }
                        };
                        testAdUnit = new TestAdUnit_1.TestAdUnit(nativeBridge, adUnitParams);
                        sinon.stub(nativeBridge.IosAdUnit, 'open').returns(Promise.resolve());
                        onContainerSystemMessage = false;
                        onContainerVisibilityChanged = false;
                        container.addEventHandler(listener);
                    });
                    it('with application did become active', function () {
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(function () {
                            nativeBridge.Notification.onNotification.trigger('UIApplicationDidBecomeActiveNotification', {});
                            chai_1.assert.isTrue(onContainerVisibilityChanged, 'onContainerBackground or onContainerForeground was not triggered with UIApplicationDidBecomeActiveNotification');
                            return;
                        });
                    });
                    it('with audio session interrupt', function () {
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(function () {
                            nativeBridge.Notification.onNotification.trigger('AVAudioSessionInterruptionNotification', { AVAudioSessionInterruptionTypeKey: 0, AVAudioSessionInterruptionOptionKey: 1 });
                            chai_1.assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionInterruptionNotification');
                            return;
                        });
                    });
                    it('with audio session route change', function () {
                        return container.open(testAdUnit, ['videoplayer', 'webview'], true, AdUnitContainer_1.Orientation.LANDSCAPE, true, false, true, false, defaultOptions).then(function () {
                            nativeBridge.Notification.onNotification.trigger('AVAudioSessionRouteChangeNotification', {});
                            chai_1.assert.isTrue(onContainerSystemMessage, 'onContainerSystemMessage was not triggered with AVAudioSessionRouteChangeNotification');
                            return;
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zQWRVbml0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIklvc0FkVW5pdFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQTJCQSxRQUFRLENBQUMsZUFBZSxFQUFFO2dCQUN0QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksU0FBeUIsQ0FBQztnQkFDOUIsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksWUFBb0QsQ0FBQztnQkFDekQsSUFBSSxnQkFBa0MsQ0FBQztnQkFFdkMsSUFBTSxjQUFjLEdBQVE7b0JBQ3hCLHFCQUFxQixFQUFFLHVEQUEwQixDQUFDLDhCQUE4QjtvQkFDaEYsMEJBQTBCLEVBQUUsdURBQTBCLENBQUMsOEJBQThCO29CQUNyRixnQkFBZ0IsRUFBRSxJQUFJO29CQUN0QixvQkFBb0IsRUFBRSxDQUFDO29CQUN2QixlQUFlLEVBQUUsS0FBSztpQkFDekIsQ0FBQztnQkFFRixVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLDJCQUFZLENBQUMsZUFBZSxDQUFDLG1CQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzFELElBQU0sVUFBVSxHQUFHLDJCQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7b0JBQ2hELGdCQUFnQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQ0FBZ0IsQ0FBQyxDQUFDO29CQUM5RCxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM5QyxJQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzFELElBQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQ3BFLElBQU0sT0FBTyxHQUFHLElBQUksaUJBQU8s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