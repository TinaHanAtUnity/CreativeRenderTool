import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { CacheApi, CacheError, IFileInfo } from 'Core/Native/Cache';
import { StorageApi, StorageError, StorageType } from 'Core/Native/Storage';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Cache } from 'Core/Utilities/Cache';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { Request } from 'Core/Utilities/Request';
import { FakeSdkApi } from 'TestHelpers/FakeSdkApi';
import { FocusManager } from 'Core/Managers/FocusManager';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

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
    private _contents: any;
    private _dirty: boolean;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge);

        this._dirty = false;
    }

    public get<T>(type: StorageType, key: string): Promise<T> {
        if(key && key.match(/^cache\.files\./)) {
            let id: string = key.substring(12);
            id = id.split('.')[0];

            if(this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[id]) {
                return Promise.resolve(this._contents.cache.files[id]);
            }
        }
        if (key && key.match(/^cache\.campaigns\./)) {
            const id: string = key.substring(16);
            if(this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
                return Promise.resolve(this._contents.cache.campaigns[id]);
            }
        }
        if (key && key.match(/^cache\.campaigns/)) {
            if(this._contents && this._contents.cache && this._contents.cache.campaigns) {
                return Promise.resolve(this._contents.cache.campaigns);
            }
        }

        return Promise.reject(StorageError[StorageError.COULDNT_GET_VALUE]);
    }

    public delete(type: StorageType, key: string): Promise<void> {
        if(key && key.match(/^cache\.files\./)) {
            const id: string = key.substring(12);

            if(this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[id]) {
                this._dirty = true;
                delete this._contents.cache.files[id];
                return Promise.resolve();
            }
        }

        if (key && key.match(/^cache\.campaigns\./)) {
            const id: string = key.substring(16);

            if (this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
                this._dirty = true;
                delete this._contents.cache.campaigns[id];
                return Promise.resolve();
            }
        }

        if (key && key.match(/cache/)) {
            this._dirty = true;
            delete this._contents.cache;
            return Promise.resolve();
        }

        return Promise.reject(StorageError[StorageError.COULDNT_DELETE_VALUE]);
    }

    public write(type: StorageType): Promise<void> {
        this._dirty = false;
        return Promise.resolve();
    }

    public getKeys(type: StorageType, key: string, recursive: boolean): Promise<string[]> {
        if(type === StorageType.PRIVATE && key === 'cache.files') {
            const retArray: string[] = [];

            if(this._contents && this._contents.cache && this._contents.cache.files) {
                for(const i in this._contents.cache.files) {
                    if(this._contents.cache.files.hasOwnProperty(i)) {
                        retArray.push(i);
                    }
                }
            }

            return Promise.resolve(retArray);
        }
        if (type === StorageType.PRIVATE && key === 'cache.campaigns') {
            const retArray: string[] = [];

            if(this._contents && this._contents.cache && this._contents.cache.campaigns) {
                for(const i in this._contents.cache.campaigns) {
                    if(this._contents.cache.campaigns.hasOwnProperty(i)) {
                        retArray.push(i);
                    }
                }
            }

            return Promise.resolve(retArray);
        }
        if (type === StorageType.PRIVATE && key === 'cache') {
            const retArray: string[] = [];

            if (this._contents && this._contents.cache) {
                for(const i in this._contents.cache) {
                    if (this._contents.cache.hasOwnProperty(i)) {
                        retArray.push(i);
                    }
                }
            }

            return Promise.resolve(retArray);
        }

        return Promise.resolve([]);
    }

    public isDirty(): boolean {
        return this._dirty;
    }

    public hasFileEntry(fileId: string): boolean {
        fileId = fileId.split('.')[0];
        if(this._contents && this._contents.cache && this._contents.cache.files && this._contents.cache.files[fileId]) {
            return true;
        }

        return false;
    }

    public hasCampaignEntry(id: string): boolean {
        if(this._contents && this._contents.cache && this._contents.cache.campaigns && this._contents.cache.campaigns[id]) {
            return true;
        }

        return false;
    }

    public setStorageContents(contents: any): void {
        this._contents = contents;
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

    public addFile(id: string, size: number, ageInDays: number) {
        this._cache.addFile(id, size, this._baseTimestamp - (ageInDays * 24 * 60 * 60 * 1000));
    }
}

