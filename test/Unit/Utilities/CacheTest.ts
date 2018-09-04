import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { CacheApi, CacheError, CacheEvent, IFileInfo } from 'Core/Native/Cache';
import { StorageApi, StorageType } from 'Core/Native/Storage';

import { Cache, CacheStatus } from 'Core/Utilities/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { FileId } from 'Core/Utilities/FileId';
import { FileInfo } from 'Core/Utilities/FileInfo';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

class TestCacheApi extends CacheApi {

    private _filePrefix = '/test/cache/dir/UnityAdsCache-';
    private _internet: boolean = true;
    private _files: { [key: string]: IFileInfo } = {};
    private _currentFile: string;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    public download(url: string, fileId: string, headers: Array<[string, string]>, append: boolean): Promise<void> {
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
        return Promise.resolve(<any>void(0));
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
    let request: Request;
    let cacheBookkeeping: CacheBookkeeping;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let cacheManager: Cache;
    let wakeUpManager: WakeUpManager;
    let isCachedStub: sinon.SinonStub;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        const focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        cacheBookkeeping = new CacheBookkeeping(nativeBridge);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        cacheManager = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService, {retries: 3, retryDelay: 1000});
        isCachedStub = sinon.stub(FileInfo, 'isCached').returns(Promise.resolve(false));
    });

    afterEach(() => {
        isCachedStub.restore();
    });

    it('Get local file url for cached file', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return FileId.getFileId(testUrl, nativeBridge).then(fileId => FileId.getFileUrl(fileId, nativeBridge)).then(fileUrl => {
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache one file with success', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        const cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(([fileId, fileUrl]) => {
            assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
            assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
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

        return cacheManager.cache(testUrl1, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(([fileId, fileUrl]) => {
            assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
            assert.equal(fileId, '1647395140.jpg', 'Cache three files first fileId does not match');
            assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
        }).then(() => cacheManager.cache(testUrl2, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign())).then(([fileId, fileUrl]) => {
            assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files second download request url does not match');
            assert.equal(fileId, '158720486.jpg', 'Cache three files second fileId does not match');
            assert.equal(testFileUrl2, fileUrl, 'Cache three files second local file url does not match');
        }).then(() => cacheManager.cache(testUrl3, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign())).then(([fileId, fileUrl]) => {
            assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files third download request url does not match');
            assert.equal(fileId, '929022075.jpg', 'Cache three files third fileId does not match');
            assert.equal(testFileUrl3, fileUrl, 'Cache three files third local file url does not match');
        }).then(() => {
            assert.equal(3, cacheSpy.callCount, 'Cache three files did not send three download requests');
        });
    });

    xit('Cache one file with network failure', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        let networkTriggered: boolean = false;

        cacheApi.setInternet(false);
        setTimeout(() => {
            networkTriggered = true;
            cacheApi.setInternet(true);
            wakeUpManager.onNetworkConnected.trigger();
        }, 10);

        return cacheManager.cache(testUrl, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(fileUrl => {
            assert(networkTriggered, 'Cache one file with network failure: network was not triggered');
        });
    });

    xit('Cache one file with repeated network failures (expect to fail)', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        let networkTriggers: number = 0;

        const triggerNetwork = () => {
            networkTriggers++;
            wakeUpManager.onNetworkConnected.trigger();
        };

        cacheApi.setInternet(false);
        setTimeout(triggerNetwork, 150);
        setTimeout(triggerNetwork, 200);
        setTimeout(triggerNetwork, 350);

        return cacheManager.cache(testUrl, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(() => {
            assert.fail('Cache one file with repeated network failures: caching should not be successful with no internet');
        }).catch(error => {
            assert.equal(networkTriggers, 3, 'Cache one file with repeated network failures: caching should have retried exactly three times');
        });
    });

    xit('Stop caching', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';

        cacheApi.setInternet(false);

        setTimeout(() => cacheManager.stop(), 150);

        return cacheManager.cache(testUrl, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(() => {
            assert.fail('Caching should fail when stopped');
        }).catch(error => {
            assert.equal(error, CacheStatus.STOPPED, 'Cache status not STOPPED after caching was stopped');
        });
    });

    it('Cache one already downloaded file', () => {
        const testUrl: string = 'http://www.example.net/test.mp4';
        const testFileUrl: string = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.cache(testUrl, TestFixtures.getCacheDiagnostics(), TestFixtures.getCampaign()).then(([fileId, fileUrl]) => {
            assert.equal(fileId, '-960478764.mp4', 'Cache fileId did not match');
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });
});
