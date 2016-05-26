import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CacheManager, CacheStatus } from '../../src/ts/Managers/CacheManager';
import { IFileInfo, CacheApi, CacheEvent, CacheError } from '../../src/ts/Native/Api/Cache';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';

class TestCacheApi extends CacheApi {
    private _mappings: {} = {};
    private _internet: boolean = true;
    private _files: IFileInfo[] = [];
    private _previouslyDownloadedFiles: string[] = [];
    private _currentFile = undefined;
    private _downloadedFiles: number = 0;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);
    }

    public download(url: string, fileId: string): Promise<void> {
        let byteCount: number = 12345;
        let duration: number = 6789;
        let responseCode: number = 200;

        if(this._previouslyDownloadedFiles.indexOf(url) !== -1) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_IN_CACHE]);
        }

        if(this._currentFile !== undefined) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_CACHING]);
        }

        if(this._internet) {
            this._currentFile = url;
            setTimeout(() => {
                this._downloadedFiles++;
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

    public getFileUrl(url: string): Promise<string> {
        return Promise.resolve(this._mappings[url]);
    }

    public getFiles(): Promise<IFileInfo[]> {
        return Promise.resolve(this._files);
    }

    public getHash(value: string): Promise<string> {
        let hash = 0;
        if(!value.length) {
            return Promise.resolve(hash.toString());
        }
        for(let i = 0; i < value.length; ++i) {
            let char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Promise.resolve(hash.toString());
    }

    public deleteFile(fileId: string): Promise<void> {
        return;
    }

    public setFileMapping(source: string, target: string): void {
        this._mappings[source] = target;
    }

    public setInternet(internet: boolean): void {
        this._internet = internet;
    }

    public addFile(id: string, mtime: number, size: number): void {
        let fileInfo: IFileInfo = {id: id, mtime: mtime, size: size, found: true};
        this._files.push(fileInfo);
    }

    public addPreviouslyDownloadedFile(url: string) {
        this._previouslyDownloadedFiles.push(url);
    }

    public getDownloadedFilesCount(): number {
        return this._downloadedFiles;
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
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);

        return nativeBridge.Cache.getFileUrl(testUrl).then(fileUrl => {
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache one file with success', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);

        let cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl).then(status => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK');
            assert(cacheSpy.calledOnce, 'Cache one file did not send download request');
            assert.equal(testUrl, cacheSpy.getCall(0).args[0], 'Cache one file download request url does not match');
            return nativeBridge.Cache.getFileUrl(testUrl).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });
    });

    it('Cache three files with success', () => {
        let testUrl1: string = 'http://www.example.net/first';
        let testUrl2: string = 'http://www.example.net/second';
        let testUrl3: string = 'http://www.example.net/third';
        let testFileUrl1: string = 'file:///test/cache/dir/1';
        let testFileUrl2: string = 'file:///test/cache/dir/2';
        let testFileUrl3: string = 'file:///test/cache/dir/3';

        cacheApi.setFileMapping(testUrl1, testFileUrl1);
        cacheApi.setFileMapping(testUrl2, testFileUrl2);
        cacheApi.setFileMapping(testUrl3, testFileUrl3);

        let cacheSpy = sinon.spy(cacheApi, 'download');

        return cacheManager.cache(testUrl1).then(status => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for second test url');
            assert.equal(testUrl1, cacheSpy.getCall(0).args[0], 'Cache three files first download request url does not match');
            return nativeBridge.Cache.getFileUrl(testUrl1).then(fileUrl => {
                assert.equal(testFileUrl1, fileUrl, 'Cache three files first local file url does not match');
            });
        }).then(() => cacheManager.cache(testUrl2)).then(status => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for second test url');
            assert.equal(testUrl2, cacheSpy.getCall(1).args[0], 'Cache three files first download request url does not match');
            return nativeBridge.Cache.getFileUrl(testUrl2).then(fileUrl => {
                assert.equal(testFileUrl2, fileUrl, 'Cache three files first local file url does not match');
            });
        }).then(() => cacheManager.cache(testUrl3)).then(status => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for second test url');
            assert.equal(testUrl3, cacheSpy.getCall(2).args[0], 'Cache three files first download request url does not match');
            return nativeBridge.Cache.getFileUrl(testUrl3).then(fileUrl => {
                assert.equal(testFileUrl3, fileUrl, 'Cache three files first local file url does not match');
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
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);
        cacheApi.addPreviouslyDownloadedFile(testUrl);

        return cacheManager.cache(testUrl).then(status => {
            assert.equal(CacheStatus.OK, status, 'CacheStatus was not OK for already downloaded file');
            assert.equal(0, cacheApi.getDownloadedFilesCount(), 'Tried downloading already downloaded file');
            return nativeBridge.Cache.getFileUrl(testUrl).then(fileUrl => {
                assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
            });
        });
    });

    it('Cache same url twice', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);

        return Promise.all([cacheManager.cache(testUrl), cacheManager.cache(testUrl)]).then(fileUrls => {
            assert.fail('Caching should fail with two same urls');
        }).catch(error => {
            if(error instanceof Error) {
                assert.equal(testUrl + ' already in queue', error.message, 'Error was wrong');
            }
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
