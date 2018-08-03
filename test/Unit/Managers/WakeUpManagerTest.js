System.register(["tslib", "mocha", "sinon", "Native/NativeBridge", "Managers/WakeUpManager", "Native/Api/Connectivity", "Native/Api/Broadcast", "Constants/Platform", "Native/Api/Notification", "Native/Api/Lifecycle", "Managers/FocusManager"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, NativeBridge_1, WakeUpManager_1, Connectivity_1, Broadcast_1, Platform_1, Notification_1, Lifecycle_1, FocusManager_1, TestConnectivityApi, TestBroadcastApi, TestNotificationApi, TestLifecycleApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Connectivity_1_1) {
                Connectivity_1 = Connectivity_1_1;
            },
            function (Broadcast_1_1) {
                Broadcast_1 = Broadcast_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Notification_1_1) {
                Notification_1 = Notification_1_1;
            },
            function (Lifecycle_1_1) {
                Lifecycle_1 = Lifecycle_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            }
        ],
        execute: function () {
            TestConnectivityApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestConnectivityApi, _super);
                function TestConnectivityApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestConnectivityApi.prototype.setListeningStatus = function (status) {
                    return Promise.resolve(void (0));
                };
                return TestConnectivityApi;
            }(Connectivity_1.ConnectivityApi));
            TestBroadcastApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestBroadcastApi, _super);
                function TestBroadcastApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestBroadcastApi.prototype.addBroadcastListener = function (listenerName, actions) {
                    return Promise.resolve(void (0));
                };
                TestBroadcastApi.prototype.removeBroadcastListener = function (listenerName) {
                    return Promise.resolve(void (0));
                };
                return TestBroadcastApi;
            }(Broadcast_1.BroadcastApi));
            TestNotificationApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestNotificationApi, _super);
                function TestNotificationApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestNotificationApi.prototype.addNotificationObserver = function (name, keys) {
                    return Promise.resolve(void (0));
                };
                TestNotificationApi.prototype.removeNotificationObserver = function (name) {
                    return Promise.resolve(void (0));
                };
                return TestNotificationApi;
            }(Notification_1.NotificationApi));
            TestLifecycleApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestLifecycleApi, _super);
                function TestLifecycleApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestLifecycleApi.prototype.register = function (events) {
                    return Promise.resolve(void (0));
                };
                TestLifecycleApi.prototype.unregister = function () {
                    return Promise.resolve(void (0));
                };
                return TestLifecycleApi;
            }(Lifecycle_1.LifecycleApi));
            describe('WakeUpManagerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var wakeUpManager;
                var focusManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    }, Platform_1.Platform.TEST, false);
                    nativeBridge.Connectivity = new TestConnectivityApi(nativeBridge);
                    nativeBridge.Broadcast = new TestBroadcastApi(nativeBridge);
                    nativeBridge.Notification = new TestNotificationApi(nativeBridge);
                    nativeBridge.Lifecycle = new TestLifecycleApi(nativeBridge);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                });
                it('should set connection listening status true', function () {
                    var spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
                    return wakeUpManager.setListenConnectivity(true).then(function () {
                        sinon.assert.calledOnce(spy);
                        sinon.assert.calledWith(spy, true);
                    });
                });
                it('should set connection listening status false', function () {
                    var spy = sinon.spy(nativeBridge.Connectivity, 'setListeningStatus');
                    return wakeUpManager.setListenConnectivity(false).then(function () {
                        sinon.assert.calledOnce(spy);
                        sinon.assert.calledWith(spy, false);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FrZVVwTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJXYWtlVXBNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBWUE7Z0JBQWtDLCtDQUFlO2dCQUFqRDs7Z0JBSUEsQ0FBQztnQkFIVSxnREFBa0IsR0FBekIsVUFBMEIsTUFBZTtvQkFDckMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2dCQUNMLDBCQUFDO1lBQUQsQ0FBQyxBQUpELENBQWtDLDhCQUFlLEdBSWhEO1lBRUQ7Z0JBQStCLDRDQUFZO2dCQUEzQzs7Z0JBUUEsQ0FBQztnQkFQVSwrQ0FBb0IsR0FBM0IsVUFBNEIsWUFBb0IsRUFBRSxPQUFpQjtvQkFDL0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2dCQUVNLGtEQUF1QixHQUE5QixVQUErQixZQUFvQjtvQkFDL0MsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO2dCQUNMLHVCQUFDO1lBQUQsQ0FBQyxBQVJELENBQStCLHdCQUFZLEdBUTFDO1lBRUQ7Z0JBQWtDLCtDQUFlO2dCQUFqRDs7Z0JBUUEsQ0FBQztnQkFQVSxxREFBdUIsR0FBOUIsVUFBK0IsSUFBWSxFQUFFLElBQWM7b0JBQ3ZELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFFTSx3REFBMEIsR0FBakMsVUFBa0MsSUFBWTtvQkFDMUMsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFD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