import { assert } from 'chai';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { RequestError } from 'Core/Errors/RequestError';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';

import { ConfigManager } from 'Core/Managers/ConfigManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { INativeResponse } from 'Core/Managers/RequestManager';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

class TestStorageApi extends StorageApi {

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        try {
            switch(key) {
                case 'adapter.name.value':
                    return Promise.resolve(<any>'adapter_name');

                case 'adapter.version.value':
                    return Promise.resolve(<any>'adapter_version');

                default:
                    throw new Error('Unknown key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'adapter') {
                return Promise.resolve(['name', 'version']);
            }
            return Promise.resolve([]);
        } catch(error) {
            return Promise.resolve([]);
        }
    }

}

describe('ConfigManagerTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let requestMock: any;
    let configPromise: Promise<INativeResponse>;
    let metaDataManager: MetaDataManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
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

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return configuration', () => {
            const span = sinon.createStubInstance(JaegerSpan);
            ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getAndroidDeviceInfo(), metaDataManager, span);

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

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return error', () => {
            const span = sinon.createStubInstance(JaegerSpan);
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
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
            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should throw ConfigError', () => {
            const span = sinon.createStubInstance(JaegerSpan);
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
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
            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should throw ConfigError', () => {
            const span = sinon.createStubInstance(JaegerSpan);
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getAndroidDeviceInfo(), metaDataManager, span).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
                assert.instanceOf(error, DiagnosticError);
            });
        });
    });
});
