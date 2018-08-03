System.register(["tslib", "mocha", "sinon", "chai", "Analytics/AnalyticsManager", "../TestHelpers/TestFixtures", "Managers/WakeUpManager", "Utilities/Request", "Native/Api/Storage", "Native/Api/Request", "Managers/FocusManager"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, AnalyticsManager_1, TestFixtures_1, WakeUpManager_1, Request_1, Storage_1, Request_2, FocusManager_1, FakeStorageApi, FakeRequestApi, TestHelper;
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
            function (AnalyticsManager_1_1) {
                AnalyticsManager_1 = AnalyticsManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Request_2_1) {
                Request_2 = Request_2_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            }
        ],
        execute: function () {
            FakeStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(FakeStorageApi, _super);
                function FakeStorageApi() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._values = {};
                    return _this;
                }
                FakeStorageApi.prototype.get = function (type, key) {
                    if (this._values[key]) {
                        return Promise.resolve(this._values[key]);
                    }
                    return Promise.reject([Storage_1.StorageError[Storage_1.StorageError.COULDNT_GET_VALUE], key]);
                };
                FakeStorageApi.prototype.set = function (type, key, value) {
                    return Promise.resolve();
                };
                FakeStorageApi.prototype.delete = function (type, key) {
                    return Promise.resolve();
                };
                FakeStorageApi.prototype.setValue = function (key, value) {
                    this._values[key] = value;
                };
                return FakeStorageApi;
            }(Storage_1.StorageApi));
            FakeRequestApi = /** @class */ (function (_super) {
                tslib_1.__extends(FakeRequestApi, _super);
                function FakeRequestApi(nativeBridge, postCallback) {
                    var _this = _super.call(this, nativeBridge) || this;
                    _this._postCallback = postCallback;
                    return _this;
                }
                FakeRequestApi.prototype.post = function (id, url, requestBody, headers, connectTimeout, readTimeout) {
                    this._postCallback(url, requestBody);
                    return Promise.resolve(id);
                };
                return FakeRequestApi;
            }(Request_2.RequestApi));
            TestHelper = /** @class */ (function () {
                function TestHelper() {
                }
                TestHelper.getEventType = function (data) {
                    var rawJson = data.split('\n')[1];
                    var analyticsObject = JSON.parse(rawJson);
                    return analyticsObject.type;
                };
                return TestHelper;
            }());
            describe('AnalyticsManagerTest', function () {
                var nativeBridge;
                var wakeUpManager;
                var request;
                var clientInfo;
                var deviceInfo;
                var configuration;
                var storage;
                var analyticsManager;
                var focusManager;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('6c7fa2c0-4333-47be-8de2-2f24e33e710c'));
                    storage = new FakeStorageApi(nativeBridge);
                    nativeBridge.Storage = storage;
                    analyticsManager = new AnalyticsManager_1.AnalyticsManager(nativeBridge, wakeUpManager, request, clientInfo, deviceInfo, configuration, focusManager);
                });
                it('should send session start event', function () {
                    var requestSpy = sinon.spy(request, 'post');
                    return analyticsManager.init().then(function () {
                        sinon.assert.called(requestSpy);
                        chai_1.assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appStart.v1');
                    });
                });
                it('should send session running event', function () {
                    return analyticsManager.init().then(function () {
                        var requestSpy = sinon.spy(request, 'post');
                        focusManager.onActivityPaused.trigger('com.test.activity');
                        sinon.assert.called(requestSpy);
                        chai_1.assert.equal(TestHelper.getEventType(requestSpy.getCall(0).args[1]), 'analytics.appRunning.v1');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbmFseXRpY3NNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBaUJBO2dCQUE2QiwwQ0FBVTtnQkFBdkM7b0JBQUEscUVBc0JDO29CQXJCVyxhQUFPLEdBQTJCLEVBQUUsQ0FBQzs7Z0JBcUJqRCxDQUFDO2dCQW5CVSw0QkFBRyxHQUFWLFVBQWMsSUFBaUIsRUFBRSxHQUFXO29CQUN4QyxJQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ2xCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQzdDO29CQUVELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLHNCQUFZLENBQUMsc0JBQVksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQy9FLENBQUM7Z0JBRU0sNEJBQUcsR0FBVixVQUFjLElBQWlCLEVBQUUsR0FBVyxFQUFFLEtBQVE7b0JBQ2xELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUVNLCtCQUFNLEdBQWIsVUFBYyxJQUFpQixFQUFFLEdBQVc7b0JBQ3hDLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUM3QixDQUFDO2dCQUVNLGlDQUFRLEdBQWYsVUFBZ0IsR0FBVyxFQUFFLEtBQVU7b0JBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUM5QixDQUFDO2dCQUNMLHFCQUFDO1lBQUQsQ0FBQyxBQXRCRCxDQUE2QixvQkFBVSxHQXNCdEM7WUFFRDtnQkFBNkIsMENBQVU7Z0JBR25DLHdCQUFZLFlBQTBCLEVBQUUsWUFBaUQ7b0JB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