import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { ICoreApi } from 'Core/ICore';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Url } from 'Core/Utilities/Url';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ConfigManagerTest', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let configPromise: Promise<unknown>;
        let wakeUpManager: WakeUpManager;
        let metaDataManager: MetaDataManager;
        let request: RequestManager;
        let configManager: ConfigManager;
        let requestGetStub: sinon.SinonStub;

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
                    response: JSON.stringify(ConfigurationAuctionPlc),
                    responseCode: 200,
                    headers: []
                };
                configPromise = Promise.resolve(nativeResponse);
                requestGetStub = sinon.stub(request, 'get').returns(configPromise);
            });

            it('calling fetch should return configuration', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                configPromise = configManager.getConfig();

                return configPromise.then((configuration) => {
                    assert.isNotNull(configuration);
                });
            });

            it('add the expected query parameters to the URL', () => {
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                configPromise = configManager.getConfig();

                return configPromise.then((configuration) => {
                    assert.isNotNull(configuration);
                    const url = requestGetStub.firstCall.args[0];
                    assert.equal(Url.getQueryParameter(url, 'connectionType'), 'cellular');
                    assert.equal(Url.getQueryParameter(url, 'screenWidth'), '567');
                    assert.equal(Url.getQueryParameter(url, 'screenHeight'), '1234');
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
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
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
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
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
                configManager = new ConfigManager(platform, core, metaDataManager, TestFixtures.getClientInfo(platform), platform === Platform.ANDROID ? TestFixtures.getAndroidDeviceInfo(core) : TestFixtures.getIosDeviceInfo(core), TestFixtures.getUnityInfo(platform, core), request);
                return configManager.getConfig().then(() => {
                    assert.fail('should not resolve');
                }).catch((error: any) => {
                    assert.instanceOf(error, DiagnosticError);
                });
            });
        });
    });
});
