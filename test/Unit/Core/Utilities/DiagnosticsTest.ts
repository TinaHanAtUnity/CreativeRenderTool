import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka } from 'Core/Utilities/HttpKafka';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(Platform[platform] + ' - DiagnosticsTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });

        after(() => {
            HttpKafka.setConfiguration(undefined);
            HttpKafka.setClientInfo(undefined);
            HttpKafka.setDeviceInfo(undefined);
            HttpKafka.setRequest(undefined);
            (<sinon.SinonStub>Date.now).restore();
        });

        it('should not allow primitives as root values', () => {
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.stub(request, 'post').returns(resolvedPromise);
            sinon.stub(Date, 'now').returns(123456);
            HttpKafka.setRequest(request);

            Diagnostics.trigger('test', 123);
            return resolvedPromise.then(() => {
                sinon.assert.calledWithMatch(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":123},"timestamp":123456}}');
                return Diagnostics.trigger('test', false);
            }).then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":false},"timestamp":123456}}');
                return Diagnostics.trigger('test', []);
            }).then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":[]},"timestamp":123456}}');
                return Diagnostics.trigger('test', <any>null);
            }).then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":null},"timestamp":123456}}');
                return Diagnostics.trigger('test', <any>undefined);
            }).then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{},"timestamp":123456}}');
                return Diagnostics.trigger('test', 'lol');
            }).then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"value":"lol"},"timestamp":123456}}');
            });
        });

        it('should generate proper request', () => {
            const request = new RequestManager(platform, core, new WakeUpManager(core));
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.stub(request, 'post').returns(resolvedPromise);
            HttpKafka.setRequest(request);

            Diagnostics.trigger('test', {'test': true});
            return resolvedPromise.then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"test":true},"timestamp":123456}}');
            });
        });

        it('should generate proper request with info', () => {
            const request = new RequestManager(platform, core, new WakeUpManager(core));

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());
            sinon.stub(request, 'post').returns(resolvedPromise);

            const clientInfo = new ClientInfo([
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

            const configuration = CoreConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));

            HttpKafka.setRequest(request);
            HttpKafka.setClientInfo(clientInfo);
            HttpKafka.setConfiguration(configuration);
            Diagnostics.trigger('test', {'test': true});

            return resolvedPromise.then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":{"gameId":"12345","testMode":false,"bundleId":"com.unity3d.ads.example","bundleVersion":"2.0.0-test2","sdkVersion":2000,"sdkVersionName":"2.0.0-alpha2","encrypted":false,"configUrl":"http://example.com/config.json","webviewUrl":"http://example.com/index.html","webviewHash":null,"webviewVersion":"2.0.0-webview-test","initTimestamp":0,"reinitialized":false,"monetizationInUse":false},"device":null,"country":"FI"}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"test":true},"timestamp":123456}}');
            });
        });
    });
});
