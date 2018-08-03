System.register(["tslib", "mocha", "chai", "sinon", "Native/NativeBridge", "Managers/MetaDataManager", "Native/Api/Storage", "Models/MetaData/FrameworkMetaData"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, NativeBridge_1, MetaDataManager_1, Storage_1, FrameworkMetaData_1, TestStorageApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (FrameworkMetaData_1_1) {
                FrameworkMetaData_1 = FrameworkMetaData_1_1;
            }
        ],
        execute: function () {
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestStorageApi.prototype.setStorage = function (data) {
                    this._storage = data;
                };
                TestStorageApi.prototype.get = function (storageType, key) {
                    try {
                        switch (key) {
                            case 'framework.name.value':
                                return Promise.resolve(this._storage.framework.name.value);
                            case 'framework.version.value':
                                return Promise.resolve(this._storage.framework.version.value);
                            default:
                                throw new Error('Unknown framework key "' + key + '"');
                        }
                    }
                    catch (error) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                };
                TestStorageApi.prototype.delete = function (storageType, key) {
                    if (key === 'framework') {
                        delete this._storage.framework;
                    }
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    try {
                        if (key === 'framework') {
                            return Promise.resolve(Object.keys(this._storage.framework));
                        }
                        return Promise.resolve([]);
                    }
                    catch (error) {
                        return Promise.resolve([]);
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('FrameworkMetaDataTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge, storageApi;
                before(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    nativeBridge.Storage = storageApi = new TestStorageApi(nativeBridge);
                });
                it('should return undefined when data doesnt exist', function () {
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(FrameworkMetaData_1.FrameworkMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'Returned FrameworkMetaData even when it doesnt exist');
                    });
                });
                it('should fetch correctly', function () {
                    storageApi.setStorage({
                        framework: {
                            name: { value: 'test_name' },
                            version: { value: 'test_version' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(FrameworkMetaData_1.FrameworkMetaData).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), 'test_version', 'FrameworkMetaData.getVersion() did not pass through correctly');
                            chai_1.assert.deepEqual(metaData.getDTO(), {
                                frameworkName: 'test_name',
                                frameworkVersion: 'test_version'
                            }, 'FrameworkMetaData.getDTO() produced invalid output');
                        }
                        else {
                            throw new Error('FrameworkMetaData is not defined');
                        }
                    });
                });
                it('should not fetch when data is undefined', function () {
                    storageApi.setStorage({
                        framework: {
                            name: undefined,
                            version: undefined
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(FrameworkMetaData_1.FrameworkMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'FrameworkMetaData is defined');
                    });
                });
                it('should fetch correctly when data is partially undefined', function () {
                    storageApi.setStorage({
                        framework: {
                            name: { value: 'test_name' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(FrameworkMetaData_1.FrameworkMetaData).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'FrameworkMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), undefined, 'FrameworkMetaData.getVersion() did not pass through correctly');
                        }
                        else {
                            throw new Error('FrameworkMetaData is not defined');
                        }
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhbWV3b3JrTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiRnJhbWV3b3JrTWV0YURhdGFUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFTQTtnQkFBNkIsMENBQVU7Z0JBQXZDOztnQkEwQ0EsQ0FBQztnQkF0Q1UsbUNBQVUsR0FBakIsVUFBa0IsSUFBUztvQkFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRU0sNEJBQUcsR0FBVixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBSTt3QkFDQSxRQUFPLEdBQUcsRUFBRTs0QkFDUixLQUFLLHNCQUFzQjtnQ0FDdkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFL0QsS0FBSyx5QkFBeUI7Z0NBQzFCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRWxFO2dDQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO3lCQUM5RDtxQkFDSjtvQkFBQyxPQUFNLEtBQUssRUFBRTt3QkFDWCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNyRDtnQkFDTCxDQUFDO2dCQUVNLCtCQUFNLEdBQWIsVUFBYyxXQUF3QixFQUFFLEdBQVc7b0JBQy9DLElBQUcsR0FBRyxLQUFLLFdBQVcsRUFBRTt3QkFDcEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztxQkFDbEM7b0JBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUks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