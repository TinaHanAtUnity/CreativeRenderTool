import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { ConfigManager } from 'Managers/ConfigManager';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { INativeResponse } from 'Utilities/Request';

import ConfigurationJson from 'json/Configuration.json';
import { RequestError } from 'Errors/RequestError';
import { ConfigError } from 'Errors/ConfigError';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { TestFixtures } from "../TestHelpers/TestFixtures";
import { MetaDataManager } from 'Managers/MetaDataManager'

class TestStorageApi extends StorageApi {

    public get(storageType: StorageType, key: string): Promise<string | number> {
        try {
            switch(key) {
                case 'adapter.name.value':
                    return Promise.resolve('adapter_name');

                case 'adapter.version.value':
                    return Promise.resolve('adapter_version');

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
                response: ConfigurationJson,
                responseCode: 200,
                headers: []
            };
            configPromise = Promise.resolve(nativeResponse);

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return configuration', () => {
            ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(), metaDataManager);

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
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(), metaDataManager).then(() => {
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
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(), metaDataManager).then(() => {
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
            return ConfigManager.fetch(nativeBridge, requestMock, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(), metaDataManager).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
                assert.instanceOf(error, DiagnosticError);
            });
        });
    });
});
