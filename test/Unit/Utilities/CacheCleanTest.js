System.register(["tslib", "mocha", "chai", "sinon", "Native/Api/Cache", "Native/Api/Storage", "../TestHelpers/TestFixtures", "Utilities/Cache", "Managers/WakeUpManager", "Utilities/Request", "../TestHelpers/FakeSdkApi", "Managers/FocusManager", "Utilities/CacheBookkeeping", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, Cache_1, Storage_1, TestFixtures_1, Cache_2, WakeUpManager_1, Request_1, FakeSdkApi_1, FocusManager_1, CacheBookkeeping_1, ProgrammaticTrackingService_1, TestCacheApi, TestStorageApi, TestHelper;
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
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Cache_2_1) {
                Cache_2 = Cache_2_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (FakeSdkApi_1_1) {
                FakeSdkApi_1 = FakeSdkApi_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (ProgrammaticTrackingService_1_1) {
                ProgrammaticTrackingService_1 = ProgrammaticTrackingService_1_1;
            }
        ],
        execute: function () {
            TestCacheApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestCacheApi, _super);
                function TestCacheApi(nativeBridge) {
                    var _this = _super.call(this, nativeBridge) || this;
                    _this._files = [];
                    return _this;
                }
                TestCacheApi.prototype.getFiles = function () {
                    return Promise.resolve(this._files);
                };
                TestCacheApi.prototype.deleteFile = function (fileId) {
                    for (var _i = 0, _a = this._files; _i < _a.length; _i++) {
                        var i = _a[_i];
                        if (i.id === fileId) {
                            return Promise.resolve();
                        }
                    }
                    return Promise.reject(Cache_1.CacheError[Cache_1.CacheError.FILE_NOT_FOUND]);
                };
                TestCacheApi.prototype.addFile = function (id, size, mtime) {
                    this._files.push({
                        id: id,
                        found: true,
                        size: size,
                        mtime: mtime
                    });
                };
                return TestCacheApi;
            }(Cache_1.CacheApi));
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi(nativeBridge) {
                    var _this = _super.call(this, nativeBridge) || this;
                    _this._dirty = false;
                    return _this;
                }
                TestStorageApi.prototype.get = function (type, key) {
                    if (key && key.match(/^cache\.files\./)) {
                        var id = key.substring(12);
                        id = id.split('.')[0];
                        if (this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[id]) {
                            return Promise.resolve(this._contents.cache.files[id]);
                        }
                    }
                    if (key && key.match(/^cache\.campaigns\./)) {
                        var id = key.substring(16);
                        if (this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
                            return Promise.resolve(this._contents.cache.campaigns[id]);
                        }
                    }
                    if (key && key.match(/^cache\.campaigns/)) {
                        if (this._contents && this._contents.cache && this._contents.cache.campaigns) {
                            return Promise.resolve(this._contents.cache.campaigns);
                        }
                    }
                    return Promise.reject(Storage_1.StorageError[Storage_1.StorageError.COULDNT_GET_VALUE]);
                };
                TestStorageApi.prototype.delete = function (type, key) {
                    if (key && key.match(/^cache\.files\./)) {
                        var id = key.substring(12);
                        if (this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[id]) {
                            this._dirty = true;
                            delete this._contents.cache.files[id];
                            return Promise.resolve();
                        }
                    }
                    if (key && key.match(/^cache\.campaigns\./)) {
                        var id = key.substring(16);
                        if (this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
                            this._dirty = true;
                            delete this._contents.cache.campaigns[id];
                            return Promise.resolve();
                        }
                    }
                    if (key && key.match(/cache/)) {
                        this._dirty = true;
                        delete this._contents.cache;
                        return Promise.resolve();
                    }
                    return Promise.reject(Storage_1.StorageError[Storage_1.StorageError.COULDNT_DELETE_VALUE]);
                };
                TestStorageApi.prototype.write = function (type) {
                    this._dirty = false;
                    return Promise.resolve();
                };
                TestStorageApi.prototype.getKeys = function (type, key, recursive) {
                    if (type === Storage_1.StorageType.PRIVATE && key === 'cache.files') {
                        var retArray = [];
                        if (this._contents && this._contents.cache && this._contents.cache.files) {
                            for (var i in this._contents.cache.files) {
                                if (this._contents.cache.files.hasOwnProperty(i)) {
                                    retArray.push(i);
                                }
                            }
                        }
                        return Promise.resolve(retArray);
                    }
                    if (type === Storage_1.StorageType.PRIVATE && key === 'cache.campaigns') {
                        var retArray = [];
                        if (this._contents && this._contents.cache && this._contents.cache.campaigns) {
                            for (var i in this._contents.cache.campaigns) {
                                if (this._contents.cache.campaigns.hasOwnProperty(i)) {
                                    retArray.push(i);
                                }
                            }
                        }
                        return Promise.resolve(retArray);
                    }
                    if (type === Storage_1.StorageType.PRIVATE && key === 'cache') {
                        var retArray = [];
                        if (this._contents && this._contents.cache) {
                            for (var i in this._contents.cache) {
                                if (this._contents.cache.hasOwnProperty(i)) {
                                    retArray.push(i);
                                }
                            }
                        }
                        return Promise.resolve(retArray);
                    }
                    return Promise.resolve([]);
                };
                TestStorageApi.prototype.isDirty = function () {
                    return this._dirty;
                };
                TestStorageApi.prototype.hasFileEntry = function (fileId) {
                    fileId = fileId.split('.')[0];
                    if (this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[fileId]) {
                        return true;
                    }
                    return false;
                };
                TestStorageApi.prototype.hasCampaignEntry = function (id) {
                    if (this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
                        return true;
                    }
                    return false;
                };
                TestStorageApi.prototype.setStorageContents = function (contents) {
                    this._contents = contents;
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            TestHelper = /** @class */ (function () {
                function TestHelper(cache, storage) {
                    this._cache = cache;
                    this._storage = storage;
                    this._baseTimestamp = new Date().getTime();
                }
                TestHelper.prototype.addFile = function (id, size, ageInDays) {
                    this._cache.addFile(id, size, this._baseTimestamp - (ageInDays * 24 * 60 * 60 * 1000));
                };
                return TestHelper;
            }());
            describe('CacheCleanTest', function () {
                var cache;
                var cacheBookkeeping;
                var helper;
                var cacheApi;
                var storageApi;
                beforeEach(function () {
                    var nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    var request = new Request_1.Request(nativeBridge, wakeUpManager);
                    var programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    cache = new Cache_2.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    cacheApi = new TestCacheApi(nativeBridge);
                    storageApi = new TestStorageApi(nativeBridge);
                    nativeBridge.Cache = cacheApi;
                    nativeBridge.Storage = storageApi;
                    nativeBridge.Sdk = new FakeSdkApi_1.FakeSdkApi(nativeBridge);
                    helper = new TestHelper(cacheApi, storageApi);
                });
                it('should keep new files', function () {
                    var fileId = 'test.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    // add one file, 2 days old
                    helper.addFile(fileId, 1000000, 2);
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                test: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 0, 'Cache cleanup tried to delete files when none should have been deleted');
                        chai_1.assert.isTrue(storageApi.hasFileEntry(fileId), 'Cache cleanup removed entry for kept file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should delete old files', function () {
                    var fileId = 'test1.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    // add one file, 30 days old
                    helper.addFile(fileId, 1000000, 30);
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                test: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
                        chai_1.assert.isFalse(storageApi.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should keep new files and delete old files', function () {
                    var newFileId = 'new.mp4';
                    var newFileId2 = 'new2.mp4';
                    var oldFileId = 'old.mp4';
                    var oldFileId2 = 'old2.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    helper.addFile(newFileId, 1000000, 1); // 1 day old, should be kept
                    helper.addFile(newFileId2, 1000000, 2); // 2 days old, should be kept
                    helper.addFile(oldFileId, 1000000, 31); // 31 days old, should be deleted
                    helper.addFile(oldFileId2, 1000000, 32); // 32 days old, should be deleted
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                new: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                },
                                new2: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                },
                                old: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                },
                                old2: {
                                    fullyDownloaded: true,
                                    size: 1000000,
                                    totalSize: 1000000,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 2, 'Cache cleanup should have deleted two files');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], oldFileId, 'Cache cleanup deleted the wrong file (should have deleted first)');
                        chai_1.assert.equal(cacheSpy.getCall(1).args[0], oldFileId2, 'Cache cleanup deleted the wrong file (should have deleted second)');
                        chai_1.assert.isTrue(storageApi.hasFileEntry(newFileId), 'Cache cleanup removed entry for first kept file');
                        chai_1.assert.isTrue(storageApi.hasFileEntry(newFileId2), 'Cache cleanup removed entry for second kept file');
                        chai_1.assert.isFalse(storageApi.hasFileEntry(oldFileId), 'Cache cleanup did not remove storage entry for first deleted file');
                        chai_1.assert.isFalse(storageApi.hasFileEntry(oldFileId2), 'Cache cleanup did not remove storage entry for second deleted file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should clean too large cache', function () {
                    var smallFileId = 'small.mp4';
                    var largeFileId = 'large.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    helper.addFile(smallFileId, 1234, 1); // small file, should be kept
                    helper.addFile(largeFileId, 123456789, 2); // large file over 50 megabytes, should be deleted
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                small: {
                                    fullyDownloaded: true,
                                    size: 1234,
                                    totalSize: 1234,
                                    extension: 'mp4'
                                },
                                large: {
                                    fullyDownloaded: true,
                                    size: 123456789,
                                    totalSize: 123456789,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], largeFileId, 'Cache cleanup deleted the wrong file');
                        chai_1.assert.isTrue(storageApi.hasFileEntry(smallFileId), 'Cache cleanup removed storage entry for kept file');
                        chai_1.assert.isFalse(storageApi.hasFileEntry(largeFileId), 'Cache cleanup did not remove storage entry for deleted file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should not clean empty cache', function () {
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 0, 'Cache cleanup should have deleted nothing when cache is empty');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should clean files with no bookkeeping', function () {
                    var fileId = 'test';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    cacheApi.addFile(fileId, 12345, new Date().getTime());
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should clean bookkeeping if cache is empty', function () {
                    var storageSpy = sinon.stub(storageApi, 'delete').returns(Promise.resolve());
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                foo: {
                                    fullyDownloaded: true,
                                    size: 12345,
                                    totalSize: 12345,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 1, 'Cache cleanup did not invoke storage delete once');
                        chai_1.assert.equal(storageSpy.getCall(0).args[0], Storage_1.StorageType.PRIVATE, 'Cache cleanup invoked wrong storage type');
                        chai_1.assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup invoked wrong storage hierarchy');
                        chai_1.assert.equal(cacheSpy.callCount, 0, 'Cache cleanup invoked Cache.delete with empty cache');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should clean partially downloaded files', function () {
                    var fileId = 'test2.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    // add one partially downloaded file
                    helper.addFile(fileId, 1000000, 1);
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                test2: {
                                    fullyDownloaded: false,
                                    size: 12345,
                                    totalSize: 12345,
                                    extension: 'mp4'
                                }
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
                        chai_1.assert.isFalse(storageApi.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should delete campaign with files in cache but without required files in cache', function () {
                    var campaignId = '123456';
                    var storageSpy = sinon.spy(storageApi, 'delete');
                    helper.addFile('test1.mp4', 123456, 2);
                    helper.addFile('test2.mp4', 123456, 2);
                    storageApi.setStorageContents({
                        cache: {
                            files: {},
                            campaigns: {
                                '123456': {
                                    test3: {
                                        extension: 'mp4'
                                    },
                                    test4: {
                                        extension: 'mp4'
                                    }
                                }
                            }
                        }
                    });
                    chai_1.assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
                        chai_1.assert.equal(storageSpy.getCall(0).args[1], 'cache.campaigns.' + campaignId, 'Cache cleanup deleted a wrong campaign');
                        chai_1.assert.isFalse(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should delete campaign without files on disk and without required files in cache', function () {
                    var campaignId = '123456';
                    var storageSpy = sinon.spy(storageApi, 'delete');
                    storageApi.setStorageContents({
                        cache: {
                            files: {},
                            campaigns: {
                                '123456': {
                                    test1: {
                                        extension: 'mp4'
                                    },
                                    test2: {
                                        extension: 'mp4'
                                    }
                                }
                            }
                        }
                    });
                    chai_1.assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
                        chai_1.assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup should have deleted the whole cache entry');
                        chai_1.assert.isFalse(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should keep campaign with files still in cache', function () {
                    var campaignId = '123456';
                    var storageSpy = sinon.spy(storageApi, 'delete');
                    helper.addFile('test1.mp4', 123456, 2);
                    helper.addFile('test2.mp4', 123456, 2);
                    storageApi.setStorageContents({
                        cache: {
                            files: {
                                test1: {
                                    fullyDownloaded: true,
                                    size: 123456,
                                    totalSize: 123456,
                                    extension: 'mp4'
                                },
                                test2: {
                                    fullyDownloaded: true,
                                    size: 123456,
                                    totalSize: 123456,
                                    extension: 'mp4'
                                }
                            },
                            campaigns: {
                                '123456': {
                                    test1: {
                                        extension: 'mp4'
                                    },
                                    test2: {
                                        extension: 'mp4'
                                    }
                                }
                            }
                        }
                    });
                    chai_1.assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 0, 'Cache cleanup shouldn\'t have deleted campaign');
                        chai_1.assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did remove storage entry for campaign');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should delete the whole cache bookkeeping when there is files on disk but format is old', function () {
                    var storageSpy = sinon.spy(storageApi, 'delete');
                    var cacheSpy = sinon.spy(cacheApi, 'deleteFile');
                    helper.addFile('test1.mp4', 123456, 2);
                    helper.addFile('test2.mp4', 123456, 2);
                    storageApi.setStorageContents({
                        cache: {
                            test1: {
                                mp4: '{fullyDownloaded: true}'
                            },
                            test2: {
                                mp4: '{fullyDownloaded: true}'
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 2, 'Should have called storage delete once');
                        chai_1.assert.equal(storageSpy.getCall(0).args[1], 'cache.test1', 'Cache cleanup should have deleted the first file entry');
                        chai_1.assert.equal(storageSpy.getCall(1).args[1], 'cache.test2', 'Cache cleanup should have deleted the second file entry');
                        chai_1.assert.equal(cacheSpy.callCount, 2, 'Should have deleted two files from cache');
                        chai_1.assert.equal(cacheSpy.getCall(0).args[0], 'test1.mp4', 'Fist file deleted should be \'test1\'');
                        chai_1.assert.equal(cacheSpy.getCall(1).args[0], 'test2.mp4', 'Fist file deleted should be \'test2\'');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
                it('should delete the whole cache bookkeeping when there is no files on disk and format is old', function () {
                    var storageSpy = sinon.spy(storageApi, 'delete');
                    storageApi.setStorageContents({
                        cache: {
                            test1: {
                                mp4: '{fullyDownloaded: true}'
                            },
                            test2: {
                                mp4: '{fullyDownloaded: true}'
                            }
                        }
                    });
                    return cacheBookkeeping.cleanCache().then(function () {
                        chai_1.assert.equal(storageSpy.callCount, 2, 'Should have called storage delete once');
                        chai_1.assert.equal(storageSpy.getCall(0).args[1], 'cache.test1', 'Cache cleanup should have deleted the first file entry');
                        chai_1.assert.equal(storageSpy.getCall(1).args[1], 'cache.test2', 'Cache cleanup should have deleted the second file entry');
                        chai_1.assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVDbGVhblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDYWNoZUNsZWFuVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBZ0JBO2dCQUEyQix3Q0FBUTtnQkFHL0Isc0JBQVksWUFBMEI7b0JBQXRDLFlBQ0ksa0JBQU0sWUFBWSxDQUFDLFNBR3RCO29CQURHLEtBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDOztnQkFDckIsQ0FBQztnQkFFTSwrQkFBUSxHQUFmO29CQUNJLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBRU0saUNBQVUsR0FBakIsVUFBa0IsTUFBYztvQkFDNUIsS0FBZSxVQUFXLEVBQVgsS0FBQSxJQUFJLENBQUMsTUFBTSxFQUFYLGNBQVcsRUFBWCxJQUFXLEVBQUU7d0JBQXhCLElBQU0sQ0FBQyxTQUFBO3dCQUNQLElBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxNQUFNLEVBQUU7NEJBQ2hCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO3lCQUM1QjtxQkFDSjtvQkFFRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsa0JBQVUsQ0FBQyxrQkFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pFLENBQUM7Z0JBRU0sOEJBQU8sR0FBZCxVQUFlLEVBQVUsRUFBRSxJQUFZLEVBQUUsS0FBYTtvQkFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7d0JBQ2IsRUFBRSxFQUFFLEVBQUU7d0JBQ04sS0FBSyxFQUFFLElBQUk7d0JBQ1gsSUFBSSxFQUFFLElBQUk7d0JBQ1YsS0FBSyxFQUFFLEtBQUs7cUJBQ2YsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQ0wsbUJBQUM7WUFBRCxDQUFDLEFBL0JELENBQTJCLGdCQUFRLEdBK0Js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