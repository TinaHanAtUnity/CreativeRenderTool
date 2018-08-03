System.register(["tslib", "mocha", "chai", "sinon", "Managers/ConfigManager", "Native/NativeBridge", "Native/Api/Storage", "json/ConfigurationAuctionPlc.json", "Errors/RequestError", "Errors/ConfigError", "Errors/DiagnosticError", "../TestHelpers/TestFixtures", "Managers/MetaDataManager", "Jaeger/JaegerSpan"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, ConfigManager_1, NativeBridge_1, Storage_1, ConfigurationAuctionPlc_json_1, RequestError_1, ConfigError_1, DiagnosticError_1, TestFixtures_1, MetaDataManager_1, JaegerSpan_1, TestStorageApi;
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
            function (ConfigManager_1_1) {
                ConfigManager_1 = ConfigManager_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (RequestError_1_1) {
                RequestError_1 = RequestError_1_1;
            },
            function (ConfigError_1_1) {
                ConfigError_1 = ConfigError_1_1;
            },
            function (DiagnosticError_1_1) {
                DiagnosticError_1 = DiagnosticError_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (JaegerSpan_1_1) {
                JaegerSpan_1 = JaegerSpan_1_1;
            }
        ],
        execute: function () {
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestStorageApi.prototype.get = function (storageType, key) {
                    try {
                        switch (key) {
                            case 'adapter.name.value':
                                return Promise.resolve('adapter_name');
                            case 'adapter.version.value':
                                return Promise.resolve('adapter_version');
                            default:
                                throw new Error('Unknown key "' + key + '"');
                        }
                    }
                    catch (error) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    try {
                        if (key === 'adapter') {
                            return Promise.resolve(['name', 'version']);
                        }
                        return Promise.resolve([]);
                    }
                    catch (error) {
                        return Promise.resolve([]);
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('ConfigManagerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var requestMock;
                var configPromise;
                var metaDataManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    nativeBridge.Storage = new TestStorageApi(nativeBridge);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                });
                describe('with correctly formed configuration json', function () {
                    beforeEach(function () {
                        var nativeResponse = {
                            url: '',
                            response: ConfigurationAuctionPlc_json_1.default,
                            responseCode: 200,
                            headers: []
                        };
                        configPromise = Promise.resolve(nativeResponse);
                        requestMock = {
                            get: sinon.mock().returns(configPromise)
                        };
                    });
                    it('calling fetch should return configuration', function () {
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        ConfigManager_1.ConfigManager.fetch(nativeBridge, requestMock, TestFixtures_1.TestFixtures.getClientInfo(), TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), metaDataManager, span);
                        return configPromise.then(function (configuration) {
                            chai_1.assert.isNotNull(configuration);
                        });
                    });
                });
                describe('with badly formed configuration json', function () {
                    beforeEach(function () {
                        var nativeResponse = {
                            url: '',
                            response: '{bad json..',
                            responseCode: 200,
                            headers: []
                        };
                        configPromise = Promise.resolve(nativeResponse);
                        requestMock = {
                            get: sinon.mock().returns(configPromise)
                        };
                    });
                    it('calling fetch should return error', function () {
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        return ConfigManager_1.ConfigManager.fetch(nativeBridge, requestMock, TestFixtures_1.TestFixtures.getClientInfo(), TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(function () {
                            chai_1.assert.fail('should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.instanceOf(error, Error);
                        });
                    });
                });
                describe('with rejected request promise', function () {
                    beforeEach(function () {
                        var nativeResponse = {
                            url: '',
                            response: '{"error": "Error message from backend"}',
                            responseCode: 405,
                            headers: []
                        };
                        configPromise = Promise.reject(new RequestError_1.RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                        requestMock = {
                            get: sinon.mock().returns(configPromise)
                        };
                    });
                    it('calling fetch should throw ConfigError', function () {
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        return ConfigManager_1.ConfigManager.fetch(nativeBridge, requestMock, TestFixtures_1.TestFixtures.getClientInfo(), TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(function () {
                            chai_1.assert.fail('should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.instanceOf(error, ConfigError_1.ConfigError);
                            chai_1.assert.equal(error.message, 'Error message from backend');
                        });
                    });
                });
                describe('with rejected request promise, invalid json', function () {
                    beforeEach(function () {
                        var nativeResponse = {
                            url: '',
                            response: '{error"Error message',
                            responseCode: 405,
                            headers: []
                        };
                        configPromise = Promise.reject(new RequestError_1.RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                        requestMock = {
                            get: sinon.mock().returns(configPromise)
                        };
                    });
                    it('calling fetch should throw ConfigError', function () {
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        return ConfigManager_1.ConfigManager.fetch(nativeBridge, requestMock, TestFixtures_1.TestFixtures.getClientInfo(), TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(function () {
                            chai_1.assert.fail('should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.instanceOf(error, DiagnosticError_1.DiagnosticError);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlnTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb25maWdNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBaUJBO2dCQUE2QiwwQ0FBVTtnQkFBdkM7O2dCQThCQSxDQUFDO2dCQTVCVSw0QkFBRyxHQUFWLFVBQWMsV0FBd0IsRUFBRSxHQUFXO29CQUMvQyxJQUFJO3dCQUNBLFFBQU8sR0FBRyxFQUFFOzRCQUNSLEtBQUssb0JBQW9CO2dDQUNyQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0sY0FBYyxDQUFDLENBQUM7NEJBRWhELEtBQUssdUJBQXVCO2dDQUN4QixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0saUJBQWlCLENBQUMsQ0FBQzs0QkFFbkQ7Z0NBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxlQUFlLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO3lCQUNwRDtxQkFDSjtvQkFBQyxPQUFNLEtBQUssRUFBRTt3QkFDWCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNyRDtnQkFDTCxDQUFDO2dCQUVNLGdDQUFPLEdBQWQsVUFBZSxXQUF3QixFQUFFLEdBQVcsRUFBRSxTQUFrQjtvQkFDcEUsSUFBSTt3QkFDQSxJQUFHLEdBQUcsS0FBSyxTQUFTLEVBQUU7NEJBQ2xCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO3lCQUMvQzt3QkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQzlCO29CQUFDLE9BQU0sS0FBSyxFQUFFO3dCQUNYLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDOUI7Z0JBQ0wsQ0FB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