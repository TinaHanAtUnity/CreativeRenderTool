import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FileId } from 'Core/Utilities/FileId';
var CacheKey;
(function (CacheKey) {
    CacheKey["CAMPAIGN"] = "campaign";
    CacheKey["FILES"] = "files";
    CacheKey["CAMPAIGNS"] = "campaigns";
})(CacheKey || (CacheKey = {}));
export class CacheBookkeepingManager {
    constructor(core) {
        this._rootKey = 'cache';
        this._core = core;
    }
    cleanCache() {
        return Promise.all([this.getFilesKeys(), this._core.Cache.getFiles(), this.getCacheCampaigns()]).then(([keys, files, campaigns]) => {
            if (!files || !files.length) {
                let campaignCount = 0;
                if (campaigns) {
                    for (const campaign in campaigns) {
                        if (campaigns.hasOwnProperty(campaign)) {
                            campaignCount++;
                        }
                    }
                }
                if ((keys && keys.length > 0) || campaignCount > 0) {
                    return this.deleteCacheBookKeepingData();
                }
                else {
                    return this.cleanCacheBookKeeping();
                }
            }
            return this.cleanCacheBookKeeping().then(() => {
                // clean files older than three weeks and limit cache size to 50 megabytes
                const promises = [];
                const timeThreshold = new Date().getTime() - 21 * 24 * 60 * 60 * 1000;
                const sizeThreshold = 50 * 1024 * 1024;
                const keepFiles = [];
                const deleteFiles = [];
                let totalSize = 0;
                let deleteSize = 0;
                let keepSize = 0;
                // sort files from newest to oldest
                files.sort((n1, n2) => {
                    return n2.mtime - n1.mtime;
                });
                for (const file of files) {
                    totalSize += file.size;
                    if (file.mtime < timeThreshold || totalSize > sizeThreshold) {
                        deleteFiles.push(file.id);
                        deleteSize += file.size;
                    }
                    else {
                        keepFiles.push(file.id);
                        keepSize += file.size;
                    }
                }
                if (deleteFiles.length > 0) {
                    this._core.Sdk.logDebug('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files (' + (deleteSize / 1024) + 'kB), keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                }
                else {
                    this._core.Sdk.logDebug('Unity Ads cache: Keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                }
                let dirty = false;
                deleteFiles.map(file => {
                    if (keys.indexOf(FileId.getFileIdHash(file)) !== -1) {
                        promises.push(this._core.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(file))).catch((error) => {
                            this._core.Sdk.logDebug('Error while removing file storage entry');
                        }));
                        dirty = true;
                    }
                    promises.push(this._core.Cache.deleteFile(file));
                });
                if (dirty) {
                    promises.push(this._core.Storage.write(StorageType.PRIVATE));
                }
                // check consistency of kept files so that bookkeeping and files on device match
                keepFiles.map(file => {
                    promises.push(this.getFileInfo(file).then((response) => {
                        if (response.fullyDownloaded === true) {
                            // file and bookkeeping ok
                            return Promise.all([]);
                        }
                        else {
                            // file not fully downloaded, deleting it
                            return Promise.all([
                                this._core.Sdk.logDebug('Unity ads cache: Deleting partial download ' + file),
                                this._core.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(file))).catch((error) => {
                                    this._core.Sdk.logDebug('Error while removing file storage entry for partially downloaded file');
                                }),
                                this._core.Storage.write(StorageType.PRIVATE),
                                this._core.Cache.deleteFile(file)
                            ]);
                        }
                    }).catch(() => {
                        // entry not found in bookkeeping so delete file
                        return Promise.all([
                            this._core.Sdk.logDebug('Unity ads cache: Deleting desynced download ' + file),
                            this._core.Cache.deleteFile(file)
                        ]);
                    }));
                });
                return Promise.all([this._core.Cache.getFiles(), this.getCacheCampaigns()]).then(([cacheFilesLeft, campaignsLeft]) => {
                    const cacheFilesLeftIds = [];
                    cacheFilesLeft.map(currentFile => {
                        cacheFilesLeftIds.push(FileId.getFileIdHash(currentFile.id));
                    });
                    let campaignsDirty = false;
                    for (const campaignId in campaignsLeft) {
                        if (campaignsLeft.hasOwnProperty(campaignId)) {
                            for (const currentFileId in campaignsLeft[campaignId]) {
                                if (campaignsLeft[campaignId].hasOwnProperty(currentFileId)) {
                                    if (cacheFilesLeftIds.indexOf(currentFileId) === -1) {
                                        promises.push(this._core.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS, campaignId)).catch((error) => {
                                            Diagnostics.trigger('clean_cache_delete_storage_entry_failed', {
                                                cleanCacheError: error,
                                                cleanCacheKey: this.makeCacheKey(CacheKey.CAMPAIGNS, campaignId),
                                                cleanCacheErrorType: 'deleteUncachedCampaign'
                                            });
                                        }));
                                        campaignsDirty = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (campaignsDirty) {
                        promises.push(this._core.Storage.write(StorageType.PRIVATE));
                    }
                }).then(() => {
                    return Promise.all(promises);
                });
            });
        });
    }
    writeFileForCampaign(campaignId, fileId) {
        return this._core.Storage.set(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS, campaignId, FileId.getFileIdHash(fileId)), { extension: FileId.getFileIdExtension(fileId) }).then(() => {
            this._core.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }
    createFileInfo(fullyDownloaded, size, totalSize, extension) {
        return {
            fullyDownloaded: fullyDownloaded,
            size: size,
            totalSize: totalSize,
            extension: extension
        };
    }
    getFileInfo(fileId) {
        return this._core.Storage.get(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)));
    }
    writeFileEntry(fileId, cacheResponse) {
        this._core.Storage.set(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)), cacheResponse);
        this._core.Storage.write(StorageType.PRIVATE);
    }
    removeFileEntry(fileId) {
        this._core.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)));
        this._core.Storage.write(StorageType.PRIVATE);
    }
    deleteCacheBookKeepingData() {
        return this._core.Storage.delete(StorageType.PRIVATE, this._rootKey).then(() => {
            return this._core.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }
    cleanCacheBookKeeping() {
        return this.getKeys().then((cacheKeys) => {
            const promises = cacheKeys
                .filter(cacheKey => cacheKey && !(cacheKey.toUpperCase() in CacheKey))
                .map(cacheKey => this._core.Storage.delete(StorageType.PRIVATE, this._rootKey + '.' + cacheKey));
            if (promises.length > 0) {
                return Promise.all(promises).catch(() => {
                    return Promise.resolve();
                }).then(() => {
                    return this._core.Storage.write(StorageType.PRIVATE);
                }).catch(() => {
                    return Promise.resolve();
                });
            }
            return Promise.resolve();
        }).catch(() => {
            return Promise.resolve();
        });
    }
    getKeysForKey(key, recursive) {
        return this._core.Storage.getKeys(StorageType.PRIVATE, key, recursive).then(keys => {
            return keys;
        }).catch(() => {
            return [];
        });
    }
    getKeys() {
        return this.getKeysForKey(this._rootKey, false);
    }
    getFilesKeys() {
        return this.getKeysForKey(this.makeCacheKey(CacheKey.FILES), false);
    }
    makeCacheKey(key, ...subKeys) {
        let finalKey = this._rootKey + '.' + key;
        if (subKeys && subKeys.length > 0) {
            finalKey = subKeys.reduce((previousValue, currentValue) => previousValue + '.' + currentValue, finalKey);
        }
        return finalKey;
    }
    getCacheCampaigns() {
        return this._core.Storage.get(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS)).then(campaigns => {
            return campaigns;
        }).catch(() => {
            return {};
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGVCb29ra2VlcGluZ01hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9NYW5hZ2Vycy9DYWNoZUJvb2trZWVwaW5nTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQVMvQyxJQUFLLFFBSUo7QUFKRCxXQUFLLFFBQVE7SUFDVCxpQ0FBcUIsQ0FBQTtJQUNyQiwyQkFBZSxDQUFBO0lBQ2YsbUNBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUpJLFFBQVEsS0FBUixRQUFRLFFBSVo7QUFFRCxNQUFNLE9BQU8sdUJBQXVCO0lBSWhDLFlBQVksSUFBYztRQUZsQixhQUFRLEdBQVcsT0FBTyxDQUFDO1FBRy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxVQUFVO1FBQ2IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFrQyxFQUFvQixFQUFFO1lBQ2xMLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFO2dCQUN6QixJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7Z0JBQ3RCLElBQUksU0FBUyxFQUFFO29CQUNYLEtBQUssTUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUM5QixJQUFJLFNBQVMsQ0FBQyxj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