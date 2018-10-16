import { assert } from 'chai';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import { StorageType } from 'Core/Native/Storage';
import { CacheManager } from 'Core/Managers/CacheManager';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from '../../../src/ts/Backend/Backend';
import { Cache } from '../../../src/ts/Backend/Api/Cache';
import { Storage } from '../../../src/ts/Backend/Api/Storage';
import { Platform } from '../../../src/ts/Core/Constants/Platform';
import { ICoreApi } from '../../../src/ts/Core/ICore';

class TestHelper {
    private _cache: Cache;
    private _storage: Storage;
    private _baseTimestamp: number;

    constructor(cache: Cache, storage: Storage) {
        this._cache = cache;
        this._storage = storage;
        this._baseTimestamp = new Date().getTime();
    }

    public addFile(id: string, size: number, ageInDays: number) {
        this._cache.addFile(id, this._baseTimestamp - (ageInDays * 24 * 60 * 60 * 1000), size);
    }
}

[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(Platform[platform] + ' - CacheBookkeepingManagerTest', () => {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let cache: CacheManager;
        let cacheBookkeeping: CacheBookkeepingManager;
        let helper: TestHelper;

        beforeEach(() => {
            backend = new Backend(Platform.ANDROID);
            nativeBridge = new NativeBridge(backend, platform, false);
            backend.setNativeBridge(nativeBridge);
            core = TestFixtures.getCoreApi(nativeBridge);
            const wakeUpManager: WakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            cacheBookkeeping = new CacheBookkeepingManager(core);
            cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
            helper = new TestHelper(backend.Api.Cache, backend.Api.Storage);
        });

        it('should keep new files', () => {
            const fileId: string = 'test.mp4';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            // add one file, 2 days old
            helper.addFile(fileId, 1000000, 2);
            backend.Api.Storage.setStorageContents({
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
                assert.isTrue(backend.Api.Storage.hasFileEntry(fileId), 'Cache cleanup removed entry for kept file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should delete old files', () => {
            const fileId: string = 'test1.mp4';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            // add one file, 30 days old
            helper.addFile(fileId, 1000000, 30);
            backend.Api.Storage.setStorageContents({
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
                assert.isFalse(backend.Api.Storage.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should keep new files and delete old files', () => {
            const newFileId: string = 'new.mp4';
            const newFileId2: string = 'new2.mp4';
            const oldFileId: string = 'old.mp4';
            const oldFileId2: string = 'old2.mp4';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            helper.addFile(newFileId, 1000000, 1); // 1 day old, should be kept
            helper.addFile(newFileId2, 1000000, 2); // 2 days old, should be kept
            helper.addFile(oldFileId, 1000000, 31); // 31 days old, should be deleted
            helper.addFile(oldFileId2, 1000000, 32); // 32 days old, should be deleted

            backend.Api.Storage.setStorageContents({
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
                assert.isTrue(backend.Api.Storage.hasFileEntry(newFileId), 'Cache cleanup removed entry for first kept file');
                assert.isTrue(backend.Api.Storage.hasFileEntry(newFileId2), 'Cache cleanup removed entry for second kept file');
                assert.isFalse(backend.Api.Storage.hasFileEntry(oldFileId), 'Cache cleanup did not remove storage entry for first deleted file');
                assert.isFalse(backend.Api.Storage.hasFileEntry(oldFileId2), 'Cache cleanup did not remove storage entry for second deleted file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should clean too large cache', () => {
            const smallFileId: string = 'small.mp4';
            const largeFileId: string = 'large.mp4';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            helper.addFile(smallFileId, 1234, 1); // small file, should be kept
            helper.addFile(largeFileId, 123456789, 2); // large file over 50 megabytes, should be deleted

            backend.Api.Storage.setStorageContents({
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
                assert.isTrue(backend.Api.Storage.hasFileEntry(smallFileId), 'Cache cleanup removed storage entry for kept file');
                assert.isFalse(backend.Api.Storage.hasFileEntry(largeFileId), 'Cache cleanup did not remove storage entry for deleted file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should not clean empty cache', () => {
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            return cacheBookkeeping.cleanCache().then(() => {
                assert.equal(cacheSpy.callCount, 0, 'Cache cleanup should have deleted nothing when cache is empty');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should clean files with no bookkeeping', () => {
            const fileId: string = 'test';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            backend.Api.Cache.addFile(fileId, 12345, new Date().getTime());

            return cacheBookkeeping.cleanCache().then(() => {
                assert.equal(cacheSpy.callCount, 1, 'Cache cleanup should have deleted one file');
                assert.equal(cacheSpy.getCall(0).args[0], fileId, 'Cache cleanup deleted the wrong file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should clean bookkeeping if cache is empty', () => {
            const storageSpy = sinon.stub(backend.Api.Storage, 'delete').returns(Promise.resolve());
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            backend.Api.Storage.setStorageContents({
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
                assert.equal(storageSpy.getCall(0).args[0], StorageType[StorageType.PRIVATE], 'Cache cleanup invoked wrong storage type');
                assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup invoked wrong storage hierarchy');
                assert.equal(cacheSpy.callCount, 0, 'Cache cleanup invoked Cache.delete with empty cache');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should clean partially downloaded files', () => {
            const fileId: string = 'test2.mp4';
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            // add one partially downloaded file
            helper.addFile(fileId, 1000000, 1);
            backend.Api.Storage.setStorageContents({
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
                assert.isFalse(backend.Api.Storage.hasFileEntry(fileId), 'Cache cleanup did not remove storage entry for deleted file');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should delete campaign with files in cache but without required files in cache', () => {
            const campaignId = '123456';
            const storageSpy = sinon.spy(backend.Api.Storage, 'delete');
            helper.addFile('test1.mp4', 123456, 2);
            helper.addFile('test2.mp4', 123456, 2);
            backend.Api.Storage.setStorageContents({
                cache: {
                    files: {},
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

            assert.isTrue(backend.Api.Storage.hasCampaignEntry(campaignId), 'Should have a campaign entry');
            return cacheBookkeeping.cleanCache().then(() => {
                assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
                assert.equal(storageSpy.getCall(0).args[1], 'cache.campaigns.' + campaignId, 'Cache cleanup deleted a wrong campaign');
                assert.isFalse(backend.Api.Storage.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should delete campaign without files on disk and without required files in cache', () => {
            const campaignId = '123456';
            const storageSpy = sinon.spy(backend.Api.Storage, 'delete');
            backend.Api.Storage.setStorageContents({
                cache: {
                    files: {},
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
            assert.isTrue(backend.Api.Storage.hasCampaignEntry(campaignId), 'Should have a campaign entry');
            return cacheBookkeeping.cleanCache().then(() => {
                assert.equal(storageSpy.callCount, 1, 'Cache cleanup should have deleted one campaign');
                assert.equal(storageSpy.getCall(0).args[1], 'cache', 'Cache cleanup should have deleted the whole cache entry');
                assert.isFalse(backend.Api.Storage.hasCampaignEntry(campaignId), 'Cache cleanup did not remove storage entry for deleted campaign');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should keep campaign with files still in cache', () => {
            const campaignId = '123456';
            const storageSpy = sinon.spy(backend.Api.Storage, 'delete');
            helper.addFile('test1.mp4', 123456, 2);
            helper.addFile('test2.mp4', 123456, 2);
            backend.Api.Storage.setStorageContents({
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

            assert.isTrue(backend.Api.Storage.hasCampaignEntry(campaignId), 'Should have a campaign entry');
            return cacheBookkeeping.cleanCache().then(() => {
                assert.equal(storageSpy.callCount, 0, 'Cache cleanup shouldn\'t have deleted campaign');
                assert.isTrue(backend.Api.Storage.hasCampaignEntry(campaignId), 'Cache cleanup did remove storage entry for campaign');
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should delete the whole cache bookkeeping when there is files on disk but format is old', () => {
            const storageSpy = sinon.spy(backend.Api.Storage, 'delete');
            const cacheSpy = sinon.spy(backend.Api.Cache, 'deleteFile');

            helper.addFile('test1.mp4', 123456, 2);
            helper.addFile('test2.mp4', 123456, 2);

            backend.Api.Storage.setStorageContents({
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
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

        it('should delete the whole cache bookkeeping when there is no files on disk and format is old', () => {
            const storageSpy = sinon.spy(backend.Api.Storage, 'delete');

            backend.Api.Storage.setStorageContents({
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
                assert.isFalse(backend.Api.Storage.isDirty(), 'Cache cleanup left storage dirty');
            });
        });

    });
});
