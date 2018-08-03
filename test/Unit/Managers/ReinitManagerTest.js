System.register(["mocha", "chai", "sinon", "Models/ClientInfo", "Utilities/Request", "Utilities/Cache", "Managers/ReinitManager", "../TestHelpers/TestFixtures", "Managers/WakeUpManager", "Managers/FocusManager", "Utilities/CacheBookkeeping", "Native/Api/Storage", "Constants/Platform", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, ClientInfo_1, Request_1, Cache_1, ReinitManager_1, TestFixtures_1, WakeUpManager_1, FocusManager_1, CacheBookkeeping_1, Storage_1, Platform_1, ProgrammaticTrackingService_1, TestHelper;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (ReinitManager_1_1) {
                ReinitManager_1 = ReinitManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            TestHelper = /** @class */ (function () {
                function TestHelper() {
                }
                TestHelper.getClientInfo = function (webviewhash) {
                    return new ClientInfo_1.ClientInfo(Platform_1.Platform.TEST, [
                        '12345',
                        false,
                        'com.unity3d.ads.example',
                        '2.0.0-test2',
                        2000,
                        '2.0.0-alpha2',
                        true,
                        'http://example.com/config.json',
                        'http://example.com/index.html',
                        webviewhash,
                        '2.0.0-webview',
                        123456,
                        false
                    ]);
                };
                return TestHelper;
            }());
            describe('ReinitManagerTest', function () {
                describe('reinitialize', function () {
                    var nativeBridge;
                    var clientInfo;
                    var request;
                    var cache;
                    var reinitManager;
                    var programmaticTrackingService;
                    beforeEach(function () {
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        nativeBridge.Storage = new Storage_1.StorageApi(nativeBridge);
                        clientInfo = TestFixtures_1.TestFixtures.getClientInfo();
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, new FocusManager_1.FocusManager(nativeBridge));
                        request = new Request_1.Request(nativeBridge, wakeUpManager);
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping_1.CacheBookkeeping(nativeBridge), programmaticTrackingService);
                        reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, clientInfo, request, cache);
                    });
                    it('should reinitialize', function () {
                        var spy = sinon.spy(nativeBridge.Sdk, 'reinitialize');
                        reinitManager.reinitialize();
                        chai_1.assert.isTrue(spy.called, 'native reinitialize method was not invoked');
                    });
                });
                describe('shouldReinitialize', function () {
                    var nativeBridge;
                    var request;
                    var cache;
                    var programmaticTrackingService;
                    beforeEach(function () {
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, new FocusManager_1.FocusManager(nativeBridge));
                        request = new Request_1.Request(nativeBridge, wakeUpManager);
                        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                        cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, new CacheBookkeeping_1.CacheBookkeeping(nativeBridge), programmaticTrackingService);
                    });
                    it('should not reinit with development webview', function () {
                        var reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, TestHelper.getClientInfo(null), request, cache);
                        return reinitManager.shouldReinitialize().then(function (reinit) {
                            chai_1.assert.isFalse(reinit, 'development webview should not reinitialize');
                        });
                    });
                    it('should not reinit immediately after constructing', function () {
                        var reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);
                        return reinitManager.shouldReinitialize().then(function (reinit) {
                            chai_1.assert.isFalse(reinit, 'tried to reinitialize right after constructing webview');
                        });
                    });
                    it('should reinit', function () {
                        var reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);
                        var response = {
                            url: 'http://example.com/config.json',
                            response: '{"url":"https://webview.unityads.unity3d.com/webview/2.2.0/c7ed12d4ad4b37cc82046d9fac763deb2e909049/release/index.html","hash":"3b58bd6f9dbba6a4944e508d1d5c1f8efdd5748a48df2eb4bb5ea8392a20e0de","version":"c7ed12d4ad4b37cc82046d9fac763deb2e909049"}',
                            responseCode: 200,
                            headers: []
                        };
                        sinon.stub(request, 'get').returns(Promise.resolve(response));
                        var twentyMinutesInFuture = Date.now() + 20 * 60 * 1000;
                        var now = sinon.stub(Date, 'now').returns(twentyMinutesInFuture);
                        return reinitManager.shouldReinitialize().then(function (reinit) {
                            now.restore();
                            chai_1.assert.isTrue(reinit, 'did not reinitialize after new hash');
                        });
                    });
                    it('should not reinit when network fails', function () {
                        var reinitManager = new ReinitManager_1.ReinitManager(nativeBridge, TestHelper.getClientInfo('abcd1234'), request, cache);
                        sinon.stub(request, 'get').returns(Promise.reject(new Error()));
                        var twentyMinutesInFuture = Date.now() + 20 * 60 * 1000;
                        var now = sinon.stub(Date, 'now').returns(twentyMinutesInFuture);
                        return reinitManager.shouldReinitialize().then(function (reinit) {
                            now.restore();
                            chai_1.assert.isFalse(reinit, 'tried to reinitialize with network error');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVpbml0TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJSZWluaXRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBaUJBO2dCQUFBO2dCQWtCQSxDQUFDO2dCQWpCaUIsd0JBQWEsR0FBM0IsVUFBNEIsV0FBMEI7b0JBQ2xELE9BQU8sSUFBSSx1QkFBVSxDQUFDLG1CQUFRLENBQUMsSUFBSSxFQUFFO3dCQUNqQyxPQUFPO3dCQUNQLEtBQUs7d0JBQ0wseUJBQXlCO3dCQUN6QixhQUFhO3dCQUNiLElBQUk7d0JBQ0osY0FBYzt3QkFDZCxJQUFJO3dCQUNKLGdDQUFnQzt3QkFDaEMsK0JBQStCO3dCQUMvQixXQUFXO3dCQUNYLGVBQWU7d0JBQ2YsTUFBTTt3QkFDTixLQUFLO3FCQUNSLENBQUMsQ0FBQztnQkFDUCxDQUFDO2dCQUNMLGlCQUFDO1lBQUQsQ0FBQyxBQWxCRCxJQWtCQztZQUVELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDMUIsUUFBUSxDQUFDLGNBQWMsRUFBRTtvQkFDckIsSUFBSSxZQUEwQixDQUFDO29CQUMvQixJQUFJLFVBQXNCLENBQUM7b0JBQzNCLElBQUksT0FBZ0IsQ0FBQztvQkFDckIsSUFBSSxLQUFZLENBQUM7b0JBQ2pCLElBQUksYUFBNEIsQ0FBQztvQkFDakMsSUFBSSwyQkFBd0QsQ0FBQztvQkFFN0QsVUFBVSxDQUFDO3dCQUNQLFlBQVksR0FBRywyQkFBWSxDQUFDLGVBQWUsRUFBRSxDQUFDO3dCQUM5QyxZQUFZLENBQUMsT0FBTyxHQUFHLElBQUksb0JBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDcEQsVUFBVSxHQUFHLDJCQUFZLENBQUMsYUFBYSxFQUFFLENBQUM7d0JBQzFDLElBQU0sYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSwyQkFBWSxDQUFD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