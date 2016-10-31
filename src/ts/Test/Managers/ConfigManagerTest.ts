import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { ConfigManager } from 'Managers/ConfigManager';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { INativeResponse } from 'Utilities/Request';

import ConfigurationJson from 'json/Configuration.json';

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
});
