import 'mocha';
import { assert } from 'chai';
import * as Sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get(storageType: StorageType, key: string): Promise<string | number> {
        try {
            switch(key) {
                case 'player.server_id.value':
                    return Promise.resolve(this._storage.player.server_id.value);

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
            return Promise.resolve([]);
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('PlayerMetaDataTest', () => {
    let handleInvocation = Sinon.spy();
    let handleCallback = Sinon.spy();
    let nativeBridge: NativeBridge, storageApi: TestStorageApi;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = storageApi = new TestStorageApi(nativeBridge);
    });

    beforeEach(() => {
        MetaDataManager.clearCaches();

    });

    it('should return undefined when data does not exist', () => {
        return MetaDataManager.fetchPlayerMetaData(nativeBridge).then(metaData => {
            assert.isUndefined(metaData, 'Returned PlayerMetaData even when it does not exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({
            player: {
                server_id: {value: 'test_sid'},
            }
        });

        return MetaDataManager.fetchPlayerMetaData(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getServerId(), 'test_sid', 'PlayerMetaData.getServerId() did not pass through correctly');
            assert.deepEqual(metaData.getDTO(), {
                sid: 'test_sid',
            }, 'PlayerMetaData.getDTO() produced invalid output');
            return MetaDataManager.fetchPlayerMetaData(nativeBridge).then(exists => {
                assert.isUndefined(exists, 'PlayerMetaData was not deleted after fetching');
            });
        });
    });

    it('should fetch correctly when data is undefined', () => {
        storageApi.setStorage({
            player: {
                server_id: undefined
            }
        });

        return MetaDataManager.fetchPlayerMetaData(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getServerId(), undefined, 'PlayerMetaData.getServerId() did not pass through correctly');
        });
    });

});
