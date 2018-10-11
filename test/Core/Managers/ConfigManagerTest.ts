import { assert } from 'chai';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';

import { ConfigManager } from 'Core/Managers/ConfigManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/Core';
import { Platform } from '../../../src/ts/Core/Constants/Platform';
import { WakeUpManager } from '../../../src/ts/Core/Managers/WakeUpManager';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ConfigManagerTest', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let configPromise: Promise<INativeResponse>;
        let wakeUpManager: WakeUpManager;
        let metaDataManager: MetaDataManager;
        let request: RequestManager;
        let configManager: ConfigManager;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            metaDataManager = new MetaDataManager(core);
        });

        describe('with correctly formed configuration json', () => {

            beforeEach(() => {
                const nativeResponse: INativeResponse = {
                    url: '',
                    response: ConfigurationAuctionPlc,
                    responseCode: 200,
                    headers: []
                };
                configPromise = Promise.resolve(nativeResponse);
                sinon.stub(request, 'get').returns(configPromise);
            });

            it('calling fetch should return configuration', () => {
                const span = sinon.createStubInstance(JaegerSpan);
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), request);
                configPromise = configManager.getConfig(span);

                return configPromise.then((configuration) => {
                    assert.isNotNull(configuration);
                });
            });
        });

        describe('with badly formed configuration json', () => {

            beforeEach(() => {
                const nativeResponse: INativeResponse = {
                    url: '',
                    response: '{bad json..',
                    responseCode: 200,
                    headers: []
                };
                configPromise = Promise.resolve(nativeResponse);
                sinon.stub(request, 'get').returns(configPromise);
            });

            it('calling fetch should return error', () => {
                const span = sinon.createStubInstance(JaegerSpan);
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), request);
                return configManager.getConfig(span).then(() => {
                    assert.fail('should not resolve');
                }).catch((error: any) => {
                    assert.instanceOf(error, Error);
                });
            });
        });

        describe('with rejected request promise', () => {
            beforeEach(() => {
                const nativeResponse: INativeResponse = {
                    url: '',
                    response: '{"error": "Error message from backend"}',
                    responseCode: 405,
                    headers: []
                };

                configPromise = Promise.reject(new RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                sinon.stub(request, 'get').returns(configPromise);
            });

            it('calling fetch should throw ConfigError', () => {
                const span = sinon.createStubInstance(JaegerSpan);
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), request);
                return configManager.getConfig(span).then(() => {
                    assert.fail('should not resolve');
                }).catch((error: any) => {
                    assert.instanceOf(error, ConfigError);
                    assert.equal(error.message, 'Error message from backend');
                });
            });
        });

        describe('with rejected request promise, invalid json', () => {
            beforeEach(() => {
                const nativeResponse: INativeResponse = {
                    url: '',
                    response: '{error"Error message',
                    responseCode: 405,
                    headers: []
                };
                configPromise = Promise.reject(new RequestError('FAILED_WITH_ERROR_RESPONSE', {}, nativeResponse));
                sinon.stub(request, 'get').returns(configPromise);
            });

            it('calling fetch should throw ConfigError', () => {
                const span = sinon.createStubInstance(JaegerSpan);
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), request);
                return configManager.getConfig(span).then(() => {
                    assert.fail('should not resolve');
                }).catch((error: any) => {
                    assert.instanceOf(error, DiagnosticError);
                });
            });
        });
    });
});
