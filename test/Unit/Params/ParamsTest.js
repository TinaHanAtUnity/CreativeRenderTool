System.register(["tslib", "mocha", "sinon", "chai", "Utilities/Request", "../TestHelpers/TestFixtures", "Managers/CampaignManager", "Constants/Platform", "Managers/WakeUpManager", "Native/Api/Storage", "Native/Api/Request", "./ParamsTestData", "Managers/ConfigManager", "Managers/SessionManager", "Models/Configuration", "Native/Api/IosAdUnit", "Native/Api/DeviceInfo", "Native/Api/AndroidAdUnit", "Managers/MetaDataManager", "Utilities/Cache", "Managers/AssetManager", "Managers/FocusManager", "Managers/OperativeEventManager", "Models/Session", "Native/Api/AndroidDeviceInfo", "json/ConfigurationAuctionPlc.json", "AdMob/AdMobSignalFactory", "Utilities/CacheBookkeeping", "Managers/OperativeEventManagerFactory", "Models/Placement", "Jaeger/JaegerSpan", "Jaeger/JaegerManager", "Models/AdMobOptionalSignal", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, sinon, chai_1, Request_1, TestFixtures_1, CampaignManager_1, Platform_1, WakeUpManager_1, Storage_1, Request_2, ParamsTestData_1, ConfigManager_1, SessionManager_1, Configuration_1, IosAdUnit_1, DeviceInfo_1, AndroidAdUnit_1, MetaDataManager_1, Cache_1, AssetManager_1, FocusManager_1, OperativeEventManager_1, Session_1, AndroidDeviceInfo_1, ConfigurationAuctionPlc_json_1, AdMobSignalFactory_1, CacheBookkeeping_1, OperativeEventManagerFactory_1, Placement_1, JaegerSpan_1, JaegerManager_1, AdMobOptionalSignal_1, ProgrammaticTrackingService_1, TestStorageApi, TestRequestApi, TestDeviceInfoApi, TestAndroidDeviceInfoApi, SpecVerifier, TestHelper;
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
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (CampaignManager_1_1) {
                CampaignManager_1 = CampaignManager_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Request_2_1) {
                Request_2 = Request_2_1;
            },
            function (ParamsTestData_1_1) {
                ParamsTestData_1 = ParamsTestData_1_1;
            },
            function (ConfigManager_1_1) {
                ConfigManager_1 = ConfigManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (IosAdUnit_1_1) {
                IosAdUnit_1 = IosAdUnit_1_1;
            },
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (AndroidAdUnit_1_1) {
                AndroidAdUnit_1 = AndroidAdUnit_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (AssetManager_1_1) {
                AssetManager_1 = AssetManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            },
            function (Session_1_1) {
                Session_1 = Session_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (AdMobSignalFactory_1_1) {
                AdMobSignalFactory_1 = AdMobSignalFactory_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (JaegerSpan_1_1) {
                JaegerSpan_1 = JaegerSpan_1_1;
            },
            function (JaegerManager_1_1) {
                JaegerManager_1 = JaegerManager_1_1;
            },
            function (AdMobOptionalSignal_1_1) {
                AdMobOptionalSignal_1 = AdMobOptionalSignal_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestStorageApi.prototype.get = function (storageType, key) {
                    if (storageType === Storage_1.StorageType.PUBLIC) {
                        if (key === 'framework.name.value') {
                            return Promise.resolve('Unity');
                        }
                        else if (key === 'framework.version.value') {
                            return Promise.resolve('1.2.3');
                        }
                        else if (key === 'adapter.name.value') {
                            return Promise.resolve('AssetStore');
                        }
                        else if (key === 'adapter.version.value') {
                            return Promise.resolve('2.0.0');
                        }
                    }
                    return Promise.reject(['COULDNT_GET_VALUE', key]);
                };
                TestStorageApi.prototype.getKeys = function (type, key, recursive) {
                    if (type === Storage_1.StorageType.PUBLIC) {
                        if (key === 'framework' || key === 'adapter') {
                            return Promise.resolve(['name', 'version']);
                        }
                    }
                    return Promise.resolve([]);
                };
                TestStorageApi.prototype.set = function (type, key, value) {
                    return Promise.resolve();
                };
                TestStorageApi.prototype.write = function (type) {
                    return Promise.resolve();
                };
                TestStorageApi.prototype.delete = function (type, key) {
                    return Promise.resolve();
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            TestRequestApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestRequestApi, _super);
                function TestRequestApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestRequestApi.prototype.get = function (id, url, headers, connectTimeout, readTimeout) {
                    var _this = this;
                    setTimeout(function () {
                        // get is used only for config request
                        _this.onComplete.trigger(id, url, ConfigurationAuctionPlc_json_1.default, 200, []);
                    }, 1);
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.post = function (id, url, requestBody, headers, connectTimeout, readTimeout) {
                    var _this = this;
                    setTimeout(function () {
                        _this.onComplete.trigger(id, url, '{}', 200, []);
                    }, 1);
                    return Promise.resolve(id);
                };
                return TestRequestApi;
            }(Request_2.RequestApi));
            TestDeviceInfoApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestDeviceInfoApi, _super);
                function TestDeviceInfoApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestDeviceInfoApi.prototype.getUniqueEventId = function () {
                    return Promise.resolve('1234-ABCD');
                };
                TestDeviceInfoApi.prototype.getCPUCount = function () {
                    return Promise.resolve(2);
                };
                return TestDeviceInfoApi;
            }(DeviceInfo_1.DeviceInfoApi));
            TestAndroidDeviceInfoApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestAndroidDeviceInfoApi, _super);
                function TestAndroidDeviceInfoApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestAndroidDeviceInfoApi.prototype.getPackageInfo = function (packageName) {
                    return Promise.resolve(TestFixtures_1.TestFixtures.getPackageInfo());
                };
                TestAndroidDeviceInfoApi.prototype.isUSBConnected = function () {
                    return Promise.resolve(false);
                };
                TestAndroidDeviceInfoApi.prototype.getApkDigest = function () {
                    return Promise.resolve('abcd-1234');
                };
                TestAndroidDeviceInfoApi.prototype.getCertificateFingerprint = function () {
                    return Promise.resolve('efgh-5678');
                };
                TestAndroidDeviceInfoApi.prototype.getUptime = function () {
                    return Promise.resolve(123456);
                };
                TestAndroidDeviceInfoApi.prototype.getElapsedRealtime = function () {
                    return Promise.resolve(12345);
                };
                TestAndroidDeviceInfoApi.prototype.isAdbEnabled = function () {
                    return Promise.resolve(false);
                };
                TestAndroidDeviceInfoApi.prototype.getFingerprint = function () {
                    return Promise.resolve('test/fingerprint');
                };
                return TestAndroidDeviceInfoApi;
            }(AndroidDeviceInfo_1.AndroidDeviceInfoApi));
            SpecVerifier = /** @class */ (function () {
                function SpecVerifier(platform, spec, url, body) {
                    this._platform = platform;
                    this._spec = spec;
                    var parsedUrl = url.split('?');
                    if (parsedUrl.length > 1) {
                        this._queryParams = parsedUrl[1].split('&');
                    }
                    if (body) {
                        this._bodyParams = JSON.parse(body);
                    }
                }
                SpecVerifier.prototype.assert = function () {
                    this.assertUnspecifiedParams();
                    this.assertRequiredParams();
                };
                SpecVerifier.prototype.assertUnspecifiedParams = function () {
                    if (this._queryParams) {
                        for (var _i = 0, _a = this._queryParams; _i < _a.length; _i++) {
                            var queryParam = _a[_i];
                            var paramName = queryParam.split('=')[0];
                            var paramValue = queryParam.split('=')[1];
                            chai_1.assert.isDefined(this._spec[paramName], 'Unspecified query parameter: ' + paramName);
                            chai_1.assert.isTrue(this._spec[paramName].queryString, 'Parameter should not be in query string: ' + paramName);
                            this.assertQueryParamType(paramName, paramValue);
                        }
                    }
                    if (this._bodyParams) {
                        for (var key in this._bodyParams) {
                            if (this._bodyParams.hasOwnProperty(key)) {
                                chai_1.assert.isDefined(this._spec[key], 'Unspecified body parameter: ' + key);
                                chai_1.assert.isTrue(this._spec[key].body, 'Parameter should not be in request body: ' + key);
                                this.assertBodyParamType(key, this._bodyParams[key]);
                            }
                        }
                    }
                };
                SpecVerifier.prototype.assertRequiredParams = function () {
                    for (var param in this._spec) {
                        if (this._spec.hasOwnProperty(param)) {
                            if (this.isRequired(this._spec[param].required)) {
                                if (this._spec[param].queryString) {
                                    var found = false;
                                    for (var _i = 0, _a = this._queryParams; _i < _a.length; _i++) {
                                        var queryParam = _a[_i];
                                        var paramName = queryParam.split('=')[0];
                                        if (paramName === param) {
                                            found = true;
                                        }
                                    }
                                    chai_1.assert.isTrue(found, 'Required parameter not found in query string: ' + param);
                                }
                                if (this._spec[param].body) {
                                    chai_1.assert.isTrue(this._bodyParams.hasOwnProperty(param), 'Required parameter not found in body: ' + param);
                                }
                            }
                        }
                    }
                };
                SpecVerifier.prototype.assertQueryParamType = function (name, value) {
                    if (this._spec[name].type === 'boolean') {
                        chai_1.assert.match(value, /(true|false)/i, 'Query parameter type mismatch: ' + name);
                    }
                    else if (this._spec[name].type === 'number') {
                        chai_1.assert.match(value, /[0-9]+/, 'Query parameter type mismatch: ' + name);
                    }
                    else if (this._spec[name].type === 'string') {
                        // due to lack of better alternatives check that string has legal URL characters
                        chai_1.assert.match(value, /^([\!\#\$\&-\;\=\?-\[\]_a-z\~]|%[0-9a-fA-F]{2})+$/i, 'Query parameter type mismatch: ' + name);
                    }
                    else {
                        chai_1.assert.fail('Query parameter ' + name + ' with unknown type: ' + this._spec[name].type);
                    }
                };
                SpecVerifier.prototype.assertBodyParamType = function (name, value) {
                    chai_1.assert.equal(this._spec[name].type, typeof value, 'Body parameter type mismatch: ' + name);
                };
                SpecVerifier.prototype.isRequired = function (required) {
                    return required === 'all' || (required === 'android' && this._platform === Platform_1.Platform.ANDROID) || (required === 'ios' && this._platform === Platform_1.Platform.IOS);
                };
                return SpecVerifier;
            }());
            TestHelper = /** @class */ (function () {
                function TestHelper() {
                }
                TestHelper.getNativeBridge = function (platform) {
                    var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge(platform);
                    nativeBridge.Storage = new TestStorageApi(nativeBridge);
                    nativeBridge.Request = new TestRequestApi(nativeBridge);
                    nativeBridge.DeviceInfo = new TestDeviceInfoApi(nativeBridge);
                    nativeBridge.DeviceInfo.Android = new TestAndroidDeviceInfoApi(nativeBridge);
                    nativeBridge.IosAdUnit = new IosAdUnit_1.IosAdUnitApi(nativeBridge);
                    nativeBridge.AndroidAdUnit = new AndroidAdUnit_1.AndroidAdUnitApi(nativeBridge);
                    return nativeBridge;
                };
                TestHelper.getSessionManager = function (nativeBridge, request) {
                    return new SessionManager_1.SessionManager(nativeBridge, request);
                };
                return TestHelper;
            }());
            describe('Event parameters should match specifications', function () {
                describe('with config request', function () {
                    it('on Android', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.ANDROID);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                        var requestSpy = sinon.spy(request, 'get');
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        return ConfigManager_1.ConfigManager.fetch(nativeBridge, request, TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID), TestFixtures_1.TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getConfigRequestParams(), url);
                            verifier.assert();
                        });
                    });
                    it('on iOS', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.IOS);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                        var requestSpy = sinon.spy(request, 'get');
                        var span = sinon.createStubInstance(JaegerSpan_1.JaegerSpan);
                        return ConfigManager_1.ConfigManager.fetch(nativeBridge, request, TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS), TestFixtures_1.TestFixtures.getIosDeviceInfo(), metaDataManager, span).then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getConfigRequestParams(), url);
                            verifier.assert();
                        });
                    });
                });
                describe('with ad request', function () {
                    var configuration;
                    beforeEach(function () {
                        configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    });
                    it('on Android', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.ANDROID);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        var requestSpy = sinon.spy(request, 'post');
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        var cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var adMobSignalFactory = new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
                        var jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                        sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal_1.AdMobOptionalSignal()));
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                        sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session_1.Session('abdce-12345')));
                        sessionManager.setGameSessionId(1234);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        return campaignManager.request().then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var body = requestSpy.getCall(0).args[1];
                            var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getAdRequestParams(), url, body);
                            verifier.assert();
                        });
                    });
                    it('on iOS', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.IOS);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        var requestSpy = sinon.spy(request, 'post');
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                        var deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                        var cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var adMobSignalFactory = new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
                        var jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                        sinon.stub(adMobSignalFactory, 'getOptionalSignal').returns(Promise.resolve(new AdMobOptionalSignal_1.AdMobOptionalSignal()));
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                        sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(new Session_1.Session('abdce-12345')));
                        sessionManager.setGameSessionId(1234);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        return campaignManager.request().then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var body = requestSpy.getCall(0).args[1];
                            var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getAdRequestParams(), url, body);
                            verifier.assert();
                        });
                    });
                });
                describe('with click event', function () {
                    it('on Android', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.ANDROID);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                        var requestSpy = sinon.spy(request, 'post');
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        sessionManager.setGameSessionId(1234);
                        var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                            campaign: campaign
                        });
                        OperativeEventManager_1.OperativeEventManager.setPreviousPlacementId(undefined);
                        var operativeEventParams = {
                            placement: TestFixtures_1.TestFixtures.getPlacement(),
                            videoOrientation: 'landscape',
                            adUnitStyle: campaign.getAdUnitStyle(),
                            asset: campaign.getVideo()
                        };
                        return operativeEventManager.sendClick(operativeEventParams).then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var body = requestSpy.getCall(0).args[1];
                            var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getClickEventParams(), url, body);
                            verifier.assert();
                        });
                    });
                    it('on iOS', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.IOS);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                        var requestSpy = sinon.spy(request, 'post');
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                        var deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                        sessionManager.setGameSessionId(1234);
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        var operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                            campaign: campaign
                        });
                        OperativeEventManager_1.OperativeEventManager.setPreviousPlacementId(undefined);
                        var operativeEventParams = {
                            placement: TestFixtures_1.TestFixtures.getPlacement(),
                            videoOrientation: 'landscape',
                            adUnitStyle: campaign.getAdUnitStyle(),
                            asset: campaign.getVideo()
                        };
                        return operativeEventManager.sendClick(operativeEventParams).then(function () {
                            var url = requestSpy.getCall(0).args[0];
                            var body = requestSpy.getCall(0).args[1];
                            var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getClickEventParams(), url, body);
                            verifier.assert();
                        });
                    });
                });
                describe('with video events', function () {
                    var nativeBridge;
                    var request;
                    var requestSpy;
                    var sessionManager;
                    var operativeEventManager;
                    var campaign;
                    var operativeEventParams;
                    describe('on Android', function () {
                        beforeEach(function () {
                            nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.ANDROID);
                            var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                            request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                            requestSpy = sinon.spy(request, 'post');
                            var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                            sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                            var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                            var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                            sessionManager.setGameSessionId(1234);
                            campaign = TestFixtures_1.TestFixtures.getCampaign();
                            operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                                nativeBridge: nativeBridge,
                                request: request,
                                metaDataManager: metaDataManager,
                                sessionManager: sessionManager,
                                clientInfo: clientInfo,
                                deviceInfo: deviceInfo,
                                configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                                campaign: campaign
                            });
                            OperativeEventManager_1.OperativeEventManager.setPreviousPlacementId(undefined);
                            operativeEventParams = {
                                placement: TestFixtures_1.TestFixtures.getPlacement(),
                                adUnitStyle: campaign.getAdUnitStyle(),
                                videoOrientation: 'landscape',
                                asset: campaign.getVideo()
                            };
                        });
                        it('with start event', function () {
                            return operativeEventManager.sendStart(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with first quartile event', function () {
                            return operativeEventManager.sendFirstQuartile(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with midpoint event', function () {
                            return operativeEventManager.sendMidpoint(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with third quartile event', function () {
                            return operativeEventManager.sendThirdQuartile(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with end event', function () {
                            return operativeEventManager.sendView(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                    });
                    describe('on iOS', function () {
                        beforeEach(function () {
                            nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.IOS);
                            var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                            request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                            requestSpy = sinon.spy(request, 'post');
                            var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                            sessionManager = TestHelper.getSessionManager(nativeBridge, request);
                            var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                            var deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                            sessionManager.setGameSessionId(1234);
                            campaign = TestFixtures_1.TestFixtures.getCampaign();
                            operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                                nativeBridge: nativeBridge,
                                request: request,
                                metaDataManager: metaDataManager,
                                sessionManager: sessionManager,
                                clientInfo: clientInfo,
                                deviceInfo: deviceInfo,
                                configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                                campaign: campaign
                            });
                            OperativeEventManager_1.OperativeEventManager.setPreviousPlacementId(undefined);
                        });
                        it('with start event', function () {
                            return operativeEventManager.sendStart(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with first quartile event', function () {
                            return operativeEventManager.sendFirstQuartile(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with midpoint event', function () {
                            return operativeEventManager.sendMidpoint(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with third quartile event', function () {
                            return operativeEventManager.sendThirdQuartile(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                        it('with end event', function () {
                            return operativeEventManager.sendView(operativeEventParams).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getVideoEventParams(), url, body);
                                verifier.assert();
                            });
                        });
                    });
                });
                describe('with realtime ad request', function () {
                    var configuration;
                    var realtimePlacement;
                    beforeEach(function () {
                        configuration = TestFixtures_1.TestFixtures.getConfiguration();
                        realtimePlacement = new Placement_1.Placement({
                            id: 'placementStrictlyforScooters',
                            name: 'test',
                            default: true,
                            allowSkip: true,
                            skipInSeconds: 5,
                            disableBackButton: true,
                            useDeviceOrientationForVideo: false,
                            muteVideo: false
                        });
                        realtimePlacement.setRealtimeData('XXXscootVids');
                    });
                    it('on Android', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.ANDROID);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                        var deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                        var cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var adMobSignalFactory = new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
                        var jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                        var session = new Session_1.Session('abcde-12345');
                        sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
                        sessionManager.setGameSessionId(1234);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignManager.request().then(function () {
                            var requestSpy = sinon.spy(request, 'post');
                            return campaignManager.requestRealtime(realtimePlacement, session).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.ANDROID, ParamsTestData_1.ParamsTestData.getRealtimeAdRequestParams(), url, body);
                                verifier.assert();
                            });
                        });
                    });
                    it('on iOS', function () {
                        var nativeBridge = TestHelper.getNativeBridge(Platform_1.Platform.IOS);
                        var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                        var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                        var request = new Request_1.Request(nativeBridge, wakeUpManager);
                        var clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.IOS);
                        var deviceInfo = TestFixtures_1.TestFixtures.getIosDeviceInfo();
                        var cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                        var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService), Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                        var sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                        var adMobSignalFactory = new AdMobSignalFactory_1.AdMobSignalFactory(nativeBridge, clientInfo, deviceInfo, focusManager);
                        var jaegerManager = sinon.createStubInstance(JaegerManager_1.JaegerManager);
                        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan_1.JaegerSpan('test'));
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve('abdce-12345'));
                        var session = new Session_1.Session('abcde-12345');
                        sinon.stub(sessionManager, 'startNewSession').returns(Promise.resolve(session));
                        sessionManager.setGameSessionId(1234);
                        var campaignManager = new CampaignManager_1.CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
                        campaignManager.request().then(function () {
                            var requestSpy = sinon.spy(request, 'post');
                            return campaignManager.requestRealtime(realtimePlacement, session).then(function () {
                                var url = requestSpy.getCall(0).args[0];
                                var body = requestSpy.getCall(0).args[1];
                                var verifier = new SpecVerifier(Platform_1.Platform.IOS, ParamsTestData_1.ParamsTestData.getRealtimeAdRequestParams(), url, body);
                                verifier.assert();
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFyYW1zVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIlBhcmFtc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQXdDQTtnQkFBNkIsMENBQVU7Z0JBQXZDOztnQkFvQ0EsQ0FBQztnQkFuQ1UsNEJBQUcsR0FBVixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBRyxXQUFXLEtBQUsscUJBQVcsQ0FBQyxNQUFNLEVBQUU7d0JBQ25DLElBQUcsR0FBRyxLQUFLLHNCQUFzQixFQUFFOzRCQUMvQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0sT0FBTyxDQUFDLENBQUM7eUJBQ3hDOzZCQUFNLElBQUcsR0FBRyxLQUFLLHlCQUF5QixFQUFFOzRCQUN6QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0sT0FBTyxDQUFDLENBQUM7eUJBQ3hDOzZCQUFNLElBQUcsR0FBRyxLQUFLLG9CQUFvQixFQUFFOzRCQUNwQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0sWUFBWSxDQUFDLENBQUM7eUJBQzdDOzZCQUFNLElBQUcsR0FBRyxLQUFLLHVCQUF1QixFQUFFOzRCQUN2QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQU0sT0FBTyxDQUFDLENBQUM7eUJBQ3hDO3FCQUNKO29CQUNELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELENBQUM7Z0JBRU0sZ0NBQU8sR0FBZCxVQUFlLElBQWlCLEVBQUUsR0FBVyxFQUFFLFNBQWtCO29CQUM3RCxJQUFHLElBQUksS0FBSyxxQkFBVyxDQUFDLE1BQU0sRUFBRTt3QkFDNUIsSUFBRyxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FB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