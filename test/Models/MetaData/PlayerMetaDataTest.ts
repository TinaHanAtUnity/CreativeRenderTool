/// <reference path="../../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { PlayerMetaData } from '../../../src/ts/Models/MetaData/PlayerMetaData';
import { StorageApi, StorageType } from '../../../src/ts/Native/Api/Storage';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get(storageType: StorageType, key: string): Promise<string | number> {
        try {
            switch(key) {
                case 'player.sid.value':
                    return Promise.resolve(this._storage.player.sid.value);

                case 'player.name.value':
                    return Promise.resolve(this._storage.player.name.value);

                case 'player.gender.value':
                    return Promise.resolve(this._storage.player.gender.value);

                case 'player.age.value':
                    return Promise.resolve(this._storage.player.age.value);

                default:
                    throw new Error('Unknown player key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        if(key === 'player') {
            delete this._storage.player;
        }
        return Promise.resolve<void>();
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'player') {
                return Promise.resolve(Object.keys(this._storage.player));
            }
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('PlayerMetaDataTest', () => {
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
        return PlayerMetaData.fetch(nativeBridge).then(metaData => {
            assert.isUndefined(metaData, 'Returned PlayerMetaData even when it doesnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({player: {
            sid: { value: 'test_sid' },
            name: { value: 'test_name' },
            gender: { value: 'test_gender' },
            age: { value: 42 }
        }});

        return PlayerMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getSid(), 'test_sid', 'PlayerMetaData.getSid() did not pass through correctly');
            assert.equal(metaData.getName(), 'test_name', 'PlayerMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getGender(), 'test_gender', 'PlayerMetaData.getGender() did not pass through correctly');
            assert.equal(metaData.getAge(), 42, 'PlayerMetaData.getAge() did not pass through correctly');
            assert.deepEqual(metaData.getDTO(), {
                sid: 'test_sid',
                name: 'test_name',
                gender: 'test_gender',
                age: 42
            }, 'PlayerMetaData.getDTO() produced invalid output');
            return PlayerMetaData.exists(nativeBridge).then(exists => {
                assert.isFalse(exists, 'PlayerMetaData was not deleted after fetching');
            });
        });
    });

    it('should fetch correctly when data is undefined', () => {
        storageApi.setStorage({player: {
            sid: undefined,
            name: undefined,
            gender: undefined,
            age: undefined
        }});

        return PlayerMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getSid(), undefined, 'PlayerMetaData.getSid() did not pass through correctly');
            assert.equal(metaData.getName(), undefined, 'PlayerMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getGender(), undefined, 'PlayerMetaData.getGender() did not pass through correctly');
            assert.equal(metaData.getAge(), undefined, 'PlayerMetaData.getAge() did not pass through correctly');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({player: {
            sid: { value: 'test_sid' },
            age: { value: 666 }
        }});

        return PlayerMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getSid(), 'test_sid', 'PlayerMetaData.getSid() did not pass through correctly');
            assert.equal(metaData.getName(), undefined, 'PlayerMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getGender(), undefined, 'PlayerMetaData.getGender() did not pass through correctly');
            assert.equal(metaData.getAge(), 666, 'PlayerMetaData.getAge() did not pass through correctly');
        });
    });

});
