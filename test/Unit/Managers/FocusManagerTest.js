System.register(["tslib", "mocha", "sinon", "chai", "Native/NativeBridge", "Managers/WakeUpManager", "Native/Api/Connectivity", "Native/Api/Broadcast", "Constants/Platform", "Native/Api/Notification", "Native/Api/Lifecycle", "Managers/FocusManager"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, NativeBridge_1, WakeUpManager_1, Connectivity_1, Broadcast_1, Platform_1, Notification_1, Lifecycle_1, FocusManager_1, TestConnectivityApi, TestBroadcastApi, TestNotificationApi, TestLifecycleApi;
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
            function (chai_1_1) {
                chai_1 = chai_1_1;
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
            describe('FocusManagerTest', function () {
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
                it('should start listening to screen broadcasts', function () {
                    var spy = sinon.spy(nativeBridge.Broadcast, 'addBroadcastListener');
                    return focusManager.setListenScreen(true).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[1], ['android.intent.action.SCREEN_ON', 'android.intent.action.SCREEN_OFF']);
                    });
                });
                it('should stop listening to screen broadcasts', function () {
                    var spy = sinon.spy(nativeBridge.Broadcast, 'removeBroadcastListener');
                    return focusManager.setListenScreen(false).then(function () {
                        sinon.assert.calledOnce(spy);
                    });
                });
                it('should start listening to app foreground events', function () {
                    var spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
                    return focusManager.setListenAppForeground(true).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                        chai_1.assert.deepEqual(spy.getCall(0).args[1], []);
                    });
                });
                it('should stop listening to app foreground events', function () {
                    var spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
                    return focusManager.setListenAppForeground(false).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationDidBecomeActiveNotification');
                    });
                });
                it('should start listening to app background events', function () {
                    var spy = sinon.spy(nativeBridge.Notification, 'addNotificationObserver');
                    return focusManager.setListenAppBackground(true).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                        chai_1.assert.deepEqual(spy.getCall(0).args[1], []);
                    });
                });
                it('should stop listening to app background events', function () {
                    var spy = sinon.spy(nativeBridge.Notification, 'removeNotificationObserver');
                    return focusManager.setListenAppBackground(false).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[0], 'UIApplicationWillResignActiveNotification');
                    });
                });
                it('should start listening to Android lifecycle events', function () {
                    var spy = sinon.spy(nativeBridge.Lifecycle, 'register');
                    return focusManager.setListenAndroidLifecycle(true).then(function () {
                        sinon.assert.calledOnce(spy);
                        chai_1.assert.deepEqual(spy.getCall(0).args[0], ['onActivityResumed', 'onActivityPaused']);
                    });
                });
                it('should stop listening to Android lifecycle events', function () {
                    var spy = sinon.spy(nativeBridge.Lifecycle, 'unregister');
                    return focusManager.setListenAndroidLifecycle(false).then(function () {
                        sinon.assert.calledOnce(spy);
                    });
                });
                it('should trigger onNetworkConnected', function () {
                    var spy = sinon.spy();
                    wakeUpManager.onNetworkConnected.subscribe(spy);
                    nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
                    sinon.assert.callCount(spy, 1);
                });
                it('should throttle onNetworkConnected to 10 events', function () {
                    var spy = sinon.spy();
                    wakeUpManager.onNetworkConnected.subscribe(spy);
                    for (var i = 0; i < 20; i++) {
                        nativeBridge.Connectivity.handleEvent('CONNECTED', [true, 0]);
                    }
                    sinon.assert.callCount(spy, 10);
                });
                it('should trigger onScreenOn', function () {
                    var spy = sinon.spy();
                    focusManager.onScreenOn.subscribe(spy);
                    nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_ON', '', {}]);
                    sinon.assert.calledOnce(spy);
                });
                it('should trigger onScreenOff', function () {
                    var spy = sinon.spy();
                    focusManager.onScreenOff.subscribe(spy);
                    nativeBridge.Broadcast.handleEvent('ACTION', ['screenListener', 'android.intent.action.SCREEN_OFF', '', {}]);
                    sinon.assert.calledOnce(spy);
                });
                it('should trigger onAppForeground', function () {
                    var spy = sinon.spy();
                    focusManager.onAppForeground.subscribe(spy);
                    nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                    sinon.assert.calledOnce(spy);
                });
                it('should trigger onAppBackground', function () {
                    var spy = sinon.spy();
                    focusManager.onAppBackground.subscribe(spy);
                    nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                    sinon.assert.calledOnce(spy);
                });
                it('should trigger onActivityResumed', function () {
                    var spy = sinon.spy();
                    focusManager.onActivityResumed.subscribe(spy);
                    nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                    sinon.assert.calledOnce(spy);
                });
                it('should trigger onActivityPaused', function () {
                    var spy = sinon.spy();
                    focusManager.onActivityPaused.subscribe(spy);
                    nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                    sinon.assert.calledOnce(spy);
                });
                it('should handle app foreground status when initialized', function () {
                    chai_1.assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after FocusManager was initialized');
                });
                it('should handle app foreground status after going to background (on iOS)', function () {
                    nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                    chai_1.assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on iOS)');
                });
                it('should handle app foreground status after going to background (on Android)', function () {
                    nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                    chai_1.assert.isFalse(focusManager.isAppForeground(), 'appForeground was true after going to background (on Android)');
                });
                it('should handle app foreground status after returning to foreground (on iOS)', function () {
                    nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationWillResignActiveNotification', {}]);
                    nativeBridge.Notification.handleEvent('ACTION', ['UIApplicationDidBecomeActiveNotification', {}]);
                    chai_1.assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on iOS)');
                });
                it('should handle app foreground status after returning to foreground (on Android)', function () {
                    nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.activity']);
                    nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.activity']);
                    chai_1.assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after returning to foreground (on Android)');
                });
                it('should handle app foreground status when changing Android activities', function () {
                    nativeBridge.Lifecycle.handleEvent('RESUMED', ['com.test.newactivity']);
                    nativeBridge.Lifecycle.handleEvent('PAUSED', ['com.test.oldactivity']);
                    chai_1.assert.isTrue(focusManager.isAppForeground(), 'appForeground was false after changing Android activities');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRm9jdXNNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZvY3VzTWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWFBO2dCQUFrQywrQ0FBZTtnQkFBakQ7O2dCQUlBLENBQUM7Z0JBSFUsZ0RBQWtCLEdBQXpCLFVBQTBCLE1BQWU7b0JBQ3JDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFDTCwwQkFBQztZQUFELENBQUMsQUFKRCxDQUFrQyw4QkFBZSxHQUloRDtZQUVEO2dCQUErQiw0Q0FBWTtnQkFBM0M7O2dCQVFBLENBQUM7Z0JBUFUsK0NBQW9CLEdBQTNCLFVBQTRCLFlBQW9CLEVBQUUsT0FBaUI7b0JBQy9ELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFFTSxrREFBdUIsR0FBOUIsVUFBK0IsWUFBb0I7b0JBQy9DLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFDTCx1QkFBQztZQUFELENBQUMsQUFSRCxDQUErQix3QkFBWSxHQVExQztZQUVEO2dCQUFrQywrQ0FBZTtnQkFBakQ7O2dCQVFBLENBQUM7Z0JBUFUscURBQXVCLEdBQTlCLFVBQStCLElBQVksRUFBRSxJQUFjO29CQUN2RCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sd0RBQTBCLEdBQWpDLFVBQWtDLElBQVk7b0JBQzFDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FB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