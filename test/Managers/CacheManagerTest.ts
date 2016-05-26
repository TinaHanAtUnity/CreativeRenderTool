import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CacheManager, CacheStatus } from '../../src/ts/Managers/CacheManager';
import { IFileInfo, CacheApi, CacheEvent, CacheError } from '../../src/ts/Native/Api/Cache';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';

class TestCacheApi extends CacheApi {

    private _filePrefix = 'file:///test/cache/dir/UnityAdsCache-';
    private _internet: boolean = true;
    private _files: { [key: string]: IFileInfo } = {};
    private _currentFile = undefined;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    public download(url: string, fileId: string): Promise<void> {
        let byteCount: number = 12345;
        let duration: number = 6789;
        let responseCode: number = 200;

        if(fileId in this._files) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_IN_CACHE]);
        }

        if(this._currentFile !== undefined) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_CACHING]);
        }

        this.addFile(fileId, 123, 123);

        if(this._internet) {
            this._currentFile = url;
            setTimeout(() => {
                this._currentFile = undefined;
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

    public getFileUrl(fileId: string): Promise<string> {
        if(fileId in this._files) {
            return Promise.resolve(this._filePrefix + fileId);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public getFiles(): Promise<IFileInfo[]> {
        let files: IFileInfo[] = [];
        for(let key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                files.push(this._files[key]);
            }
        }
        return Promise.resolve(files);
    }

    public getHash(value: string): Promise<string> {
        return Promise.resolve(this.getHashDirect(value));
    }

    public getHashDirect(value: string): string {
        let hash = 0;
        if(!value.length) {
            return hash.toString();
        }
        for(let i = 0; i < value.length; ++i) {
            let char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    public deleteFile(fileId: string): Promise<void> {
        return;
    }

    public setInternet(internet: boolean): void {
        this._internet = internet;
    }

    public addFile(id: string, mtime: number, size: number): void {
        let fileInfo: IFileInfo = {id: id, mtime: mtime, size: size, found: true};
        this._files[id] = fileInfo;
    }

    public getExtension(url: string): string {
        let splittedUrl = url.split('.');
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
        for(let key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                ++fileCount;
            }
        }
        return fileCount;
    }
}

describe('CacheManagerTest', () => {
    let handleInvocation = sinon.spy();
    let handleCallback = sinon.spy();
    let nativeBridge;

    let cacheApi: TestCacheApi;
    let cacheManager: CacheManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        cacheApi = nativeBridge.Cache = new TestCacheApi(nativeBridge);
        cacheManager = new CacheManager(nativeBridge);
    });

    it('Get local file url for cached file', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.getFileId(testUrl).then(fileId => nativeBridge.Cache.getFileUrl(fileId)).then(fileUrl => {
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache one file with success', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileId: string = '-960478764.mp4';
        let testFileUrl = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        let cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl).then(([status, fileId]) => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK');
            assert.equal(testFileId, fileId, 'Cache one file fileId was invalid');
            assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
            assert.equal(testUrl, cacheSpy.getCall(0).args[0], 'Cache one file download request url does not match');
            return nativeBridge.Cache.getFileUrl(testFileId).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });
    });

    it('Cache three files with success', () => {
        let testUrl1: string = 'http://www.example.net/first.jpg';
        let testUrl2: string = 'http://www.example.net/second.jpg';
        let testUrl3: string = 'http://www.example.net/third.jpg';
        let testFileUrl1: string = 'file:///test/cache/dir/UnityAdsCache-1647395140.jpg';
        let testFileUrl2: string = 'file:///test/cache/dir/UnityAdsCache-158720486.jpg';
        let testFileUrl3: string = 'file:///test/cache/dir/UnityAdsCache-929022075.jpg';

        let cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl1).then(([status, fileId]) => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for first test url');
            assert.equal('1647395140.jpg', fileId, 'fileId was not valid for first test url');
            assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
            return nativeBridge.Cache.getFileUrl('1647395140.jpg').then(fileUrl => {
                assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
            });
        }).then(() => cacheManager.cache(testUrl2)).then(([status, fileId]) => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for second test url');
            assert.equal('158720486.jpg', fileId, 'fileId was not valid for second test url');
            assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files second download request url does not match');
            return nativeBridge.Cache.getFileUrl('158720486.jpg').then(fileUrl => {
                assert.equal(testFileUrl2, fileUrl, 'Cache three files second local file url does not match');
            });
        }).then(() => cacheManager.cache(testUrl3)).then(([status, fileId]) => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for third test url');
            assert.equal('929022075.jpg', fileId, 'fileId was not valid for third test url');
            assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files third download request url does not match');
            return nativeBridge.Cache.getFileUrl('929022075.jpg').then(fileUrl => {
                assert.equal(testFileUrl3, fileUrl, 'Cache three files third local file url does not match');
            });
        }).then(() => {
            assert.equal(3, cacheSpy.callCount, 'Cache three files did not send three download requests');
        });
    });

    it('Cache one file with no internet', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';

        cacheApi.setInternet(false);

        return cacheManager.cache(testUrl).then(() => {
            assert.fail('Caching should not be successful with no internet');
        }, (error) => {
            // everything ok
        });
    });

    it('Cache one already downloaded file', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl: string = 'file:///test/cache/dir/UnityAdsCache--960478764.mp4';

        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.cache(testUrl).then(([status, fileId]) => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for already downloaded file');
            return nativeBridge.Cache.getFileUrl(fileId).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });
    });

    it('Clean cache from current files', () => {
        let currentFile: string = 'current';
        let currentTime = new Date().getTime();

        cacheApi.addFile(currentFile, currentTime, 1234);

        let cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(!cacheSpy.calledOnce, 'Clean cache tried to delete current files');
        });
    });

    it('Clean cache from old files', () => {
        let currentFile: string = 'current';
        let oldFile: string = 'old';
        let currentTime = new Date().getTime();
        let tenWeeksAgo = currentTime - 10 * 7 * 24 * 60 * 60 * 1000;

        cacheApi.addFile(currentFile, currentTime, 1234);
        cacheApi.addFile(oldFile, tenWeeksAgo, 1234);

        let cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(cacheSpy.calledOnce, 'Clean cache from old files did not delete files');
            assert.equal(oldFile, cacheSpy.getCall(0).args[0], 'Clean cache from old files deleted wrong file');
        });
    });

    it('Clean cache from large disk usage', () => {
        let olderFile: string = 'older';
        let newerFile: string = 'newer';
        let currentTime = new Date().getTime();
        let size: number = 30 * 1024 * 1024;

        cacheApi.addFile(olderFile, currentTime - 1, size);
        cacheApi.addFile(newerFile, currentTime, size);

        let cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert(cacheSpy.calledOnce, 'Clean cache from large disk usage did not delete files');
            assert.equal(olderFile, cacheSpy.getCall(0).args[0], 'Clean cache from large disk usage deleted wrong file');
        });
    });

    it('Clean cache (nothing to clean)', () => {
        let cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheManager.cleanCache().then(() => {
            assert.equal(0, cacheSpy.callCount, 'Clean cache tried to delete files from empty cache');
        });
    });
});
