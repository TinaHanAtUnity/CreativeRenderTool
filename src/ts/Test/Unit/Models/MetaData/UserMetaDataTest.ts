import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { UserMetaData } from 'Models/MetaData/UserMetaData';

class TestStorageApi extends StorageApi {

    private _storage: any;

    public setStorage(data: any) {
        this._storage = data;
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        try {
            switch(key) {
                case 'user.requestCount.value':
                    return Promise.resolve(this._storage.user.requestCount.value);

                case 'user.clickCount.value':
                    return Promise.resolve(this._storage.user.clickCount.value);

                default:
                    throw new Error('Unknown user key "' + key + '"');
            }
        } catch(error) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        if(key === 'user') {
            delete this._storage.user;
        }
        return Promise.resolve(void(0));
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        try {
            if(key === 'user') {
                return Promise.resolve(Object.keys(this._storage.user));
            }
            return Promise.resolve([]);
        } catch(error) {
            return Promise.resolve([]);
        }
    }
}

describe('UserMetaDataTest', () => {
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
        const meatDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return meatDataManager.fetch(UserMetaData).then(metaData => {
            assert.isUndefined(metaData, 'Returned UserMetaData even though it didnt exist');
        });
    });

    it('should fetch correctly', () => {
        storageApi.setStorage({
            user: {
                requestCount: {value: 0},
                clickCount: {value: 0}
            }
        });

        const meatDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return meatDataManager.fetch(UserMetaData).then(metaData => {
            if (metaData) {
                assert.equal(metaData.getRequestCount(), 0, 'UserMetaData.getRequestCount() did not pass through correctly');
                assert.equal(metaData.getClickCount(), 0, 'UserMetaData.getClickCount() did not pass through correctly' );
                assert.deepEqual(metaData.getDTO(), {
                    requestCount: 0,
                    clickCount: 0
                }, 'UserMetaData.getDTO() produced invalid output');
            } else {
                throw new Error('UserMetaData is not defined');
            }
        });
    });

    it('should update correctly', () => {
        storageApi.setStorage({
            user: {
                requestCount: {value: 0},
                clickCount: {value: 0}
            }
        });

        const metaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(UserMetaData, true, ['requestCount', 'clickCount']).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getRequestCount(), 0, '');
                assert.equal(metaData.getClickCount(), 0, '');

                storageApi.setStorage({
                    user: {
                        clickCount: {value: metaData.getClickCount() + 1}
                    }
                });
                return metaDataManager.fetch(UserMetaData, true, ['clickCount']).then(metaData2 => {
                    assert.equal(metaData, metaData2, 'UserMetaData was redefined');
                    if (metaData2) {
                        assert.equal(metaData.getRequestCount(), 0, '');
                        assert.equal(metaData.getClickCount(), 1, '');
                        assert.deepEqual(metaData2.getDTO(), {
                            requestCount: 0,
                            clickCount: 1
                        }, 'UserMetaData.getDTO() produced invalid output');
                    } else {
                        throw new Error('UserMetaData is not defined');
                    }
                });
            }
        });
    });

    it('should not fetch when data is undefined', () => {
        storageApi.setStorage({
            user: {
                requestCount: undefined,
                clickCount: 0
            }
        });
        const meatDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return meatDataManager.fetch(UserMetaData).then(metaData => {
            assert.isUndefined(metaData, 'what what what');
        });
    });

    it('should fetch correctly when data is partially undefined', () => {
        storageApi.setStorage({
            user: {
                clickCount: {value: 0}
            }
        });
        const metaDataManager: MetaDataManager = new MetaDataManager(nativeBridge);
        return metaDataManager.fetch(UserMetaData).then(metaData => {
            if(metaData) {
                assert.equal(metaData.getClickCount(), 0, '');
                assert.equal(metaData.getRequestCount(), undefined, '');
            } else {
                throw new Error('UserMetaData is not defined');
            }
        });
    });
});
