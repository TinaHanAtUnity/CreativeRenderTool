System.register(["tslib", "mocha", "chai", "sinon", "Utilities/Request", "Managers/ThirdPartyEventManager", "Native/Api/Request", "Native/NativeBridge", "Managers/WakeUpManager", "Managers/FocusManager", "Managers/MetaDataManager", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, Request_1, ThirdPartyEventManager_1, Request_2, NativeBridge_1, WakeUpManager_1, FocusManager_1, MetaDataManager_1, TestFixtures_1, TestRequestApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Request_2_1) {
                Request_2 = Request_2_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            TestRequestApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestRequestApi, _super);
                function TestRequestApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestRequestApi.prototype.get = function (id, url, headers) {
                    var _this = this;
                    if (url.indexOf('/fail') !== -1) {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
                        }, 0);
                    }
                    else {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
                        }, 0);
                    }
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.post = function (id, url, body, headers) {
                    var _this = this;
                    if (url.indexOf('/fail') !== -1) {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
                        }, 0);
                    }
                    else {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
                        }, 0);
                    }
                    return Promise.resolve(id);
                };
                return TestRequestApi;
            }(Request_2.RequestApi));
            describe('ThirdPartyEventManagerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var requestApi;
                var focusManager;
                var thirdPartyEventManager;
                var request;
                var metaDataManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
                    request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                });
                it('Send successful third party event', function () {
                    var url = 'https://www.example.net/third_party_event';
                    var requestSpy = sinon.spy(request, 'get');
                    return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url).then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
                    });
                });
                it('Send click attribution event', function () {
                    var url = 'https://www.example.net/third_party_event';
                    var requestSpy = sinon.spy(request, 'get');
                    return thirdPartyEventManager.clickAttributionEvent(url, false).then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
                    });
                });
                it('should send headers for event', function () {
                    var url = 'https://www.example.net/third_party_event';
                    var requestSpy = sinon.spy(request, 'get');
                    return thirdPartyEventManager.sendEvent('click', 'abcde-12345', url, true).then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
                        var userAgentHeaderExists = false;
                        for (var _i = 0, _a = requestSpy.getCall(0).args[1]; _i < _a.length; _i++) {
                            var header = _a[_i];
                            if (header[0] === 'User-Agent') {
                                userAgentHeaderExists = true;
                            }
                        }
                        chai_1.assert.isTrue(userAgentHeaderExists, 'User-Agent header should exist in headers');
                    });
                });
                it('should replace "%ZONE%" in the url with the placement id', function () {
                    var requestSpy = sinon.spy(request, 'get');
                    var urlTemplate = 'http://foo.biz/%ZONE%/123';
                    var placement = TestFixtures_1.TestFixtures.getPlacement();
                    thirdPartyEventManager.setTemplateValues({ '%ZONE%': placement.getId() });
                    thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
                    chai_1.assert(requestSpy.calledOnce, 'request get should\'ve been called');
                    chai_1.assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/' + placement.getId() + '/123', 'Should have replaced %ZONE% from the url');
                });
                it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', function () {
                    var requestSpy = sinon.spy(request, 'get');
                    var urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
                    thirdPartyEventManager.setTemplateValues({ '%SDK_VERSION%': '12345' });
                    thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
                    chai_1.assert(requestSpy.calledOnce, 'request get should\'ve been called');
                    chai_1.assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
                });
                it('should replace template values given in constructor', function () {
                    var requestSpy = sinon.spy(request, 'get');
                    var urlTemplate = 'http://foo.biz/%SDK_VERSION%/123';
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request, { '%SDK_VERSION%': '12345' });
                    thirdPartyEventManager.sendEvent('eventName', 'sessionId', urlTemplate);
                    chai_1.assert(requestSpy.calledOnce, 'request get should\'ve been called');
                    chai_1.assert.equal(requestSpy.getCall(0).args[0], 'http://foo.biz/12345/123', 'Should have replaced %SDK_VERSION% from the url');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJUaGlyZFBhcnR5RXZlbnRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBYUE7Z0JBQTZCLDBDQUFVO2dCQUF2Qzs7Z0JBNEJBLENBQUM7Z0JBMUJVLDRCQUFHLEdBQVYsVUFBVyxFQUFVLEVBQUUsR0FBVyxFQUFFLE9BQWlDO29CQUFyRSxpQkFXQztvQkFWRyxJQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7d0JBQzVCLFVBQVUsQ0FBQzs0QkFDUCxLQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUNwRixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ1Q7eUJBQU07d0JBQ0gsVUFBVSxDQUFDOzRCQUNQLEtBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO3dCQUN2RyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7cUJBQ1Q7b0JBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMvQixDQUFDO2dCQUVNLDZCQUFJLEdBQVgsVUFBWSxFQUFVLEVBQUUsR0FBVyxFQUFFLElBQWEsRUFBRSxPQUFpQztvQkFBckYsaUJBV0M7b0JBVkcsSUFBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUM1QixVQUFVLENBQUM7NEJBQ1AsS0FBSSxDQUFD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