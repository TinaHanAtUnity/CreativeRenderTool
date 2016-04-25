/// <reference path="../../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { MediationMetaData } from '../../../src/ts/Models/MetaData/MediationMetaData';
import { StorageApi, StorageType } from '../../../src/ts/Native/Api/Storage';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get(storageType: StorageType, key: string): Promise<string | number> {
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
        return Promise.resolve<void>();
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'mediation') {
                return Promise.resolve(Object.keys(this._storage.mediation));
            }
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('MediationMetaDataTest', () => {
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
        return MediationMetaData.fetch(nativeBridge).then(metaData => {
            assert.isUndefined(metaData, 'Returned MediationMetaData even when it doesnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({mediation: {
            name: { value: 'test_name' },
            version: { value: 'test_version' },
            ordinal: { value: 42 }
        }});

        return MediationMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'MediationMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
            assert.equal(metaData.getOrdinal(), 42, 'MediationMetaData.getOrdinal() did not pass through correctly');
            assert.deepEqual(metaData.getDTO(), {
                mediationName: 'test_name',
                mediationVersion: 'test_version',
                mediationOrdinal: 42
            }, 'MediationMetaData.getDTO() produced invalid output');
        });
    });

    it('should fetch correctly when data is undefined', () => {
        storageApi.setStorage({mediation: {
            name: undefined,
            version: undefined,
            ordinal: undefined
        }});

        return MediationMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'MediationMetaData is not defined');
            assert.equal(metaData.getName(), undefined, 'MediationMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'MediationMetaData.getVersion() did not pass through correctly');
            assert.equal(metaData.getOrdinal(), undefined, 'MediationMetaData.getOrdinal() did not pass through correctly');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({mediation: {
            name: { value: 'test_name' }
        }});

        return MediationMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'MediationMetaData is not defined');
            assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getVersion(), undefined, 'MediationMetaData.getVersion() did not pass through correctly');
            assert.equal(metaData.getOrdinal(), undefined, 'MediationMetaData.getOrdinal() did not pass through correctly');
        });
    });

});