describe('CacheCleanTest', () => {
    let cache: Cache;
    let cacheBookkeeping: CacheBookkeeping;
    let helper: TestHelper;
    let cacheApi: TestCacheApi;
    let storageApi: TestStorageApi;

    beforeEach(() => {
        const nativeBridge: NativeBridge = TestFixtures.getNativeBridge();
        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager: WakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request: Request = new Request(nativeBridge, wakeUpManager);
        const programmaticTrackingService: ProgrammaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        cacheBookkeeping = new CacheBookkeeping(nativeBridge);
        cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
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
        helper.addFile(fileId, 1000000, 2);
        storageApi.setStorageContents({
            cache: {
                files: {
                    test: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup tried to delete files when none should have been deleted');
            assert.isTrue(storageApi.hasFileEntry(fileId), 'Cache cleanup removed entry for kept file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete old files', () => {
        const fileId: string = 'test1.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        // add one file, 30 days old
        helper.addFile(fileId, 1000000, 30);
        storageApi.setStorageContents({
            cache: {
                files: {
                    test: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
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

        helper.addFile(newFileId, 1000000, 1); // 1 day old, should be kept
        helper.addFile(newFileId2, 1000000, 2); // 2 days old, should be kept
        helper.addFile(oldFileId, 1000000, 31); // 31 days old, should be deleted
        helper.addFile(oldFileId2, 1000000, 32); // 32 days old, should be deleted

        storageApi.setStorageContents({
            cache: {
                files: {
                    new: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    },
                    new2: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    },
                    old: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    },
                    old2: {
                        fullyDownloaded: true,
                        size: 1000000,
                        totalSize: 1000000,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
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
        const smallFileId: string = 'small.mp4';
        const largeFileId: string = 'large.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        helper.addFile(smallFileId, 1234, 1); // small file, should be kept
        helper.addFile(largeFileId, 123456789, 2); // large file over 50 megabytes, should be deleted

        storageApi.setStorageContents({
            cache: {
                files: {
                    small: {
                        fullyDownloaded: true,
                        size: 1234,
                        totalSize: 1234,
                        extension: 'mp4'
                    },
                    large: {
                        fullyDownloaded: true,
                        size: 123456789,
                        totalSize: 123456789,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], largeFileId, 'Cache cleanup deleted the wrong file');
            assert.isTrue(storageApi.hasFileEntry(smallFileId), 'Cache cleanup removed storage entry for kept file');
            assert.isFalse(storageApi.hasFileEntry(largeFileId), 'Cache cleanup did not remove storage entry for deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should not clean empty cache', () => {
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup should have deleted nothing when cache is empty');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean files with no bookkeeping', () => {
        const fileId: string = 'test';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        cacheApi.addFile(fileId, 12345, new Date().getTime());

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean bookkeeping if cache is empty', () => {
        const storageSpy = sinon.stub(storageApi, 'delete').returns(Promise.resolve());
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        storageApi.setStorageContents({
            cache: {
                files: {
                    foo: {
                        fullyDownloaded: true,
                        size: 12345,
                        totalSize: 12345,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 1, 'Cache cleanup did not invoke storage delete once');
            assert.equal(storageSpy.getCall(0).args[0], StorageType.PRIVATE, 'Cache cleanup invoked wrong storage type');
            assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup invoked wrong storage hierarchy');
            assert.equal(cacheSpy.callCount, 0, 'Cache cleanup invoked Cache.delete with empty cache');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should clean partially downloaded files', () => {
        const fileId: string = 'test2.mp4';
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        // add one partially downloaded file
        helper.addFile(fileId, 1000000, 1);
        storageApi.setStorageContents({
            cache: {
                files: {
                    test2: {
                        fullyDownloaded: false,
                        size: 12345,
                        totalSize: 12345,
                        extension: 'mp4'
                    }
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
            assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
            assert.isFalse(storageApi.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete campaign with files in cache but without required files in cache', () => {
        const campaignId = '123456';
        const storageSpy = sinon.spy(storageApi, 'delete');
        helper.addFile('test1.mp4', 123456, 2);
        helper.addFile('test2.mp4', 123456, 2);
        storageApi.setStorageContents({
            cache: {
                files: {
                },
                campaigns: {
                    '123456': {
                        test3: {
                            extension: 'mp4'
                        },
                        test4: {
                            extension: 'mp4'
                        }
                    }
                }
            }
        });

        assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
            assert.equal(storageSpy.getCall(0).args[1], 'cache.campaigns.' + campaignId, 'Cache cleanup deleted a wrong campaign');
            assert.isFalse(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete campaign without files on disk and without required files in cache', () => {
        const campaignId = '123456';
        const storageSpy = sinon.spy(storageApi, 'delete');
        storageApi.setStorageContents({
            cache: {
                files: {
                },
                campaigns: {
                    '123456': {
                        test1: {
                            extension: 'mp4'
                        },
                        test2: {
                            extension: 'mp4'
                        }
                    }
                }
            }
        });
        assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
            assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup should have deleted the whole cache entry');
            assert.isFalse(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should keep campaign with files still in cache', () => {
        const campaignId = '123456';
        const storageSpy = sinon.spy(storageApi, 'delete');
        helper.addFile('test1.mp4', 123456, 2);
        helper.addFile('test2.mp4', 123456, 2);
        storageApi.setStorageContents({
           cache: {
               files: {
                   test1: {
                       fullyDownloaded: true,
                       size: 123456,
                       totalSize: 123456,
                       extension: 'mp4'
                   },
                   test2: {
                       fullyDownloaded: true,
                       size: 123456,
                       totalSize: 123456,
                       extension: 'mp4'
                   }
               },
               campaigns: {
                   '123456': {
                       test1: {
                           extension: 'mp4'
                       },
                       test2: {
                           extension: 'mp4'
                       }
                   }

               }
           }
        });

        assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Should have a campaign entry');
        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 0, 'Cache cleanup shouldn\'t have deleted campaign');
            assert.isTrue(storageApi.hasCampaignEntry(campaignId), 'Cache cleanup did remove storage entry for campaign');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete the whole cache bookkeeping when there is files on disk but format is old', () => {
        const storageSpy = sinon.spy(storageApi, 'delete');
        const cacheSpy = sinon.spy(cacheApi, 'deleteFile');

        helper.addFile('test1.mp4', 123456, 2);
        helper.addFile('test2.mp4', 123456, 2);

        storageApi.setStorageContents({
            cache: {
                test1: {
                    mp4: '{fullyDownloaded: true}'
                },
                test2: {
                    mp4: '{fullyDownloaded: true}'
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 2, 'Should have called storage delete once');
            assert.equal(storageSpy.getCall(0).args[1], 'cache.test1', 'Cache cleanup should have deleted the first file entry');
            assert.equal(storageSpy.getCall(1).args[1], 'cache.test2', 'Cache cleanup should have deleted the second file entry');
            assert.equal(cacheSpy.callCount, 2, 'Should have deleted two files from cache');
            assert.equal(cacheSpy.getCall(0).args[0], 'test1.mp4', 'Fist file deleted should be \'test1\'');
            assert.equal(cacheSpy.getCall(1).args[0], 'test2.mp4', 'Fist file deleted should be \'test2\'');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

    it('should delete the whole cache bookkeeping when there is no files on disk and format is old', () => {
        const storageSpy = sinon.spy(storageApi, 'delete');

        storageApi.setStorageContents({
            cache: {
                test1: {
                    mp4: '{fullyDownloaded: true}'
                },
                test2: {
                    mp4: '{fullyDownloaded: true}'
                }
            }
        });

        return cacheBookkeeping.cleanCache().then(() => {
            assert.equal(storageSpy.callCount, 2, 'Should have called storage delete once');
            assert.equal(storageSpy.getCall(0).args[1], 'cache.test1', 'Cache cleanup should have deleted the first file entry');
            assert.equal(storageSpy.getCall(1).args[1], 'cache.test2', 'Cache cleanup should have deleted the second file entry');
            assert.isFalse(storageApi.isDirty(), 'Cache cleanup left storage dirty');
        });
    });

});
