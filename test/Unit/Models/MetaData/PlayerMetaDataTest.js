System.register(["tslib", "mocha", "chai", "sinon", "Native/NativeBridge", "Managers/MetaDataManager", "Native/Api/Storage", "Models/MetaData/PlayerMetaData"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, NativeBridge_1, MetaDataManager_1, Storage_1, PlayerMetaData_1, TestStorageApi;
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
            function (PlayerMetaData_1_1) {
                PlayerMetaData_1 = PlayerMetaData_1_1;
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
                            case 'player.server_id.value':
                                return Promise.resolve(this._storage.player.server_id.value);
                            default:
                                throw new Error('Unknown player key "' + key + '"');
                        }
                    }
                    catch (error) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                };
                TestStorageApi.prototype.delete = function (storageType, key) {
                    if (key === 'player') {
                        delete this._storage.player;
                    }
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    try {
                        if (key === 'player') {
                            return Promise.resolve(Object.keys(this._storage.player));
                        }
                        return Promise.resolve([]);
                    }
                    catch (error) {
                        return Promise.resolve([]);
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('PlayerMetaDataTest', function () {
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
                it('should return undefined when data does not exist', function () {
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(PlayerMetaData_1.PlayerMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'Returned PlayerMetaData even when it does not exist');
                    });
                });
                it('should fetch correctly', function () {
                    storageApi.setStorage({
                        player: {
                            server_id: { value: 'test_sid' }
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(PlayerMetaData_1.PlayerMetaData, false).then(function (metaData) {
                        if (metaData) {
                            chai_1.assert.equal(metaData.getServerId(), 'test_sid', 'PlayerMetaData.getServerId() did not pass through correctly');
                            chai_1.assert.deepEqual(metaData.getDTO(), {
                                sid: 'test_sid'
                            }, 'PlayerMetaData.getDTO() produced invalid output');
                            return metaDataManager.fetch(PlayerMetaData_1.PlayerMetaData).then(function (exists) {
                                chai_1.assert.isUndefined(exists, 'PlayerMetaData was not deleted after fetching');
                            });
                        }
                        else {
                            throw new Error('PlayerMetaData is not defined');
                        }
                    });
                });
                it('should not fetch when data is undefined', function () {
                    storageApi.setStorage({
                        player: {
                            server_id: undefined
                        }
                    });
                    var metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    return metaDataManager.fetch(PlayerMetaData_1.PlayerMetaData).then(function (metaData) {
                        chai_1.assert.isUndefined(metaData, 'PlayerMetaData is not defined');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyTWV0YURhdGFUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiUGxheWVyTWV0YURhdGFUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFTQTtnQkFBNkIsMENBQVU7Z0JBQXZDOztnQkF1Q0EsQ0FBQztnQkFuQ1UsbUNBQVUsR0FBakIsVUFBa0IsSUFBUztvQkFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7Z0JBQ3pCLENBQUM7Z0JBRU0sNEJBQUcsR0FBVixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBSTt3QkFDQSxRQUFPLEdBQUcsRUFBRTs0QkFDUixLQUFLLHdCQUF3QjtnQ0FDekIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFakU7Z0NBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7eUJBQzNEO3FCQUNKO29CQUFDLE9BQU0sS0FBSyxFQUFFO3dCQUNYLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ3JEO2dCQUNMLENBQUM7Z0JBRU0sK0JBQU0sR0FBYixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBRyxHQUFHLEtBQUssUUFBUSxFQUFFO3dCQUNqQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO3FCQUMvQjtvQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sZ0NBQU8sR0FBZCxVQUFlLFdBQXdCLEVBQUUsR0FBVyxFQUFFLFNBQWtCO29CQUNwRSxJQUFJO3dCQUNBLElBQUcsR0FB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