import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { ConfigManager } from 'Managers/ConfigManager';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { INativeResponse } from 'Utilities/Request';

import ConfigurationJson from 'json/Configuration.json';
import { ConfigError } from 'Errors/ConfigError';
import { RequestError } from 'Errors/RequestError';

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
    let requestMock: any, clientInfoMock: any, deviceInfoMock: any;
    let configPromise: Promise<INativeResponse>;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = new TestStorageApi(nativeBridge);

        clientInfoMock = {
            getApplicationName: sinon.mock().returns('test_application'),
            getGameId: sinon.mock().returns(123),
            isDebuggable: sinon.mock().returns(false),
        };
        deviceInfoMock = {
            isRooted: sinon.mock().returns(false)
        };
    });

    describe('with correctly formed configuration json', () => {

        beforeEach(() => {
            const nativeResponse = {
                response: ConfigurationJson
            };
            configPromise = Promise.resolve(nativeResponse);

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return configuration', () => {
            ConfigManager.fetch(nativeBridge, requestMock, clientInfoMock, deviceInfoMock);

            return configPromise.then((configuration) => {
                assert.isNotNull(configuration);
            });
        });
    });

    describe('with badly formed configuration json', () => {

        beforeEach(() => {
            const nativeResponse = {
                response: '{bad json here,'
            };
            configPromise = Promise.resolve(nativeResponse);

            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should return error', () => {
            return ConfigManager.fetch(nativeBridge, requestMock, clientInfoMock, deviceInfoMock).then(() => {
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
                response: '{"error":"Error message"}',
                responseCode: 405,
                headers: []
            };

            configPromise = Promise.reject([{}, 'FAILED_WITH_ERROR_RESPONSE', new RequestError(new Error('FAILED_WITH_ERROR_RESPONSE'), nativeResponse)]);
            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should throw ConfigError', () => {
            return ConfigManager.fetch(nativeBridge, requestMock, clientInfoMock, deviceInfoMock).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
                assert.instanceOf(error, ConfigError);
                assert.equal(error.message, 'Error message');
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
            configPromise = Promise.reject([{}, 'FAILED_WITH_ERROR_RESPONSE', new RequestError(new Error('FAILED_WITH_ERROR_RESPONSE'), nativeResponse)]);
            requestMock = {
                get: sinon.mock().returns(configPromise)
            };
        });

        it('calling fetch should throw ConfigError', () => {
            return ConfigManager.fetch(nativeBridge, requestMock, clientInfoMock, deviceInfoMock).then(() => {
                assert.fail('should not resolve');
            }).catch(error => {
                assert.instanceOf(error, ConfigError);
            });
        });
    });
});

// it('Request get should return proper exception if json parsing fails ' + i.toString(), () => {
//     const failureUrl: string = 'http://www.example.org/404invalidjson/' + i.toString();
//     const reason = 'FAILED_WITH_ERROR_RESPONSE';
//
//     return request.get(failureUrl).then((response) => {
//         assert.fail('Should not resolve');
//     }, errorResponse => {
//         assert.equal(errorResponse[1], reason);
//         assert.instanceOf(errorResponse[2], DiagnosticError);
//     }).catch(error => {
//         throw new Error('Handling error response failed: ' + error);
//     });
// });
