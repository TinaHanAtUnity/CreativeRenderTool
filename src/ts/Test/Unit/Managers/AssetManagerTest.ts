import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { AssetManager } from 'Managers/AssetManager';
import { Cache, CacheStatus } from 'Utilities/Cache';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CacheMode } from 'Models/Configuration';
import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { StorageType, StorageApi } from 'Native/Api/Storage';
import { CacheError, IFileInfo, CacheEvent, CacheApi } from 'Native/Api/Cache';

class TestCacheApi extends CacheApi {

    private _filePrefix = '/test/cache/dir/UnityAdsCache-';
    private _internet: boolean = true;
    private _files: { [key: string]: IFileInfo } = {};
    private _currentFile: string;

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
            }, 1);
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
        super('campaignId', 'gamerId', 10);
        this._required = required;
        this._optional = optional;
    }

    public getRequiredAssets() {
        return this._required;
    }

    public getOptionalAssets() {
        return this._optional;
    }
}

describe('AssetManagerTest', () => {

    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let cacheApi: TestCacheApi;
    let storageApi: TestStorageApi;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
    });

    it('should not cache anything when cache mode is disabled', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.DISABLED);
        const campaign = new TestCampaign([], []);
        const spy = sinon.spy(cache, 'cache');
        assetManager.setup(campaign);
        assert(!spy.calledOnce, 'Cache was called when cache mode was disabled');
    });

    it('should cache required assets', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.FORCED);
        const asset = new Asset('https://www.google.fi');
        const campaign = new TestCampaign([asset], []);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(spy.called, 'Cache was not called for required asset');
            assert(asset.isCached(), 'Asset was not cached');
        });
    });

    it('should cache optional assets', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.FORCED);
        const asset = new Asset('https://www.google.fi');
        const campaign = new TestCampaign([], [asset]);
        const spy = sinon.spy(cache, 'cache');
        return assetManager.setup(campaign).then(() => {
            assert(spy.called, 'Cache was not called for optional asset');
            assert(asset.isCached(), 'Asset was not cached');
        });
    });

    it('should not wait for optional assets when cache mode is allowed', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.ALLOWED);
        const asset = new Asset('https://www.google.fi');
        const campaign = new TestCampaign([], [asset]);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should swallow optional errors when cache mode is allowed', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.ALLOWED);
        const asset = new Asset('https://www.google.fi');
        const campaign = new TestCampaign([], [asset]);
        cacheApi.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            assert(!asset.isCached(), 'Asset was cached');
        });
    });

    it('should not swallow errors when cache mode is forced', () => {
        const cache = new Cache(nativeBridge, new WakeUpManager(nativeBridge));
        const assetManager = new AssetManager(cache, CacheMode.FORCED);
        const asset = new Asset('https://www.google.fi');
        const campaign = new TestCampaign([asset], []);
        cacheApi.setInternet(false);
        return assetManager.setup(campaign).then(() => {
            throw new Error('Should not resolve');
        }).catch(error => {
            assert.equal(error, CacheStatus.FAILED);
        });
    });

});
