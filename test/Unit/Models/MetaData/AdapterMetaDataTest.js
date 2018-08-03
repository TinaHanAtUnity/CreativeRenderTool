System.register(["tslib", "mocha", "chai", "sinon", "Native/NativeBridge", "Managers/MetaDataManager", "Native/Api/Storage", "Models/MetaData/AdapterMetaData"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, NativeBridge_1, MetaDataManager_1, Storage_1, AdapterMetaData_1, TestStorageApi;
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
            function (AdapterMetaData_1_1) {
                AdapterMetaData_1 = AdapterMetaData_1_1;
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
                            case 'adapter.name.value':
                                return Promise.resolve(this._storage.adapter.name.value);
                            case 'adapter.version.value':
                                return Promise.resolve(this._storage.adapter.version.value);
                            default:
                                throw new Error('Unknown adapter key "' + key + '"');
                        }
                    }
                    catch (error) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                };
                TestStorageApi.prototype.delete = function (storageType, key) {
                    if (key === 'adapter') {
                        delete this._storage.adapter;
                    }
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    try {
                        if (key === 'adapter') {
                            return Promise.resolve(Object.keys(this._storage.adapter));
                        }
                        return Promise.resolve([]);
                    }
                    catch (error) {
                        return Promise.resolve([]);
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('AdapterMetaDataTest', function () {
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
                    return metaDataManager.fetch(AdapterMetaData_1.AdapterMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'Returned AdapterMetaData even when it doesnt exist');
                    });
                });
                it('should fetch correctly', function () {
                    storageApi.setStorage({
                        adapter: {
                            name: { value: 'test_name' },
                            version: { value: 'test_version' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(AdapterMetaData_1.AdapterMetaData).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), 'test_version', 'AdapterMetaData.getVersion() did not pass through correctly');
                            chai_1.assert.deepEqual(metaData.getDTO(), {
                                adapterName: 'test_name',
                                adapterVersion: 'test_version'
                            }, 'AdapterMetaData.getDTO() produced invalid output');
                        }
                        else {
                            throw new Error('AdapterMetaData is not defined');
                        }
                    });
                });
                it('should not fetch when data is undefined', function () {
                    storageApi.setStorage({
                        adapter: {
                            name: undefined,
                            version: undefined
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(AdapterMetaData_1.AdapterMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'AdapterMetaData is defined');
                    });
                });
                it('should fetch correctly when data is partially undefined', function () {
                    storageApi.setStorage({
                        adapter: {
                            name: { value: 'test_name' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(AdapterMetaData_1.AdapterMetaData).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getName(), 'test_name', 'AdapterMetaData.getName() did not pass through correctly');
                            chai_1.assert.equal(metaData.getVersion(), undefined, 'AdapterMetaData.getVersion() did not pass through correctly');
                        }
                        else {
                            throw new Error('AdapterMetaData is not defined');
                        }
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRhcHRlck1ldGFEYXRhVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFkYXB0ZXJNZXRhRGF0YVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQVNBO2dCQUE2QiwwQ0FBVTtnQkFBdkM7O2dCQTBDQSxDQUFDO2dCQXRDVSxtQ0FBVSxHQUFqQixVQUFrQixJQUFTO29CQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDekIsQ0FBQztnQkFFTSw0QkFBRyxHQUFWLFVBQWMsV0FBd0IsRUFBRSxHQUFXO29CQUMvQyxJQUFJO3dCQUNBLFFBQU8sR0FBRyxFQUFFOzRCQUNSLEtBQUssb0JBQW9CO2dDQUNyQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUU3RCxLQUFLLHVCQUF1QjtnQ0FDeEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFaEU7Z0NBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7eUJBQzVEO3FCQUNKO29CQUFDLE9BQU0sS0FBSyxFQUFFO3dCQUNYLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3JEO2dCQUNMLENBQUM7Z0JBRU0sK0JBQU0sR0FBYixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBRyxHQUFHLEtBQUssU0FBUyxFQUFFO3dCQUNsQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO3FCQUNoQztvQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFD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