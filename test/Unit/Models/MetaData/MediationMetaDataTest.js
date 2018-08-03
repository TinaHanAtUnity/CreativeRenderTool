System.register(["tslib", "mocha", "chai", "sinon", "Native/NativeBridge", "Managers/MetaDataManager", "Native/Api/Storage", "Models/MetaData/MediationMetaData"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, NativeBridge_1, MetaDataManager_1, Storage_1, MediationMetaData_1, TestStorageApi;
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
            function (MediationMetaData_1_1) {
                MediationMetaData_1 = MediationMetaData_1_1;
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
                            case 'mediation.name.value':
                                return Promise.resolve(this._storage.mediation.name.value);
                            case 'mediation.version.value':
                                return Promise.resolve(this._storage.mediation.version.value);
                            case 'mediation.ordinal.value':
                                return Promise.resolve(this._storage.mediation.ordinal.value);
                            default:
                                throw new Error('Unknown mediation key "' + key + '"');
                        }
                    }
                    catch (error) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                };
                TestStorageApi.prototype.delete = function (storageType, key) {
                    if (key === 'mediation') {
                        delete this._storage.mediation;
                    }
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    try {
                        if (key === 'mediation') {
                            return Promise.resolve(Object.keys(this._storage.mediation));
                        }
                        return Promise.resolve([]);
                    }
                    catch (error) {
                        return Promise.resolve([]);
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('MediationMetaDataTest', function () {
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
                    return metaDataManager.fetch(MediationMetaData_1.MediationMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'Returned MediationMetaData even when it doesnt exist');
                    });
                });
                it('should fetch correctly', function () {
                    storageApi.setStorage({
                        mediation: {
                            name: { value: 'test_name' },
                            version: { value: 'test_version' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(MediationMetaData_1.MediationMetaData, true, ['name', 'version']).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                            chai_1.assert.deepEqual(metaData.getDTO(), {
                                mediationName: 'test_name',
                                mediationVersion: 'test_version',
                                mediationOrdinal: undefined
                            }, 'MediationMetaData.getDTO() produced invalid output');
                        }
                        else {
                            throw new Error('MediationMetaData is not defined');
                        }
                    });
                });
                it('should update correctly', function () {
                    storageApi.setStorage({
                        mediation: {
                            name: { value: 'test_name' },
                            version: { value: 'test_version' },
                            ordinal: { value: 42 }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(MediationMetaData_1.MediationMetaData, true, ['name', 'version']).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                            chai_1.assert.equal(metaData.getOrdinal(), undefined, 'MediationMetaData.getOrdinal() did not pass through correctly');
                            return metaDataManager.fetch(MediationMetaData_1.MediationMetaData, true, ['ordinal']).then(function (metaData2) {
                                chai_1.assert.equal(metaData, metaData2, 'MediationMetaData was redefined');
                                if (metaData2) {
                                    chai_1.assert.equal(metaData2.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                                    chai_1.assert.equal(metaData2.getVersion(), 'test_version', 'MediationMetaData.getVersion() did not pass through correctly');
                                    chai_1.assert.equal(metaData2.getOrdinal(), 42, 'MediationMetaData.getOrdinal() did not pass through correctly');
                                    chai_1.assert.deepEqual(metaData2.getDTO(), {
                                        mediationName: 'test_name',
                                        mediationVersion: 'test_version',
                                        mediationOrdinal: 42
                                    }, 'MediationMetaData.getDTO() produced invalid output');
                                }
                                else {
                                    throw new Error('MediationMetaData is not defined');
                                }
                            });
                        }
                        else {
                            throw new Error('MediationMetaData is not defined');
                        }
                    });
                });
                it('should not fetch when data is undefined', function () {
                    storageApi.setStorage({
                        mediation: {
                            name: undefined,
                            version: undefined,
                            ordinal: undefined
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(MediationMetaData_1.MediationMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'MediationMetaData is defined');
                    });
                });
                it('should fetch correctly when data is partially undefined', function () {
                    storageApi.setStorage({
                        mediation: {
                            name: { value: 'test_name' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(MediationMetaData_1.MediationMetaData).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'MediationMetaData.getName() did not pass through correctly');
                            chai_1.assert.isUndefined(metaData.getVersion(), 'MediationMetaData.getVersion() did not pass through correctly');
                            chai_1.assert.isUndefined(metaData.getOrdinal(), 'MediationMetaData.getOrdinal() did not pass through correctly');
                        }
                        else {
                            throw new Error('MediationMetaData is not defined');
                        }
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkaWF0aW9uTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTWVkaWF0aW9uTWV0YURhdGFUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFTQTtnQkFBNkIsMENBQVU7Z0JBQXZDOztnQkE2Q0EsQ0FBQztnQkF6Q1UsbUNBQVUsR0FBakIsVUFBa0IsSUFBUztvQkFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRU0sNEJBQUcsR0FBVixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBSTt3QkFDQSxRQUFPLEdBQUcsRUFBRTs0QkFDUixLQUFLLHNCQUFzQjtnQ0FDdkIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFL0QsS0FBSyx5QkFBeUI7Z0NBQzFCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRWxFLEtBQUsseUJBQXlCO2dDQUMxQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUVsRTtnQ0FDSSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQzt5QkFDOUQ7cUJBQ0o7b0JBQUMsT0FBTSxLQUFLLEVBQUU7d0JBQ1gsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDckQ7Z0JBQ0wsQ0FBQztnQkFFTSwrQkFBTSxHQUFiLFVBQWMsV0FBd0IsRUFBRSxHQUFXO29CQUMvQyxJQUFH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