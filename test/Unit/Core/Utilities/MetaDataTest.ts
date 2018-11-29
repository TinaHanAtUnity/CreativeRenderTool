import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageError, StorageType } from 'Core/Native/Storage';
import { MetaData } from 'Core/Utilities/MetaData';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(Platform[platform] + ' - MetaDataTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let metaData: MetaData;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            metaData = new MetaData(core);
        });

        describe(('get'), () => {
            it('should return value successfully and not delete', () => {
                const key: string = 'testkey';
                const value: string = 'foo';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
                const deleteStub = sinon.stub(core.Storage, 'delete');

                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(true, found, 'existing value was not found');
                    assert.equal(value, result, 'results do not match');
                    sinon.assert.notCalled(deleteStub);
                });
            });

            it('should return value successfully, delete and write', () => {
                const key: string = 'testkey';
                const value: string = 'foo';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
                const deleteStub = sinon.stub(core.Storage, 'delete').withArgs(StorageType.PUBLIC, key);
                const writeStub = sinon.stub(core.Storage, 'write').withArgs(StorageType.PUBLIC);

                return metaData.get(key, true).then(([found, result]) => {
                    assert.equal(true, found, 'existing value was not found');
                    assert.equal(value, result, 'results do not match');
                    sinon.assert.calledOnce(deleteStub);
                    sinon.assert.calledOnce(writeStub);
                });
            });

            it('should handle value not found error', () => {
                const key: string = 'testkey';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_VALUE]]));

                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(false, found, 'value was found when expecting error');
                    assert.isNull(result, 'result was not null when value was not found');
                });
            });

            it('should handle storage not found error', () => {
                const key: string = 'testkey';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_STORAGE]]));

                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(false, found, 'value was found when expecting error');
                    assert.isNull(result, 'result was not null when storage was not found');
                });
            });

            it('should throw on unknown error', () => {
                const key: string = 'testkey';
                const errorMsg: string = 'UNKNOWN_ERROR';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([errorMsg]));

                return metaData.get(key, false).then(() => {
                    assert.fail('unknown error should have thrown');
                }).catch(error => {
                    assert.match(error, /UNKNOWN_ERROR/, 'unknown error should have UNKNOWN_ERROR in error message');
                });
            });
        });

        describe('hasCategory', () => {
            it('should return existing category', () => {
                const category: string = 'testcategory';
                const subKeys: string[] = ['a', 'b', 'c'];
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.resolve(subKeys));

                return metaData.hasCategory(category).then(exists => {
                    assert.equal(true, exists, 'existing category not found');
                });
            });

            it('should not return category with no subkeys', () => {
                const category: string = 'testcategory';
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.resolve([]));

                return metaData.hasCategory(category).then(exists => {
                    assert.equal(false, exists, 'non-existing category found');
                });
            });

            it('should handle storage not found error', () => {
                const category: string = 'testcategory';
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.reject([StorageError[StorageError.COULDNT_GET_STORAGE]]));

                return metaData.hasCategory(category).then(exists => {
                    assert.equal(false, exists, 'category found from storage that does not exist');
                });
            });

            it('should throw on unknown error', () => {
                const category: string = 'testcategory';
                const errorMsg: string = 'UNKNOWN_ERROR';
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.reject([errorMsg]));

                return metaData.hasCategory(category).then(() => {
                    assert.fail('unknown error should have thrown');
                }).catch(error => {
                    assert.match(error, /UNKNOWN_ERROR/, 'unknown error should have UNKNOWN_ERROR in error message');
                });
            });
        });
    });
});
