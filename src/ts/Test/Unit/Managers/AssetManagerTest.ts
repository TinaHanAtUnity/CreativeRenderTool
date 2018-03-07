import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { AssetManager } from 'Managers/AssetManager';
import { Cache, CacheStatus } from 'Utilities/Cache';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CacheMode } from 'Models/Configuration';
import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { CacheError, IFileInfo, CacheEvent, CacheApi } from 'Native/Api/Cache';
import { Request } from 'Utilities/Request';
import { HTML } from 'Models/Assets/HTML';
import { DeviceInfo } from 'Models/DeviceInfo';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Platform } from 'Constants/Platform';
import { FocusManager } from 'Managers/FocusManager';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';

class TestCacheApi extends CacheApi {

    private _filePrefix = '/test/cache/dir/UnityAdsCache-';
    private _internet: boolean = true;
    private _files: { [key: string]: IFileInfo } = {};
    private _currentFile: string;
    private _downloadDelay: number = 1;
    private _freeSpace = 123456789;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    public download(url: string, fileId: string): Promise<void> {
        const byteCount: number = 12345;
        const duration: number = 6789;
        const responseCode: number = 200;

        if(this._currentFile !== undefined) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_CACHING]);
        }

        this.addFile(fileId, 123, 123);

        if(this._internet) {
            this._currentFile = url;
            setTimeout(() => {
                delete this._currentFile;
                this._nativeBridge.handleEvent(['CACHE', CacheEvent[CacheEvent.DOWNLOAD_END], url, byteCount, byteCount, duration, responseCode, []]);
            }, this._downloadDelay);
            return Promise.resolve(void(0));
        } else {
            return Promise.reject(CacheError[CacheError.NO_INTERNET]);
        }
    }

    public isCaching(): Promise<boolean> {
        return Promise.resolve(this._currentFile !== undefined);
    }

    public getFilePath(fileId: string): Promise<string> {
        if(fileId in this._files) {
            return Promise.resolve(this._filePrefix + fileId);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public getFiles(): Promise<IFileInfo[]> {
        const files: IFileInfo[] = [];
        for(const key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                files.push(this._files[key]);
            }
        }
        return Promise.resolve(files);
    }

    public getFileInfo(fileId: string): Promise<IFileInfo> {
        if(fileId in this._files) {
            return Promise.resolve(this._files[fileId]);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public getHash(value: string): Promise<string> {
        return Promise.resolve(this.getHashDirect(value));
    }

    public getFreeSpace(): Promise<number> {
        return Promise.resolve(this._freeSpace);
    }

    public getHashDirect(value: string): string {
        let hash = 0;
        if(!value.length) {
            return hash.toString();
        }
        for(let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    public deleteFile(fileId: string): Promise<void> {
        return Promise.resolve(void(0));
    }

    public setInternet(internet: boolean): void {
        this._internet = internet;
    }

    public addFile(id: string, mtime: number, size: number): void {
        const fileInfo: IFileInfo = {id: id, mtime: mtime, size: size, found: true};
        this._files[id] = fileInfo;
    }

    public setDownloadDelay(delay: number) {
        this._downloadDelay = delay;
    }

    public setFreeSpace(freeSpace: number) {
        this._freeSpace = freeSpace;
    }
}

class TestStorageApi extends StorageApi {
    public write(type: StorageType): Promise<void> {
        return Promise.resolve(void(0));
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        return Promise.resolve(<any>void(0));
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return Promise.resolve(void(0));
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return Promise.resolve(void(0));
    }
}

class TestCampaign extends Campaign {

    private _required: Asset[];
    private _optional: Asset[];

    constructor(required: Asset[], optional: Asset[]) {
        super('TestCampaign', Campaign.Schema, <ICampaign>{});
        this._required = required;
        this._optional = optional;
    }

    public getRequiredAssets() {
        return this._required;
    }

    public getOptionalAssets() {
        return this._optional;
    }

    public isConnectionNeeded() {
        return false;
    }
}

describe('AssetManagerTest', () => {

    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let cacheApi: TestCacheApi;
    let storageApi: TestStorageApi;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let deviceInfo: DeviceInfo;
    let focusManager: FocusManager;
    let cacheBookkeeping: CacheBookkeeping;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        cacheBookkeeping = new CacheBookkeeping(nativeBridge);
    });

    it('should not cache anything when cache mode is disabled', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        const campaign = new TestCampaign([], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
        });
    });

    it('should cache required assets', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(spy.called, 'Cache was not called for required asset');
            assert(asset.isCached(), 'Asset was not cached');
        });
    });

    it('should cache optional assets', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            return new Promise((resolve, reject) => { setTimeout(resolve, 300); }).then(() => {
                assert(spy.called, 'Cache was not called for optional asset');
                assert(asset.isCached(), 'Asset was not cached');
            });
        });
    });

    it('should not wait for optional assets when cache mode is allowed', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should swallow optional errors when cache mode is allowed', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, {retries: 0, retryDelay: 1});
        const assetManager = new AssetManager(cache, CacheMode.ALLOWED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([], [asset]);
        cacheApi.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should not swallow errors when cache mode is forced', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, {retries: 0, retryDelay: 1});
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        cacheApi.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            throw new Error('Should not resolve');
        }).catch(error => {
            assert.equal(error, CacheStatus.FAILED);
        });
    });

    it('should cache two campaigns', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const asset2 = new HTML('https:/www.google.fi/2', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const campaign2 = new TestCampaign([asset2], []);
        return Promise.all([assetManager.setup(campaign), assetManager.setup(campaign2)]).then(() => {
            assert(asset.isCached(), 'First asset was not cached');
            assert(asset2.isCached(), 'Second asset was not cached');
        });
    });

    it('should stop caching', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const promise = assetManager.setup(campaign);
        assetManager.stopCaching();
        return promise.then(() => {
            throw new Error('Should not resolve');
        }).catch(error => {
            assert.isFalse(asset.isCached(), 'Asset was cached when caching was stopped');
        });
    });

    it('should act like cache mode disabled when there is less than 20 MB of free space', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        cacheApi.setFreeSpace(0);
        return assetManager.checkFreeSpace().then(() => {
            return assetManager.setup(campaign);
        }).then(() => {
            assert(!spy.called, 'Cache was called when there is less than 20 MB of free space');
            assert(!asset.isCached(), 'Asset was cached when there is less than 20 MB of free space');
        });
    });

    it('should cache in a normal way when there is more than 20 MB of free space', () => {
        const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
        const assetManager = new AssetManager(cache, CacheMode.FORCED, deviceInfo, cacheBookkeeping);
        const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        cacheApi.setFreeSpace(123456789);
        return assetManager.checkFreeSpace().then(() => {
            return assetManager.setup(campaign);
        }).then(() => {
            assert(spy.called, 'Cache was not called with forced caching and more than 20 MB of free space');
            assert(asset.isCached(), 'Asset was not cached with forced caching and more than 20 MB of free space');
        });
    });

    describe('with cache mode adaptive', () => {
        beforeEach(() => {
            cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        });

        it('should handle required assets without fast connection', () => {
            const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
            const assetManager = new AssetManager(cache, CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping);
            const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
            const campaign = new TestCampaign([asset], []);
            const spy = sinon.spy(cache, 'cache');
            return assetManager.setup(campaign).then(() => {
                assert(spy.called, 'Cache was not called for required asset');
                assert(asset.isCached(), 'Asset was not cached');
            });
        });

        it('should handle optional assets without fast connection', () => {
            const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
            const assetManager = new AssetManager(cache, CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping);
            const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
            const campaign = new TestCampaign([], [asset]);
            const spy = sinon.spy(cache, 'cache');
            return assetManager.setup(campaign).then(() => {
                return new Promise((resolve, reject) => { setTimeout(resolve, 300); }).then(() => {
                    assert(spy.called, 'Cache was not called for optional asset');
                    assert(asset.isCached(), 'Asset was not cached');
                });
            });
        });

        it('should not swallow errors without fast connection', () => {
            const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, {retries: 0, retryDelay: 1});
            const assetManager = new AssetManager(cache, CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping);
            const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
            const campaign = new TestCampaign([asset], []);
            cacheApi.setInternet(false);
            return assetManager.setup(campaign).then(() => {
                throw new Error('Should not resolve');
            }).catch(error => {
                assert.equal(error, CacheStatus.FAILED);
            });
        });

        it('should resolve when fast connection is detected', () => {
            const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
            const assetManager = new AssetManager(cache, CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping);
            const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
            const campaign = new TestCampaign([asset], []);
            const spy = sinon.spy(cache, 'cache');
            cacheApi.setDownloadDelay(500);

            let fastConnectionDetected: boolean = false;

            const promise = assetManager.setup(campaign).then(() => {
                assert(spy.called, 'Cache was not called for required asset');
                assert(fastConnectionDetected, 'Promise resolved before fast connection was detected');
                assert.isFalse(asset.isCached(), 'Promise resolved only after asset was fully cached');
            });

            setTimeout(() => {
                fastConnectionDetected = true;
                cache.onFastConnectionDetected.trigger();
            }, 200);

            return promise;
        });

        it('should immediately resolve if fast connection has been detected before', () => {
            const cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping);
            const assetManager = new AssetManager(cache, CacheMode.ADAPTIVE, deviceInfo, cacheBookkeeping);
            const asset = new HTML('https://www.google.fi', TestFixtures.getSession());
            const campaign = new TestCampaign([asset], []);
            cacheApi.setDownloadDelay(500);
            cache.onFastConnectionDetected.trigger();

            return assetManager.setup(campaign).then(() => {
                assert.isFalse(asset.isCached(), 'Promise resolved only after asset was fully cached');
            });
        });
    });
});
