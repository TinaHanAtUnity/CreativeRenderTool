import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { StorageError, StorageType } from 'Core/Native/Storage';
import { MetaData } from 'Core/Utilities/MetaData';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(Platform[platform] + ' - MetaDataTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let metaData;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            metaData = new MetaData(core);
        });
        describe(('get'), () => {
            it('should return value successfully and not delete', () => {
                const key = 'testkey';
                const value = 'foo';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
                const deleteStub = sinon.stub(core.Storage, 'delete');
                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(true, found, 'existing value was not found');
                    assert.equal(value, result, 'results do not match');
                    sinon.assert.notCalled(deleteStub);
                });
            });
            it('should return value successfully, delete and write', () => {
                const key = 'testkey';
                const value = 'foo';
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
                const key = 'testkey';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_VALUE]]));
                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(false, found, 'value was found when expecting error');
                    assert.isNull(result, 'result was not null when value was not found');
                });
            });
            it('should handle storage not found error', () => {
                const key = 'testkey';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, key + '.value').returns(Promise.reject([StorageError[StorageError.COULDNT_GET_STORAGE]]));
                return metaData.get(key, false).then(([found, result]) => {
                    assert.equal(false, found, 'value was found when expecting error');
                    assert.isNull(result, 'result was not null when storage was not found');
                });
            });
            it('should throw on unknown error', () => {
                const key = 'testkey';
                const errorMsg = 'UNKNOWN_ERROR';
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
                const category = 'testcategory';
                const subKeys = ['a', 'b', 'c'];
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.resolve(subKeys));
                return metaData.hasCategory(category).then(exists => {
                    assert.equal(true, exists, 'existing category not found');
                });
            });
            it('should not return category with no subkeys', () => {
                const category = 'testcategory';
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.resolve([]));
                return metaData.hasCategory(category).then(exists => {
                    assert.equal(false, exists, 'non-existing category found');
                });
            });
            it('should handle storage not found error', () => {
                const category = 'testcategory';
                sinon.stub(core.Storage, 'getKeys').withArgs(StorageType.PUBLIC, category, false).returns(Promise.reject([StorageError[StorageError.COULDNT_GET_STORAGE]]));
                return metaData.hasCategory(category).then(exists => {
                    assert.equal(false, exists, 'category found from storage that does not exist');
                });
            });
            it('should throw on unknown error', () => {
                const category = 'testcategory';
                const errorMsg = 'UNKNOWN_ERROR';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvVXRpbGl0aWVzL01ldGFEYXRhVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtRQUNsRCxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksUUFBa0IsQ0FBQztRQUV2QixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRTtZQUNuQixFQUFFLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO2dCQUN2RCxNQUFNLEdBQUcsR0FBVyxTQUFTLENBQUM7Z0JBQzlCLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBQztnQkFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0csTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUV0RCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7b0JBQ3JELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO29CQUMxRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDcEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO2dCQUMxRCxNQUFNLEdBQUcsR0FBVyxTQUFTLENBQUM7Z0JBQzlCLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBQztnQkFDNUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0csTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN4RixNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFakYsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO29CQUNwRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsOEJBQThCLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLHNCQUFzQixDQUFDLENBQUM7b0JBQ3BELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNwQyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQztnQkFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFckosT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO29CQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztvQkFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsOENBQThDLENBQUMsQ0FBQztnQkFDMUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQztnQkFDOUIsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkosT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFO29CQUNyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztvQkFDbkUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztnQkFDNUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JDLE1BQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQztnQkFDOUIsTUFBTSxRQUFRLEdBQVcsZUFBZSxDQUFDO2dCQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqSCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtZQUN6QixFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLFFBQVEsR0FBVyxjQUFjLENBQUM7Z0JBQ3hDLE1BQU0sT0FBTyxHQUFhLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUVwSCxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztnQkFDOUQsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xELE1BQU0sUUFBUSxHQUFXLGNBQWMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUUvRyxPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztnQkFDL0QsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sUUFBUSxHQUFXLGNBQWMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFNUosT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDaEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGlEQUFpRCxDQUFDLENBQUM7Z0JBQ25GLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBVyxjQUFjLENBQUM7Z0JBQ3hDLE1BQU0sUUFBUSxHQUFXLGVBQWUsQ0FBQztnQkFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEgsT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUNiLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSwwREFBMEQsQ0FBQyxDQUFDO2dCQUNyRyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=