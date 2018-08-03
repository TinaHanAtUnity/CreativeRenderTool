System.register(["tslib", "mocha", "chai", "sinon", "Managers/AssetManager", "Utilities/Cache", "Native/NativeBridge", "Managers/WakeUpManager", "Models/Configuration", "Models/Campaign", "Native/Api/Storage", "Native/Api/Cache", "Utilities/Request", "Models/Assets/HTML", "Test/Unit/TestHelpers/TestFixtures", "Managers/FocusManager", "Utilities/CacheBookkeeping", "ProgrammaticTrackingService/ProgrammaticTrackingService"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, AssetManager_1, Cache_1, NativeBridge_1, WakeUpManager_1, Configuration_1, Campaign_1, Storage_1, Cache_2, Request_1, HTML_1, TestFixtures_1, FocusManager_1, CacheBookkeeping_1, ProgrammaticTrackingService_1, TestCacheApi, TestStorageApi, TestCampaign;
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
            function (AssetManager_1_1) {
                AssetManager_1 = AssetManager_1_1;
            },
            function (Cache_1_1) {
                Cache_1 = Cache_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (Campaign_1_1) {
                Campaign_1 = Campaign_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Cache_2_1) {
                Cache_2 = Cache_2_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (HTML_1_1) {
                HTML_1 = HTML_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
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
                    _this._filePrefix = '/test/cache/dir/UnityAdsCache-';
                    _this._internet = true;
                    _this._files = {};
                    _this._downloadDelay = 1;
                    _this._freeSpace = 123456789;
                    return _this;
                }
                TestCacheApi.prototype.download = function (url, fileId) {
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
                        }, this._downloadDelay);
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
                TestCacheApi.prototype.getFreeSpace = function () {
                    return Promise.resolve(this._freeSpace);
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
                TestCacheApi.prototype.setDownloadDelay = function (delay) {
                    this._downloadDelay = delay;
                };
                TestCacheApi.prototype.setFreeSpace = function (freeSpace) {
                    this._freeSpace = freeSpace;
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
            TestCampaign = /** @class */ (function (_super) {
                tslib_1.__extends(TestCampaign, _super);
                function TestCampaign(required, optional) {
                    var _this = _super.call(this, 'TestCampaign', Campaign_1.Campaign.Schema, {}) || this;
                    _this._required = required;
                    _this._optional = optional;
                    return _this;
                }
                TestCampaign.prototype.getRequiredAssets = function () {
                    return this._required;
                };
                TestCampaign.prototype.getOptionalAssets = function () {
                    return this._optional;
                };
                TestCampaign.prototype.isConnectionNeeded = function () {
                    return false;
                };
                return TestCampaign;
            }(Campaign_1.Campaign));
            describe('AssetManagerTest', function () {
                var handleInvocation;
                var handleCallback;
                var nativeBridge;
                var cacheApi;
                var storageApi;
                var wakeUpManager;
                var request;
                var deviceInfo;
                var focusManager;
                var cacheBookkeeping;
                var programmaticTrackingService;
                beforeEach(function () {
                    handleInvocation = sinon.spy();
                    handleCallback = sinon.spy();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
                    storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    cacheBookkeeping = new CacheBookkeeping_1.CacheBookkeeping(nativeBridge);
                    programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService_1.ProgrammaticTrackingService);
                });
                it('should not cache anything when cache mode is disabled', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var campaign = new TestCampaign([], []);
                    var spy = sinon.spy(cache, 'cache');
                    return assetManager.setup(campaign).then(function () {
                        chai_1.assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
                    });
                });
                it('should cache required assets', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    var spy = sinon.spy(cache, 'cache');
                    return assetManager.setup(campaign).then(function () {
                        chai_1.assert(spy.called, 'Cache was not called for required asset');
                        chai_1.assert(asset.isCached(), 'Asset was not cached');
                    });
                });
                it('should cache optional assets', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([], [asset]);
                    var spy = sinon.spy(cache, 'cache');
                    return assetManager.setup(campaign).then(function () {
                        return new Promise(function (resolve, reject) { setTimeout(resolve, 300); }).then(function () {
                            chai_1.assert(spy.called, 'Cache was not called for optional asset');
                            chai_1.assert(asset.isCached(), 'Asset was not cached');
                        });
                    });
                });
                it('should not wait for optional assets when cache mode is allowed', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ALLOWED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([], [asset]);
                    return assetManager.setup(campaign).then(function () {
                        chai_1.assert(!asset.isCached(), 'Asset was cached');
                    });
                });
                it('should swallow optional errors when cache mode is allowed', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService, { retries: 0, retryDelay: 1 });
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ALLOWED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([], [asset]);
                    cacheApi.setInternet(false);
                    return assetManager.setup(campaign).then(function () {
                        chai_1.assert(!asset.isCached(), 'Asset was cached');
                    });
                });
                it('should not swallow errors when cache mode is forced', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService, { retries: 0, retryDelay: 1 });
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    cacheApi.setInternet(false);
                    return assetManager.setup(campaign).then(function () {
                        throw new Error('Should not resolve');
                    }).catch(function (error) {
                        chai_1.assert.equal(error, Cache_1.CacheStatus.FAILED);
                    });
                });
                it('should cache two campaigns', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var asset2 = new HTML_1.HTML('https:/www.google.fi/2', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    var campaign2 = new TestCampaign([asset2], []);
                    return Promise.all([assetManager.setup(campaign), assetManager.setup(campaign2)]).then(function () {
                        chai_1.assert(asset.isCached(), 'First asset was not cached');
                        chai_1.assert(asset2.isCached(), 'Second asset was not cached');
                    });
                });
                it('should stop caching', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    var promise = assetManager.setup(campaign);
                    assetManager.stopCaching();
                    return promise.then(function () {
                        throw new Error('Should not resolve');
                    }).catch(function (error) {
                        chai_1.assert.isFalse(asset.isCached(), 'Asset was cached when caching was stopped');
                    });
                });
                it('should act like cache mode disabled when there is less than 20 MB of free space', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    var spy = sinon.spy(cache, 'cache');
                    cacheApi.setFreeSpace(0);
                    return assetManager.checkFreeSpace().then(function () {
                        return assetManager.setup(campaign);
                    }).then(function () {
                        chai_1.assert(!spy.called, 'Cache was called when there is less than 20 MB of free space');
                        chai_1.assert(!asset.isCached(), 'Asset was cached when there is less than 20 MB of free space');
                    });
                });
                it('should cache in a normal way when there is more than 20 MB of free space', function () {
                    var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                    var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.FORCED, deviceInfo, cacheBookkeeping, nativeBridge);
                    var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                    var campaign = new TestCampaign([asset], []);
                    var spy = sinon.spy(cache, 'cache');
                    cacheApi.setFreeSpace(123456789);
                    return assetManager.checkFreeSpace().then(function () {
                        return assetManager.setup(campaign);
                    }).then(function () {
                        chai_1.assert(spy.called, 'Cache was not called with forced caching and more than 20 MB of free space');
                        chai_1.assert(asset.isCached(), 'Asset was not cached with forced caching and more than 20 MB of free space');
                    });
                });
                describe('with cache mode adaptive', function () {
                    beforeEach(function () {
                        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
                    });
                    it('should handle required assets without fast connection', function () {
                        var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping, nativeBridge);
                        var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                        var campaign = new TestCampaign([asset], []);
                        var spy = sinon.spy(cache, 'cache');
                        return assetManager.setup(campaign).then(function () {
                            chai_1.assert(spy.called, 'Cache was not called for required asset');
                            chai_1.assert(asset.isCached(), 'Asset was not cached');
                        });
                    });
                    it('should handle optional assets without fast connection', function () {
                        var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping, nativeBridge);
                        var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                        var campaign = new TestCampaign([], [asset]);
                        var spy = sinon.spy(cache, 'cache');
                        return assetManager.setup(campaign).then(function () {
                            return new Promise(function (resolve, reject) { setTimeout(resolve, 300); }).then(function () {
                                chai_1.assert(spy.called, 'Cache was not called for optional asset');
                                chai_1.assert(asset.isCached(), 'Asset was not cached');
                            });
                        });
                    });
                    it('should not swallow errors without fast connection', function () {
                        var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService, { retries: 0, retryDelay: 1 });
                        var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping, nativeBridge);
                        var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                        var campaign = new TestCampaign([asset], []);
                        cacheApi.setInternet(false);
                        return assetManager.setup(campaign).then(function () {
                            throw new Error('Should not resolve');
                        }).catch(function (error) {
                            chai_1.assert.equal(error, Cache_1.CacheStatus.FAILED);
                        });
                    });
                    it('should resolve when fast connection is detected', function () {
                        var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping, nativeBridge);
                        var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                        var campaign = new TestCampaign([asset], []);
                        var spy = sinon.spy(cache, 'cache');
                        cacheApi.setDownloadDelay(500);
                        var fastConnectionDetected = false;
                        var promise = assetManager.setup(campaign).then(function () {
                            chai_1.assert(spy.called, 'Cache was not called for required asset');
                            chai_1.assert(fastConnectionDetected, 'Promise resolved before fast connection was detected');
                            chai_1.assert.isFalse(asset.isCached(), 'Promise resolved only after asset was fully cached');
                        });
                        setTimeout(function () {
                            fastConnectionDetected = true;
                            cache.onFastConnectionDetected.trigger();
                        }, 200);
                        return promise;
                    });
                    it('should immediately resolve if fast connection has been detected before', function () {
                        var cache = new Cache_1.Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
                        var assetManager = new AssetManager_1.AssetManager(cache, Configuration_1.CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping, nativeBridge);
                        var asset = new HTML_1.HTML('https://www.google.fi', TestFixtures_1.TestFixtures.getSession());
                        var campaign = new TestCampaign([asset], []);
                        cacheApi.setDownloadDelay(500);
                        cache.onFastConnectionDetected.trigger();
                        return assetManager.setup(campaign).then(function () {
                            chai_1.assert.isFalse(asset.isCached(), 'Promise resolved only after asset was fully cached');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXNzZXRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFzc2V0TWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQXFCQTtnQkFBMkIsd0NBQVE7Z0JBUy9CLHNCQUFZLFlBQTBCO29CQUF0QyxZQUNJLGtCQUFNLFlBQVksQ0FBQyxTQUN0QjtvQkFUTyxpQkFBVyxHQUFHLGdDQUFnQyxDQUFDO29CQUMvQyxlQUFTLEdBQVksSUFBSSxDQUFDO29CQUMxQixZQUFNLEdBQWlDLEVBQUUsQ0FBQztvQkFFMUMsb0JBQWMsR0FBVyxDQUFDLENBQUM7b0JBQzNCLGdCQUFVLEdBQUcsU0FBUyxDQUFDOztnQkFJL0IsQ0FBQztnQkFFTSwrQkFBUSxHQUFmLFVBQWdCLEdBQVcsRUFBRSxNQUFjO29CQUEzQyxpQkFxQkM7b0JBcEJHLElBQU0sU0FBUyxHQUFXLEtBQUssQ0FBQztvQkFDaEMsSUFBTSxRQUFRLEdBQVcsSUFBSSxDQUFDO29CQUM5QixJQUFNLFlBQVksR0FBVyxHQUFHLENBQUM7b0JBRWpDLElBQUcsSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7d0JBQ2hDLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBVSxDQUFDLGtCQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO3FCQUN0RTtvQkFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRS9CLElBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDZixJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQzt3QkFDeEIsVUFBVSxDQUFDOzRCQUNQLE9BQU8sS0FBSSxDQUFDLFlBQVksQ0FBQzs0QkFDekIsS0FBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLEVB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