import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Cache, CacheStatus } from 'Utilities/Cache';
import { IFileInfo, CacheApi, CacheEvent, CacheError } from 'Native/Api/Cache';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';

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

    public getExtension(url: string): string {
        const splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return extension;
    }

    public addPreviouslyDownloadedFile(url: string) {
        this.addFile(this.getHashDirect(url) + '.' + this.getExtension(url), 123, 123);
    }

    public getDownloadedFilesCount(): number {
        let fileCount = 0;
        for(const key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                ++fileCount;
            }
        }
        return fileCount;
    }
}

class TestStorageApi extends StorageApi {
    public write(type: StorageType): Promise<void> {
        return Promise.resolve(void(0));
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        return Promise.resolve();
    }

    public set<T>(type: StorageType, key: string, value: T): Promise<void> {
        return Promise.resolve(void(0));
    }

    public delete(type: StorageType, key: string): Promise<void> {
        return Promise.resolve(void(0));
    }
}

describe('CacheTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let cacheApi: TestCacheApi;
    let storageApi: TestStorageApi;
    let cacheManager: Cache;
    let wakeUpManager: WakeUpManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge);
        cacheManager = new Cache(nativeBridge, wakeUpManager);
        sinon.stub(cacheManager, 'isCached').returns(Promise.resolve(false));
    });

    it('Get local file url for cached file', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.getFileId(testUrl).then(fileId => cacheManager.getFileUrl(fileId)).then(fileUrl => {
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache one file with success', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        const cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl).then(fileUrl => {
            assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
            assert.equal(testUrl, cacheSpy.getCall(0).args[0], 'Cache one file download request url does not match');
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache three files with success', () => {
        const testUrl1: string = 'http://www.example.net/first.jpg';
        const testUrl2: string = 'http://www.example.net/second.jpg';
        const testUrl3: string = 'http://www.example.net/third.jpg';
        const testFileUrl1: string = 'file:///test/cache/dir/UnityAdsCache-1647395140.jpg';
        const testFileUrl2: string = 'file:///test/cache/dir/UnityAdsCache-158720486.jpg';
        const testFileUrl3: string = 'file:///test/cache/dir/UnityAdsCache-929022075.jpg';

        const cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl1).then(fileUrl => {
            assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
            assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
        }).then(() => cacheManager.cache(testUrl2)).then(fileUrl => {
            assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files second download request url does not match');
            assert.equal(testFileUrl2, fileUrl, 'Cache three files second local file url does not match');
        }).then(() => cacheManager.cache(testUrl3)).then(fileUrl => {
            assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files third download request url does not match');
            assert.equal(testFileUrl3, fileUrl, 'Cache three files third local file url does not match');
        }).then(() => {
            assert.equal(3, cacheSpy.callCount, 'Cache three files did not send three download requests');
        });
    });

    it('Cache one file with network failure', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        let networkTriggered: boolean = false;

        cacheApi.setInternet(false);
        setTimeout(() => {
            networkTriggered = true;
            cacheApi.setInternet(true);
            wakeUpManager.onNetworkConnected.trigger();
        }, 10);

        return cacheManager.cache(testUrl, { retries: 1, allowFailure: true }).then(fileUrl => {
            assert(networkTriggered, 'Cache one file with network failure: network was not triggered');
        });
    });

    it('Cache one file with repeated network failures (expect to fail)', function(this: Mocha.ITestDefinition) {
        this.timeout(60000);

        const testUrl: string = 'http://www.example.net/test.mp4';
        let networkTriggers: number = 0;

        const triggerNetwork: Function = () => {
            networkTriggers++;
            wakeUpManager.onNetworkConnected.trigger();
        };

        cacheApi.setInternet(false);
        setTimeout(() => triggerNetwork(), 5);
        setTimeout(() => triggerNetwork(), 10);
        setTimeout(() => triggerNetwork(), 15);

        return cacheManager.cache(testUrl, { retries: 3, allowFailure: false }).then(() => {
            assert.fail('Cache one file with repeated network failures: caching should not be successful with no internet');
        }).catch(error => {
            assert.equal(networkTriggers, 3, 'Cache one file with repeated network failures: caching should have retried exactly three times');
        });
    });

    it('Stop caching', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';

        cacheApi.setInternet(false);

        setTimeout(() => { cacheManager.stop(); }, 5);

        return cacheManager.cache(testUrl, { retries: 3, allowFailure: false }).then(() => {
            assert.fail('Caching should fail when stopped');
        }).catch(error => {
            assert.equal(error, CacheStatus.STOPPED, 'Cache status not STOPPED after caching was stopped');
        });
    });

    it('Cache one already downloaded file', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl: string = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.cache(testUrl).then(fileUrl => {
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Clean cache from current files', () => {
        const currentFile: string = 'current';
        const currentTime = new Date().getTime();

        cacheApi.addFile(currentFile, currentTime, 1234);

        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(!cacheSpy.calledOnce, 'Clean cache tried to delete current files');
        });
    });

    it('Clean cache from old files', () => {
        const currentFile: string = 'current';
        const oldFile: string = 'old';
        const currentTime = new Date().getTime();
        const tenWeeksAgo = currentTime - 10 * 7 * 24 * 60 * 60 * 1000;

        cacheApi.addFile(currentFile, currentTime, 1234);
        cacheApi.addFile(oldFile, tenWeeksAgo, 1234);

        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(cacheSpy.calledOnce, 'Clean cache from old files did not delete files');
            assert.equal(oldFile, cacheSpy.getCall(0).args[0], 'Clean cache from old files deleted wrong file');
        });
    });

    it('Clean cache from large disk usage', () => {
        const olderFile: string = 'older';
        const newerFile: string = 'newer';
        const currentTime = new Date().getTime();
        const size: number = 30 * 1024 * 1024;

        cacheApi.addFile(olderFile, currentTime - 1, size);
        cacheApi.addFile(newerFile, currentTime, size);

        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(cacheSpy.calledOnce, 'Clean cache from large disk usage did not delete files');
            assert.equal(olderFile, cacheSpy.getCall(0).args[0], 'Clean cache from large disk usage deleted wrong file');
        });
    });

    it('Clean cache (nothing to clean)', () => {
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert.equal(0, cacheSpy.callCount, 'Clean cache tried to delete files from empty cache');
        });
    });
});
