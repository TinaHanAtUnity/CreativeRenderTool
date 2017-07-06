import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        try {
            switch(key) {
                case 'mediation.name.value':
                    return Promise.resolve(this._storage.mediation.name.value);

                case 'mediation.version.value':
                    return Promise.resolve(this._storage.mediation.version.value);

                case 'mediation.ordinal.value':
                    return Promise.resolve(this._storage.mediation.ordinal.value);

                default:
                    throw new Error('Unknown mediation key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        if(key === 'mediation') {
            delete this._storage.mediation;
        }
        return Promise.resolve(void(0));
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'mediation') {
                return Promise.resolve(Object.keys(this._storage.mediation));
            }
            return Promise.resolve([]);
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('MediationMetaDataTest', () => {
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
        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(MediationMetaData).then(metaData => {
            assert.isUndefined(metaData, 'Returned MediationMetaData even when it doesnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({
            mediation: {
                name: {value: 'test_name'},
                version: {value: 'test_version'}
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(MediationMetaData, true, ['name', 'version']).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                assert.deepEqual(metaData.getDTO(), {
                    mediationName: 'test_name',
                    mediationVersion: 'test_version',
                    mediationOrdinal: undefined
                }, 'MediationMetaData.getDTO() produced invalid output');
            } else {
                throw new Error('MediationMetaData is not defined');
            }
        });
    });

    it('should update correctly', () => {
        storageApi.setStorage({
            mediation: {
                name: {value: 'test_name'},
                version: {value: 'test_version'},
                ordinal: {value: 42}
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(MediationMetaData, true, ['name', 'version']).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                assert.equal(metaData.getOrdinal(), undefined, 'MediationMetaData.getOrdinal() did not pass through correctly');

                return metaDataManager.fetch(MediationMetaData, true, ['ordinal']).then(metaData2 => {
                    assert.equal(metaData, metaData2, 'MediationMetaData was redefined');
                    if(metaData2) {
                        assert.equal(metaData2.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                        assert.equal(metaData2.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                        assert.equal(metaData2.getOrdinal(), 42, 'MediationMetaData.getOrdinal() did not pass through correctly');
                        assert.deepEqual(metaData2.getDTO(), {
                            mediationName: 'test_name',
                            mediationVersion: 'test_version',
                            mediationOrdinal: 42
                        }, 'MediationMetaData.getDTO() produced invalid output');
                    } else {
                        throw new Error('MediationMetaData is not defined');
                    }
                });
            } else {
                throw new Error('MediationMetaData is not defined');
            }
        });
    });

    it('should not fetch when data is undefined', () => {
        storageApi.setStorage({
            mediation: {
                name: undefined,
                version: undefined,
                ordinal: undefined
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(MediationMetaData).then(metaData => {
            assert.isUndefined(metaData, 'MediationMetaData is defined');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({
            mediation: {
                name: {value: 'test_name'}
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(MediationMetaData).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                assert.isUndefined(metaData.getVersion(), 'MediationMetaData.getVersion() did not pass through correctly');
                assert.isUndefined(metaData.getOrdinal(), 'MediationMetaData.getOrdinal() did not pass through correctly');
            } else {
                throw new Error('MediationMetaData is not defined');
            }
        });
    });

});
