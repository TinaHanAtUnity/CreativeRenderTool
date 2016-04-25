/// <reference path="../../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { FrameworkMetaData } from '../../../src/ts/Models/MetaData/FrameworkMetaData';
import { StorageApi, StorageType } from '../../../src/ts/Native/Api/Storage';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get(storageType: StorageType, key: string): Promise<string | number> {
        try {
            switch(key) {
                case 'framework.name.value':
                    return Promise.resolve(this._storage.framework.name.value);

                case 'framework.version.value':
                    return Promise.resolve(this._storage.framework.version.value);

                default:
                    throw new Error('Unknown framework key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        if(key === 'framework') {
            delete this._storage.framework;
        }
        return Promise.resolve<void>();
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'framework') {
                return Promise.resolve(Object.keys(this._storage.framework));
            }
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('FrameworkMetaDataTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge, storageApi;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = storageApi = new TestStorageApi(nativeBridge);
    });

    it('should return undefined when data doesnt exist', () => {
        return FrameworkMetaData.fetch(nativeBridge, false).then(metaData => {
            assert.isUndefined(metaData, 'Returned FrameworkMetaData even when it doesnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({framework: {
            name: { value: 'test_name' },
            version: { value: 'test_version' }
        }});

        return FrameworkMetaData.fetch(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'FrameworkMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), 'test_version', 'FrameworkMetaData.getVersion() did not pass through correctly');
            assert.deepEqual(metaData.getDTO(), {
                frameworkName: 'test_name',
                frameworkVersion: 'test_version'
            }, 'FrameworkMetaData.getDTO() produced invalid output');
        });
    });

    it('should fetch correctly when data is undefined', () => {
        storageApi.setStorage({framework: {
            name: undefined,
            version: undefined
        }});

        return FrameworkMetaData.fetch(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'FrameworkMetaData is not defined');
            assert.equal(metaData.getName(), undefined, 'FrameworkMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'FrameworkMetaData.getVersion() did not pass through correctly');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({framework: {
            name: { value: 'test_name' }
        }});

        return FrameworkMetaData.fetch(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'FrameworkMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'FrameworkMetaData.getVersion() did not pass through correctly');
        });
    });

});
