import { assert } from 'chai';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';

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
        return Promise.resolve(void(0));
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
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let storageApi: TestStorageApi;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = storageApi = new TestStorageApi(nativeBridge);
    });

    it('should return undefined when data does not exist', () => {
        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(PlayerMetaData).then(metaData => {
            assert.isUndefined(metaData, 'Returned PlayerMetaData even when it does not exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({
            player: {
                server_id: {value: 'test_sid'}
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(PlayerMetaData, false).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getServerId(), 'test_sid', 'PlayerMetaData.getServerId() did not pass through correctly');
                assert.deepEqual(metaData.getDTO(), {
                    sid: 'test_sid'
                }, 'PlayerMetaData.getDTO() produced invalid output');
                return metaDataManager.fetch(PlayerMetaData).then(exists => {
                    assert.isUndefined(exists, 'PlayerMetaData was not deleted after fetching');
                });
            } else {
                throw new Error('PlayerMetaData is not defined');
            }
        });
    });

    it('should not fetch when data is undefined', () => {
        storageApi.setStorage({
            player: {
                server_id: undefined
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(PlayerMetaData).then(metaData => {
            assert.isUndefined(metaData, 'PlayerMetaData is not defined');
        });
    });
});
