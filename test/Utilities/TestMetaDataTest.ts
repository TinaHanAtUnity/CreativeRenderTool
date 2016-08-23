import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { StorageType, StorageError } from '../../src/ts/Native/Api/Storage';
import { TestMetaData } from '../../src/ts/Utilities/TestMetaData';

describe('TestMetaDataTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;
    let testMetaData;

    beforeEach(() => {
        nativeBridge = new NativeBridge({handleInvocation, handleCallback});
        testMetaData = new TestMetaData(nativeBridge);
    });

    it('should return value successfully and not delete', () => {
        let key: string = 'testkey';
        let value: string = 'foo';
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
        let deleteStub = sinon.stub(nativeBridge.Storage, 'delete');

        return testMetaData.get(key, false).then(result => {
            assert.equal(value, result, 'results do not match');
            sinon.assert.notCalled(deleteStub);
        });
    });

    it('should return value successfully, delete and write', () => {
        let key: string = 'testkey';
        let value: string = 'foo';
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
        let deleteStub = sinon.stub(nativeBridge.Storage, 'delete').withArgs(StorageType.PUBLIC, key);
        let writeStub = sinon.stub(nativeBridge.Storage, 'write').withArgs(StorageType.PUBLIC);

        return testMetaData.get(key, true).then(result => {
            assert.equal(value, result, 'results do not match');
            sinon.assert.calledOnce(deleteStub);
            sinon.assert.calledOnce(writeStub);
        });
    });

    it('should handle value not found error', () => {
        let key: string = 'testkey';
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_VALUE]]));

        return testMetaData.get(key, false).then(result => {
            assert.isNull(result, 'result was not null when value was not found');
        });
    });

    it('should handle storage not found error', () => {
        let key: string = 'testkey';
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_STORAGE]]));

        return testMetaData.get(key, false).then(result => {
            assert.isNull(result, 'result was not null when storage was not found');
        });
    });

    it('should throw on unknown error', () => {
        let key: string = 'testkey';
        let errorMsg: string = 'UNKNOWN_ERROR';
        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([errorMsg]));

        return testMetaData.get(key, false).then(() => {
            assert.fail('unknown error should have thrown');
        }).catch(error => {
            assert.match(error, /UNKNOWN_ERROR/, 'unknown error should have UNKNOWN_ERROR in error message');
        });
    });
});