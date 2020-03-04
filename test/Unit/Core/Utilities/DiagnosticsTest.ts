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

        afterEach(() => {
            HttpKafka.setConfiguration(undefined);
            HttpKafka.setClientInfo(undefined);
            HttpKafka.setDeviceInfo(undefined);
            HttpKafka.setRequest(undefined);
            HttpKafka.setPlatform(undefined);
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
            sinon.stub(Date, 'now').returns(123456);
            HttpKafka.setRequest(request);

            Diagnostics.trigger('test', {'test': true});
            return resolvedPromise.then(() => {
                sinon.assert.calledWith(<sinon.SinonStub>request.post,
                    'https://httpkafka.unityads.unity3d.com/v1/events', '{"common":{"client":null,"device":null,"country":null}}\n{"type":"ads.sdk2.diagnostics","msg":{"type":"test","test":{"test":true},"timestamp":123456}}');
            });
        });
    });
});
