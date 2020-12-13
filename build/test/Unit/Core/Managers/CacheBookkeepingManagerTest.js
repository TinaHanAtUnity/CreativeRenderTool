import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageType } from 'Core/Native/Storage';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
class TestHelper {
    constructor(cache, storage) {
        this._cache = cache;
        this._storage = storage;
        this._baseTimestamp = new Date().getTime();
    }
    addFile(id, size, ageInDays) {
        this._cache.addFile(id, this._baseTimestamp - (ageInDays * 24 * 60 * 60 * 1000), size);
    }
}
[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(Platform[platform] + ' - CacheBookkeepingManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let cache;
        let cacheBookkeeping;
        let helper;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            cacheBookkeeping = new CacheBookkeepingManager(core);
            cache = new CacheManager(core, wakeUpManager, request, cacheBookkeeping);
            helper = new TestHelper(backend.Api.Cache, backend.Api.Storage);
        });
        it('should keep new files', () => {
            const fileId = 'test.mp4';
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
            const fileId = 'test1.mp4';
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
            const newFileId = 'new.mp4';
            const newFileId2 = 'new2.mp4';
            const oldFileId = 'old.mp4';
            const oldFileId2 = 'old2.mp4';
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
            const smallFileId = 'small.mp4';
            const largeFileId = 'large.mp4';
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
            const fileId = 'test';
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
            const fileId = 'test2.mp4';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVCb29ra2VlcGluZ01hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0NvcmUvTWFuYWdlcnMvQ2FjaGVCb29ra2VlcGluZ01hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxNQUFNLFVBQVU7SUFLWixZQUFZLEtBQVksRUFBRSxPQUFnQjtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVNLE9BQU8sQ0FBQyxFQUFVLEVBQUUsSUFBWSxFQUFFLFNBQWlCO1FBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdB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