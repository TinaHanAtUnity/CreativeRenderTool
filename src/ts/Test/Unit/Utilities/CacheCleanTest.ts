import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CacheApi, IFileInfo, CacheError } from 'Native/Api/Cache';
import { StorageApi, StorageType, StorageError } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Cache, ICacheResponse } from 'Utilities/Cache';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Request } from 'Utilities/Request';
import { FakeSdkApi } from '../TestHelpers/FakeSdkApi';

class TestCacheApi extends CacheApi {
    private _files: IFileInfo[];

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);

        this._files = [];
    }

    public getFiles(): Promise<IFileInfo[]> {
        return Promise.resolve(this._files);
    }

    public deleteFile(fileId: string): Promise<void> {
        for(const i of this._files) {
            if(i.id === fileId) {
                return Promise.resolve();
            }
        }

        return Promise.reject(CacheError[CacheError.FILE_NOT_FOUND]);
    }

    public addFile(id: string, size: number, mtime: number) {
        this._files.push({
            id: id,
            found: true,
            size: size,
            mtime: mtime
        });
    }
}

class TestStorageApi extends StorageApi {
    private _files: { [id: string]: ICacheResponse };
    private _dirty: boolean;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);

        this._files = {};
        this._dirty = false;
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        if(key && key.match(/^cache\./)) {
            const id: string = key.substring(6);

            if(this._files[id]) {
                return Promise.resolve(<any>JSON.stringify(this._files[id]));
            }
        }

        return Promise.reject(StorageError[StorageError.COULDNT_GET_VALUE]);
    }

    public delete(type: StorageType, key: string): Promise<void> {
        if(key && key.match(/^cache\./)) {
            const id: string = key.substring(6);

            if(this._files[id]) {
                this._dirty = true;
                delete this._files[id];
                return Promise.resolve();
            }
        }

        return Promise.reject(StorageError[StorageError.COULDNT_DELETE_VALUE]);
    }

    public write(type: StorageType): Promise<void> {
        this._dirty = false;
        return Promise.resolve();
    }

    public getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        if(type === StorageType.PRIVATE && key === 'cache') {
            const retArray: string[] = [];

            for(const i in this._files) {
                if(this._files.hasOwnProperty(i)) {
                    retArray.push(i);
                }
            }

            return Promise.resolve(retArray);
        }

        return Promise.resolve([]);
    }

    public isDirty(): boolean {
        return this._dirty;
    }

    public hasFileEntry(fileId: string) {
        if(this._files[fileId]) {
            return true;
        }

        return false;
    }

    public addFile(id: string, fullyDownloaded: boolean) {
        this._files[id] = {
            fullyDownloaded: fullyDownloaded,
            // values below this line are not read when cleaning cache so just using dummy values
            url: '',
            size: 0,
            totalSize: 0,
            duration: 0,
            responseCode: 0,
            headers: []
        };
    }
}

class TestHelper {
    private _cache: TestCacheApi;
    private _storage: TestStorageApi;
    private _baseTimestamp: number;

    constructor(cache: TestCacheApi, storage: TestStorageApi) {
        this._cache = cache;
        this._storage = storage;
        this._baseTimestamp = new Date().getTime();
    }

    public addFile(id: string, size: number, fullyDownloaded: boolean, ageInDays: number) {
        this._cache.addFile(id, size, this._baseTimestamp - (ageInDays * 24 * 60 * 60 * 1000));
        this._storage.addFile(id, fullyDownloaded);
    }
}

