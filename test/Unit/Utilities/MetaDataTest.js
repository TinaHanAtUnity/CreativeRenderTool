System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Native/Api/Storage", "Utilities/MetaData"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, Storage_1, MetaData_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (MetaData_1_1) {
                MetaData_1 = MetaData_1_1;
            }
        ],
        execute: function () {
            describe('MetaDataTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var metaData;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({ handleInvocation: handleInvocation, handleCallback: handleCallback });
                    metaData = new MetaData_1.MetaData(nativeBridge);
                });
                describe(('get'), function () {
                    it('should return value successfully and not delete', function () {
                        var key = 'testkey';
                        var value = 'foo';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
                        var deleteStub = sinon.stub(nativeBridge.Storage, 'delete');
                        return metaData.get(key, false).then(function (_a) {
                            var found = _a[0], result = _a[1];
                            chai_1.assert.equal(true, found, 'existing value was not found');
                            chai_1.assert.equal(value, result, 'results do not match');
                            sinon.assert.notCalled(deleteStub);
                        });
                    });
                    it('should return value successfully, delete and write', function () {
                        var key = 'testkey';
                        var value = 'foo';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, key + '.value').returns(Promise.resolve([value]));
                        var deleteStub = sinon.stub(nativeBridge.Storage, 'delete').withArgs(Storage_1.StorageType.PUBLIC, key);
                        var writeStub = sinon.stub(nativeBridge.Storage, 'write').withArgs(Storage_1.StorageType.PUBLIC);
                        return metaData.get(key, true).then(function (_a) {
                            var found = _a[0], result = _a[1];
                            chai_1.assert.equal(true, found, 'existing value was not found');
                            chai_1.assert.equal(value, result, 'results do not match');
                            sinon.assert.calledOnce(deleteStub);
                            sinon.assert.calledOnce(writeStub);
                        });
                    });
                    it('should handle value not found error', function () {
                        var key = 'testkey';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, key + '.value').returns(Promise.reject([Storage_1.StorageError[Storage_1.StorageError.COULDNT_GET_VALUE]]));
                        return metaData.get(key, false).then(function (_a) {
                            var found = _a[0], result = _a[1];
                            chai_1.assert.equal(false, found, 'value was found when expecting error');
                            chai_1.assert.isNull(result, 'result was not null when value was not found');
                        });
                    });
                    it('should handle storage not found error', function () {
                        var key = 'testkey';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, key + '.value').returns(Promise.reject([Storage_1.StorageError[Storage_1.StorageError.COULDNT_GET_STORAGE]]));
                        return metaData.get(key, false).then(function (_a) {
                            var found = _a[0], result = _a[1];
                            chai_1.assert.equal(false, found, 'value was found when expecting error');
                            chai_1.assert.isNull(result, 'result was not null when storage was not found');
                        });
                    });
                    it('should throw on unknown error', function () {
                        var key = 'testkey';
                        var errorMsg = 'UNKNOWN_ERROR';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, key + '.value').returns(Promise.reject([errorMsg]));
                        return metaData.get(key, false).then(function () {
                            chai_1.assert.fail('unknown error should have thrown');
                        }).catch(function (error) {
                            chai_1.assert.match(error, /UNKNOWN_ERROR/, 'unknown error should have UNKNOWN_ERROR in error message');
                        });
                    });
                });
                describe('hasCategory', function () {
                    it('should return existing category', function () {
                        var category = 'testcategory';
                        var subKeys = ['a', 'b', 'c'];
                        sinon.stub(nativeBridge.Storage, 'getKeys').withArgs(Storage_1.StorageType.PUBLIC, category, false).returns(Promise.resolve(subKeys));
                        return metaData.hasCategory(category).then(function (exists) {
                            chai_1.assert.equal(true, exists, 'existing category not found');
                        });
                    });
                    it('should not return category with no subkeys', function () {
                        var category = 'testcategory';
                        sinon.stub(nativeBridge.Storage, 'getKeys').withArgs(Storage_1.StorageType.PUBLIC, category, false).returns(Promise.resolve([]));
                        return metaData.hasCategory(category).then(function (exists) {
                            chai_1.assert.equal(false, exists, 'non-existing category found');
                        });
                    });
                    it('should handle storage not found error', function () {
                        var category = 'testcategory';
                        sinon.stub(nativeBridge.Storage, 'getKeys').withArgs(Storage_1.StorageType.PUBLIC, category, false).returns(Promise.reject([Storage_1.StorageError[Storage_1.StorageError.COULDNT_GET_STORAGE]]));
                        return metaData.hasCategory(category).then(function (exists) {
                            chai_1.assert.equal(false, exists, 'category found from storage that does not exist');
                        });
                    });
                    it('should throw on unknown error', function () {
                        var category = 'testcategory';
                        var errorMsg = 'UNKNOWN_ERROR';
                        sinon.stub(nativeBridge.Storage, 'getKeys').withArgs(Storage_1.StorageType.PUBLIC, category, false).returns(Promise.reject([errorMsg]));
                        return metaData.hasCategory(category).then(function () {
                            chai_1.assert.fail('unknown error should have thrown');
                        }).catch(function (error) {
                            chai_1.assert.match(error, /UNKNOWN_ERROR/, 'unknown error should have UNKNOWN_ERROR in error message');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWV0YURhdGFUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFRQSxRQUFRLENBQUMsY0FBYyxFQUFFO2dCQUNyQixJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDckMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNuQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksUUFBa0IsQ0FBQztnQkFFdkIsVUFBVSxDQUFDO29CQUNQLFlBQVksR0FBRyxJQUFJLDJCQUFZLENBQUMsRUFBQyxnQkFBZ0Isa0JBQUEsRUFBRSxjQUFjLGdCQUFBLEVBQUMsQ0FBQyxDQUFDO29CQUNwRSxRQUFRLEdBQUcsSUFBSSxtQkFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUMxQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDZCxFQUFFLENBQUMsaURBQWlELEVBQUU7d0JBQ2xELElBQU0sR0FBRyxHQUFXLFNBQVMsQ0FBQzt3QkFDOUIsSUFBTSxLQUFLLEdBQVcsS0FBSyxDQUFDO3dCQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLHFCQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDdkgsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUU5RCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FB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