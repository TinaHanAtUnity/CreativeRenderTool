System.register(["tslib", "mocha", "chai", "sinon", "Utilities/Cache", "Native/Api/Cache", "Native/Api/Storage", "Native/NativeBridge", "Managers/WakeUpManager", "Utilities/Request", "../TestHelpers/TestFixtures", "Managers/FocusManager", "Utilities/FileId", "Utilities/CacheBookkeeping", "Utilities/FileInfo", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, Cache_1, Cache_2, Storage_1, NativeBridge_1, WakeUpManager_1, Request_1, TestFixtures_1, FocusManager_1, FileId_1, CacheBookkeeping_1, FileInfo_1, ProgrammaticTrackingService_1, TestCacheApi, TestStorageApi;
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
            function (Cache_2_1) {
                Cache_2 = Cache_2_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (FileId_1_1) {
                FileId_1 = FileId_1_1;
            },
            function (CacheBookkeeping_1_1) {
                CacheBookkeeping_1 = CacheBookkeeping_1_1;
            },
            function (FileInfo_1_1) {
                FileInfo_1 = FileInfo_1_1;
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
                    _this._filePrefix = '/test/cache/dir/UnityAdsCache-';
                    _this._internet = true;
                    _this._files = {};
                    return _this;
                }
                TestCacheApi.prototype.download = function (url, fileId, headers, append) {
                    var _this = this;
                    var byteCount = 12345;
                    var duration = 6789;
                    var responseCode = 200;
                    if (this._currentFile !== undefined) {
                        return Promise.reject(Cache_2.CacheError[Cache_2.CacheError.FILE_ALREADY_CACHING]);
                    }
                    this.addFile(fileId, 123, 123);
                    if (this._internet) {
                        this._currentFile = url;
                        setTimeout(function () {
                            delete _this._currentFile;
                            _this._nativeBridge.handleEvent(['CACHE', Cache_2.CacheEvent[Cache_2.CacheEvent.DOWNLOAD_END], url, byteCount, byteCount, duration, responseCode, []]);
                        }, 1);
                        return Promise.resolve(void (0));
                    }
                    else {
                        return Promise.reject(Cache_2.CacheError[Cache_2.CacheError.NO_INTERNET]);
                    }
                };
                TestCacheApi.prototype.isCaching = function () {
                    return Promise.resolve(this._currentFile !== undefined);
                };
                TestCacheApi.prototype.getFilePath = function (fileId) {
                    if (fileId in this._files) {
                        return Promise.resolve(this._filePrefix + fileId);
                    }
                    return Promise.reject(new Error(Cache_2.CacheError[Cache_2.CacheError.FILE_NOT_FOUND]));
                };
                TestCacheApi.prototype.getFiles = function () {
                    var files = [];
                    for (var key in this._files) {
                        if (this._files.hasOwnProperty(key)) {
                            files.push(this._files[key]);
                        }
                    }
                    return Promise.resolve(files);
                };
                TestCacheApi.prototype.getFileInfo = function (fileId) {
                    if (fileId in this._files) {
                        return Promise.resolve(this._files[fileId]);
                    }
                    return Promise.reject(new Error(Cache_2.CacheError[Cache_2.CacheError.FILE_NOT_FOUND]));
                };
                TestCacheApi.prototype.getHash = function (value) {
                    return Promise.resolve(this.getHashDirect(value));
                };
                TestCacheApi.prototype.getHashDirect = function (value) {
                    var hash = 0;
                    if (!value.length) {
                        return hash.toString();
                    }
                    for (var i = 0; i < value.length; i++) {
                        var char = value.charCodeAt(i);
                        hash = ((hash << 5) - hash) + char;
                        hash = hash & hash;
                    }
                    return hash.toString();
                };
                TestCacheApi.prototype.deleteFile = function (fileId) {
                    return Promise.resolve(void (0));
                };
                TestCacheApi.prototype.setInternet = function (internet) {
                    this._internet = internet;
                };
                TestCacheApi.prototype.addFile = function (id, mtime, size) {
                    var fileInfo = { id: id, mtime: mtime, size: size, found: true };
                    this._files[id] = fileInfo;
                };
                TestCacheApi.prototype.getExtension = function (url) {
                    var splittedUrl = url.split('.');
                    var extension = '';
                    if (splittedUrl.length > 1) {
                        extension = splittedUrl[splittedUrl.length - 1];
                    }
                    return extension;
                };
                TestCacheApi.prototype.addPreviouslyDownloadedFile = function (url) {
                    this.addFile(this.getHashDirect(url) + '.' + this.getExtension(url), 123, 123);
                };
                TestCacheApi.prototype.getDownloadedFilesCount = function () {
                    var fileCount = 0;
                    for (var key in this._files) {
                        if (this._files.hasOwnProperty(key)) {
                            ++fileCount;
                        }
                    }
                    return fileCount;
                };
                return TestCacheApi;
            }(Cache_2.CacheApi));
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestStorageApi.prototype.write = function (type) {
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.get = function (type, key) {
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.set = function (type, key, value) {
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.delete = function (type, key) {
                    return Promise.resolve(void (0));
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            describe('CacheTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var cacheApi;
                var storageApi;
                var request;
                var cacheBookkeeping;
                var programmaticTrackingService;
                var cacheManager;
                var wakeUpManager;
                var isCachedStub;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
                    storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                    cacheManager = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService, { retries: 3, retryDelay: 1000 });
                    isCachedStub = sinon.stub(FileInfo_1.FileInfo, 'isCached').returns(Promise.resolve(false));
                });
                afterEach(function () {
                    isCachedStub.restore();
                });
                it('Get local file url for cached file', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    var testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';
                    cacheApi.addPreviouslyDownloadedFile(testUrl);
                    return FileId_1.FileId.getFileId(testUrl, nativeBridge).then(function (fileId) { return FileId_1.FileId.getFileUrl(fileId, nativeBridge); }).then(function (fileUrl) {
                        chai_1.assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
                    });
                });
                it('Cache one file with success', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    var testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';
                    var cacheSpy = sinon.spy(cacheApi, 'download');
                    return cacheManager.cache(testUrl, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function (_a) {
                        var fileId = _a[0], fileUrl = _a[1];
                        chai_1.assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
                        chai_1.assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
                        chai_1.assert.equal(testUrl, cacheSpy.getCall(0).args[0], 'Cache one file download request url does not match');
                        chai_1.assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
                    });
                });
                it('Cache three files with success', function () {
                    var testUrl1 = 'http://www.example.net/first.jpg';
                    var testUrl2 = 'http://www.example.net/second.jpg';
                    var testUrl3 = 'http://www.example.net/third.jpg';
                    var testFileUrl1 = 'file:///test/cache/dir/UnityAdsCache-1647395140.jpg';
                    var testFileUrl2 = 'file:///test/cache/dir/UnityAdsCache-158720486.jpg';
                    var testFileUrl3 = 'file:///test/cache/dir/UnityAdsCache-929022075.jpg';
                    var cacheSpy = sinon.spy(cacheApi, 'download');
                    return cacheManager.cache(testUrl1, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function (_a) {
                        var fileId = _a[0], fileUrl = _a[1];
                        chai_1.assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
                        chai_1.assert.equal(fileId, '1647395140.jpg', 'Cache three files first fileId does not match');
                        chai_1.assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
                    }).then(function () { return cacheManager.cache(testUrl2, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()); }).then(function (_a) {
                        var fileId = _a[0], fileUrl = _a[1];
                        chai_1.assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files second download request url does not match');
                        chai_1.assert.equal(fileId, '158720486.jpg', 'Cache three files second fileId does not match');
                        chai_1.assert.equal(testFileUrl2, fileUrl, 'Cache three files second local file url does not match');
                    }).then(function () { return cacheManager.cache(testUrl3, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()); }).then(function (_a) {
                        var fileId = _a[0], fileUrl = _a[1];
                        chai_1.assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files third download request url does not match');
                        chai_1.assert.equal(fileId, '929022075.jpg', 'Cache three files third fileId does not match');
                        chai_1.assert.equal(testFileUrl3, fileUrl, 'Cache three files third local file url does not match');
                    }).then(function () {
                        chai_1.assert.equal(3, cacheSpy.callCount, 'Cache three files did not send three download requests');
                    });
                });
                xit('Cache one file with network failure', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    var networkTriggered = false;
                    cacheApi.setInternet(false);
                    setTimeout(function () {
                        networkTriggered = true;
                        cacheApi.setInternet(true);
                        wakeUpManager.onNetworkConnected.trigger();
                    }, 10);
                    return cacheManager.cache(testUrl, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function (fileUrl) {
                        chai_1.assert(networkTriggered, 'Cache one file with network failure: network was not triggered');
                    });
                });
                xit('Cache one file with repeated network failures (expect to fail)', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    var networkTriggers = 0;
                    var triggerNetwork = function () {
                        networkTriggers++;
                        wakeUpManager.onNetworkConnected.trigger();
                    };
                    cacheApi.setInternet(false);
                    setTimeout(triggerNetwork, 150);
                    setTimeout(triggerNetwork, 200);
                    setTimeout(triggerNetwork, 350);
                    return cacheManager.cache(testUrl, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function () {
                        chai_1.assert.fail('Cache one file with repeated network failures: caching should not be successful with no internet');
                    }).catch(function (error) {
                        chai_1.assert.equal(networkTriggers, 3, 'Cache one file with repeated network failures: caching should have retried exactly three times');
                    });
                });
                xit('Stop caching', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    cacheApi.setInternet(false);
                    setTimeout(function () { return cacheManager.stop(); }, 150);
                    return cacheManager.cache(testUrl, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function () {
                        chai_1.assert.fail('Caching should fail when stopped');
                    }).catch(function (error) {
                        chai_1.assert.equal(error, Cache_1.CacheStatus.STOPPED, 'Cache status not STOPPED after caching was stopped');
                    });
                });
                it('Cache one already downloaded file', function () {
                    var testUrl = 'http://www.example.net/test.mp4';
                    var testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';
                    cacheApi.addPreviouslyDownloadedFile(testUrl);
                    return cacheManager.cache(testUrl, TestFixtures_1.TestFixtures.getCacheDiagnostics(), TestFixtures_1.TestFixtures.getCampaign()).then(function (_a) {
                        var fileId = _a[0], fileUrl = _a[1];
                        chai_1.assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
                        chai_1.assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiQ2FjaGVUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFpQkE7Z0JBQTJCLHdDQUFRO2dCQU8vQixzQkFBWSxZQUEwQjtvQkFBdEMsWUFDSSxrQkFBTSxZQUFZLENBQUMsU0FDdEI7b0JBUE8saUJBQVcsR0FBRyxnQ0FBZ0MsQ0FBQztvQkFDL0MsZUFBUyxHQUFZLElBQUksQ0FBQztvQkFDMUIsWUFBTSxHQUFpQyxFQUFFLENBQUM7O2dCQUtsRCxDQUFDO2dCQUVNLCtCQUFRLEdBQWYsVUFBZ0IsR0FBVyxFQUFFLE1BQWMsRUFBRSxPQUFnQyxFQUFFLE1BQWU7b0JBQTlGLGlCQXFCQztvQkFwQkcsSUFBTSxTQUFTLEdBQVcsS0FBSyxDQUFDO29CQUNoQyxJQUFNLFFBQVEsR0FBVyxJQUFJLENBQUM7b0JBQzlCLElBQU0sWUFBWSxHQUFXLEdBQUcsQ0FBQztvQkFFakMsSUFBRyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTt3QkFDaEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLGtCQUFVLENBQUMsa0JBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7cUJBQ3RFO29CQUVELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFFL0IsSUFBRyxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNmLElBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDO3dCQUN4QixVQUFVLENBQUM7NEJBQ1AsT0FBTyxLQUFJLENBQUMsWUFBWSxDQUFDOzRCQUN6QixLQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxrQkFBVSxDQUFDLGtCQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxFQUFFLFNBQVMs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