import { CacheManager } from '../../src/ts/Managers/CacheManager';
import { TestBridge, TestBridgeApi } from '../TestBridge';

import 'mocha';
import { assert } from 'chai';
// import * as sinon from 'sinon';

class Cache extends TestBridgeApi {
    private _mappings: {} = {};
    private _internet: boolean = true;

    public download(url: string, overwrite: boolean): any[] {
        let byteCount: number = 12345;
        let duration: number = 6789;
        let responseCode: number = 200;

        if(this._internet) {
            setTimeout(() => {
                this.getNativeBridge().handleEvent(['CACHE_DOWNLOAD_END', url, byteCount, duration, responseCode, []]);
            }, 0);
            return ['OK'];
        } else {
            return ['ERROR', 'NO_INTERNET'];
        }
    }

    public getFileUrl(url: string): any[] {
        return ['OK', this._mappings[url]];
    }

    public getFiles(): any[] {
        // todo
        return ['OK', [{'id': 'foobar', 'mtime': 1234, 'size': 5678, found: true}]];
    }

    public deleteFile(fileId: string): any[] {
        // todo
        return ['OK'];
    }

    public setFileMapping(source: string, target: string) {
        this._mappings[source] = target;
    }

    public setInternet(internet: boolean) {
        this._internet = internet;
    }
}

class Sdk extends TestBridgeApi {
    public logInfo(message: string) {
        return ['OK'];
    }
}

describe('CacheManagerTest', () => {
    let testBridge: TestBridge;
    let cacheApi: Cache;
    let cacheManager: CacheManager;

    beforeEach(() => {
        testBridge = new TestBridge();
        cacheApi = new Cache();
        testBridge.setApi('Cache', cacheApi);
        testBridge.setApi('Sdk', new Sdk());
        cacheManager = new CacheManager(testBridge.getNativeBridge());
    });

    it('Get local file url for cached file', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);

        return cacheManager.getFileUrl(testUrl).then(([url, fileUrl]) => {
            assert.equal(testUrl, url, 'Remote url does not match');
            assert.equal(testFileUrl, fileUrl, 'Local file url does not match');
        });
    });

    it('Cache one file with success', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';
        let testFileUrl: string = 'file:///test/cache/dir/file';

        cacheApi.setFileMapping(testUrl, testFileUrl);

        return cacheManager.cacheAll([testUrl]).then(urlMap => {
            assert.equal(testFileUrl, urlMap[testUrl], 'Local file url does not match');
        });
    });

    it('Cache one file with no internet', () => {
        let testUrl: string = 'http://www.example.net/test.mp4';

        cacheApi.setInternet(false);

        return cacheManager.cacheAll([testUrl]).then(() => {
            assert.fail('Caching should not be successful with no internet');
        }, (error) => {
            // everything ok
        });
    });
});