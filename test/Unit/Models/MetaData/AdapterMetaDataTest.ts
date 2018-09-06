import { assert } from 'chai';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { AdapterMetaData } from 'Core/Models/MetaData/AdapterMetaData';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import 'mocha';
import * as sinon from 'sinon';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
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
        return Promise.resolve(void(0));
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'adapter') {
                return Promise.resolve(Object.keys(this._storage.adapter));
            }
            return Promise.resolve([]);
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('AdapterMetaDataTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, storageApi: TestStorageApi;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = storageApi = new TestStorageApi(nativeBridge);
    });

    it('should return undefined when data doesnt exist', () => {
        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(AdapterMetaData).then(metaData => {
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

        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(AdapterMetaData).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                assert.equal(metaData.getVersion(), 'test_version', 'AdapterMetaData.getVersion() did not pass through correctly');
                assert.deepEqual(metaData.getDTO(), {
                    adapterName: 'test_name',
                    adapterVersion: 'test_version'
                }, 'AdapterMetaData.getDTO() produced invalid output');
            } else {
                throw new Error('AdapterMetaData is not defined');
            }
        });
    });

    it('should not fetch when data is undefined', () => {
        storageApi.setStorage({
            adapter: {
                name: undefined,
                version: undefined
            }
        });

        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(AdapterMetaData).then(metaData => {
            assert.isUndefined(metaData, 'AdapterMetaData is defined');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({
            adapter: {
                name: {value: 'test_name'}
            }
        });

        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(AdapterMetaData).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
            } else {
                throw new Error('AdapterMetaData is not defined');
            }
        });
    });
});
