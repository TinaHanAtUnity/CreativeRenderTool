System.register(["mocha", "sinon", "Utilities/Request", "Utilities/Diagnostics", "Models/ClientInfo", "Native/NativeBridge", "Managers/WakeUpManager", "Constants/Platform", "Utilities/HttpKafka", "Parsers/ConfigurationParser", "../TestHelpers/TestFixtures", "Managers/FocusManager", "json/ConfigurationAuctionPlc.json"], function (exports_1, context_1) {
    "use strict";
    var sinon, Request_1, Diagnostics_1, ClientInfo_1, NativeBridge_1, WakeUpManager_1, Platform_1, HttpKafka_1, ConfigurationParser_1, TestFixtures_1, FocusManager_1, ConfigurationAuctionPlc_json_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            }
        ],
        execute: function () {
            describe('DiagnosticsTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var resolvedPromise;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    }, Platform_1.Platform.TEST, false);
                });
                after(function () {
                    HttpKafka_1.HttpKafka.setRequest(undefined);
                    Date.now.restore();
                });
                it('should not allow primitives as root values', function () {
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                    resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                    sinon.stub(request, 'post').returns(resolvedPromise);
                    sinon.stub(Date, 'now').returns(123456);
                    HttpKafka_1.HttpKafka.setRequest(request);
                    Diagnostics_1.Diagnostics.trigger('test', 123);
                    return resolvedPromise.then(function () {
                        sinon.assert.calledWithMatch(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":123},"timestamp":123456}}');
                        return Diagnostics_1.Diagnostics.trigger('test', false);
                    }).then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":false},"timestamp":123456}}');
                        return Diagnostics_1.Diagnostics.trigger('test', []);
                    }).then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":[]},"timestamp":123456}}');
                        return Diagnostics_1.Diagnostics.trigger('test', null);
                    }).then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":null},"timestamp":123456}}');
                        return Diagnostics_1.Diagnostics.trigger('test', undefined);
                    }).then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{},"timestamp":123456}}');
                        return Diagnostics_1.Diagnostics.trigger('test', 'lol');
                    }).then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":"lol"},"timestamp":123456}}');
                    });
                });
                it('should generate proper request', function () {
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                    resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                    sinon.stub(request, 'post').returns(resolvedPromise);
                    HttpKafka_1.HttpKafka.setRequest(request);
                    Diagnostics_1.Diagnostics.trigger('test', { 'test': true });
                    return resolvedPromise.then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"test":true},"timestamp":123456}}');
                    });
                });
                it('should generate proper request with info', function () {
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                    resolvedPromise = Promise.resolve(TestFixtures_1.TestFixtures.getOkNativeResponse());
                    sinon.stub(request, 'post').returns(resolvedPromise);
                    var clientInfo = new ClientInfo_1.ClientInfo(Platform_1.Platform.ANDROID, [
                        '12345',
                        false,
                        'com.unity3d.ads.example',
                        '2.0.0-test2',
                        2000,
                        '2.0.0-alpha2',
                        true,
                        'http://example.com/config.json',
                        'http://example.com/index.html',
                        null,
                        '2.0.0-webview-test',
                        0,
                        false
                    ]);
                    var configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                    HttpKafka_1.HttpKafka.setRequest(request);
                    HttpKafka_1.HttpKafka.setClientInfo(clientInfo);
                    HttpKafka_1.HttpKafka.setConfiguration(configuration);
                    Diagnostics_1.Diagnostics.trigger('test', { 'test': true });
                    return resolvedPromise.then(function () {
                        sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":2000,"sdkVersionName":"2.0.0-alpha2","platform":"android","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null,"webviewVersion":"2.0.0-webview-test","initTimestamp":0,"reinitialized":false},"device":null,"country":"FI"}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"test":true},"timestamp":123456}}');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlhZ25vc3RpY3NUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRGlhZ25vc3RpY3NUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFpQkEsUUFBUSxDQUFDLGlCQUFpQixFQUFFO2dCQUN4QixJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksZUFBeUMsQ0FBQztnQkFFOUMsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUM7d0JBQzVCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTtxQkFDakIsRUFBRSxtQkFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0IsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsS0FBSyxDQUFDO29CQUNGLHFCQUFTLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUNkLElBQUksQ0FBQyxHQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRTtvQkFDN0MsSUFBTSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNwRCxJQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDekYsZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsMkJBQVksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7b0JBQ3RFLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxD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