describe('CacheCleanTest', () => {
    let cache: Cache;
    let helper: TestHelper;
    let cacheApi: TestCacheApi;
    let storageApi: TestStorageApi;

    beforeEach(() => {
        const nativeBridge: NativeBridge = TestFixtures.getNativeBridge();
        const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge);
        const request: Request = new Request(nativeBridge, wakeUpManager);
        cache = new Cache(nativeBridge, TestFixtures.getDeviceInfo(), wakeUpManager, request);
        cacheApi = new TestCacheApi(nativeBridge);
        storageApi = new TestStorageApi(nativeBridge);
        nativeBridge.Cache = cacheApi;
        nativeBridge.Storage = storageApi;
        nativeBridge.Sdk = new FakeSdkApi(nativeBridge);

        helper = new TestHelper(cacheApi, storageApi);
    });

    it('should keep new files', () => {
        const fileId: string = 'test.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        // add one file, 2 days old
        helper.addFile(fileId, 1000000, true, 2);

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup tried to delete files when none should have been deleted');
            assert.isTrue(storageApi.hasFileEntry(fileId), 'Cache cleanup removed entry for kept file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete old files', () => {
        const fileId: string = 'test.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        // add one file, 30 days old
        helper.addFile(fileId, 1000000, true, 30);

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
            assert.isFalse(storageApi.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should keep new files and delete old files', () => {
        const newFileId: string = 'new.mp4';
        const newFileId2: string = 'new2.mp4';
        const oldFileId: string = 'old.mp4';
        const oldFileId2: string = 'old2.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        helper.addFile(newFileId, 1000000, true, 1); // 1 day old, should be kept
        helper.addFile(newFileId2, 1000000, true, 2); // 2 days old, should be kept
        helper.addFile(oldFileId, 1000000, true, 31); // 31 days old, should be deleted
        helper.addFile(oldFileId2, 1000000, true, 32); // 32 days old, should be deleted

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 2, 'Cache cleanup should have deleted two files');
            assert.equal(cacheSpy.getCall(0).args[0], oldFileId, 'Cache cleanup deleted the wrong file (should have deleted first)');
            assert.equal(cacheSpy.getCall(1).args[0], oldFileId2, 'Cache cleanup deleted the wrong file (should have deleted second)');
            assert.isTrue(storageApi.hasFileEntry(newFileId), 'Cache cleanup removed entry for first kept file');
            assert.isTrue(storageApi.hasFileEntry(newFileId2), 'Cache cleanup removed entry for second kept file');
            assert.isFalse(storageApi.hasFileEntry(oldFileId), 'Cache cleanup did not remove storage entry for first deleted file');
            assert.isFalse(storageApi.hasFileEntry(oldFileId2), 'Cache cleanup did not remove storage entry for second deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean too large cache', () => {
        const smallFileId: string = 'small';
        const largeFileId: string = 'large';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        helper.addFile(smallFileId, 1234, true, 1); // small file, should be kept
        helper.addFile(largeFileId, 123456789, true, 2); // large file over 50 megabytes, should be deleted

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], largeFileId, 'Cache cleanup deleted the wrong file');
            assert.isTrue(storageApi.hasFileEntry(smallFileId), 'Cache cleanup removed storage entry for kept file');
            assert.isFalse(storageApi.hasFileEntry(largeFileId), 'Cache cleanup did not remove storage entry for deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should not clean empty cache', () => {
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup should have deleted nothing when cache is empty');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean files with no bookkeeping', () => {
        const fileId: string = 'test';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        cacheApi.addFile(fileId, 12345, new Date().getTime());

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean bookkeeping if cache is empty', () => {
        const storageSpy = sinon.stub(storageApi, 'delete').returns(Promise.resolve());
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        storageApi.addFile('foo', true);

        return cache.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 1, 'Cache cleanup did not invoke storage delete once');
            assert.equal(storageSpy.getCall(0).args[0], StorageType.PRIVATE, 'Cache cleanup invoked wrong storage type');
            assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup invoked wrong storage hierarchy');
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup invoked Cache.delete with empty cache');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean partially downloaded files', () => {
        const fileId: string = 'test.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        // add one partially downloaded file
        helper.addFile(fileId, 1000000, false, 1);

        return cache.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
            assert.isFalse(storageApi.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });
});
