/// <reference path="../../../typings/main.d.ts" />

import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from '../../../src/ts/Native/NativeBridge';
import { PlayerMetaData } from '../../../src/ts/Models/MetaData/PlayerMetaData';
import { StorageApi, StorageType } from '../../../src/ts/Native/Api/Storage';

class TestStorageApi extends StorageApi {
    public get(storageType: StorageType, key: string): Promise<string | number> {
        switch(key) {
            case 'player.sid.value':
                return Promise.resolve('test_sid');

            case 'player.name.value':
                return Promise.resolve('test_name');

            case 'player.gender.value':
                return Promise.resolve('test_gender');

            case 'player.age.value':
                return Promise.resolve(42);

            default:
                throw new Error('Unknown player key "' + key + '"');
        }
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        if(key === 'player') {
            return Promise.resolve(['sid', 'name', 'gender', 'age']);
        }
    }
}

describe('PlayerMetaDataTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    before(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        nativeBridge.Storage = new TestStorageApi(nativeBridge);
    });

    it('should fetch correctly', () => {
        return PlayerMetaData.fetch(nativeBridge).then(metaData => {
            assert.isDefined(metaData, 'PlayerMetaData is not defined');
            assert.equal(metaData.getSid(), 'test_sid', 'PlayerMetaData.getSid() did not pass through correctly');
            assert.equal(metaData.getName(), 'test_name', 'PlayerMetaData.getName() did not pass through correctly');
            assert.equal(metaData.getGender(), 'test_gender', 'PlayerMetaData.getGender() did not pass through correctly');
            assert.equal(metaData.getAge(), 42, 'PlayerMetaData.getAge() did not pass through correctly');
        });
    });

});
