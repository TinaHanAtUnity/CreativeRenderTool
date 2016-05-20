/// <reference path="../../../typings/index.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { MetaDataManager } from '../../../src/ts/Models/MetaData/MetaDataManager';
import { StorageApi, StorageType } from '../../../src/ts/Native/Api/Storage';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get(storageType: StorageType, key: string): Promise<string | number> {
        try {
            switch(key) {
                case 'adapter.name.value':
                    return Promise.resolve(this._storage.adapter.name.value);

                case 'adapter.version.value':
                    return Promise.resolve(this._storage.adapter.version.value);

                default:
                    throw new Error('Unknown adapter key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        if(key === 'adapter') {
            delete this._storage.adapter;
        }
        return Promise.resolve<void>();
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'adapter') {
                return Promise.resolve(Object.keys(this._storage.adapter));
            }
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('AdapterMetaDataTest', () => {
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
        return MetaDataManager.fetchAdapterMetaData(nativeBridge, false).then(metaData => {
            assert.isUndefined(metaData, 'Returned AdapterMetaData even when it doesnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({
            adapter: {
                name: {value: 'test_name'},
                version: {value: 'test_version'}
            }
        });

        return MetaDataManager.fetchAdapterMetaData(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'AdapterMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), 'test_version', 'AdapterMetaData.getVersion() did not pass through correctly');
            assert.deepEqual(metaData.getDTO(), {
                adapterName: 'test_name',
                adapterVersion: 'test_version'
            }, 'AdapterMetaData.getDTO() produced invalid output');
        });
    });

    it('should fetch correctly when data is undefined', () => {
        storageApi.setStorage({
            adapter: {
                name: undefined,
                version: undefined
            }
        });

        return MetaDataManager.fetchAdapterMetaData(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'AdapterMetaData is not defined');
            assert.equal(metaData.getName(), undefined, 'AdapterMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({
            adapter: {
                name: {value: 'test_name'}
            }
        });

        return MetaDataManager.fetchAdapterMetaData(nativeBridge, false).then(metaData => {
            assert.isDefined(metaData, 'AdapterMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
        });
    });

});
