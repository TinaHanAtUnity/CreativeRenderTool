import { Diagnostics } from 'Utilities/Diagnostics';
import { IFileInfo } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { ICacheCampaignsResponse } from 'Utilities/Cache';
import { FileId } from 'Utilities/FileId';

export interface IFileBookkeepingInfo {
    fullyDownloaded: boolean;
    size: number;
    totalSize: number;
    extension: string;
}

export class CacheBookkeeping {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public cleanCache(): Promise<any[]> {
        return Promise.all([this.getFilesKeys(), this._nativeBridge.Cache.getFiles(), this.getCacheCampaigns()]).then(([keys, files, campaigns]: [string[], IFileInfo[], object]): Promise<any> => {
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
                } else {
                    return this.checkAndCleanOldCacheFormat();
                }
            }

            return this.checkAndCleanOldCacheFormat().then(() => {
                // clean files older than three weeks and limit cache size to 50 megabytes
                const promises: Array<Promise<any>> = [];
                const timeThreshold: number = new Date().getTime() - 21 * 24 * 60 * 60 * 1000;
                const sizeThreshold: number = 50 * 1024 * 1024;

                const keepFiles: string[] = [];
                const deleteFiles: string[] = [];
                let totalSize: number = 0;
                let deleteSize: number = 0;
                let keepSize: number = 0;

                // sort files from newest to oldest
                files.sort((n1: IFileInfo, n2: IFileInfo) => {
                    return n2.mtime - n1.mtime;
                });

                for (const file of files) {
                    totalSize += file.size;
                    if (file.mtime < timeThreshold || totalSize > sizeThreshold) {
                        deleteFiles.push(file.id);
                        deleteSize += file.size;
                    } else {
                        keepFiles.push(file.id);
                        keepSize += file.size;
                    }
                }

                if (deleteFiles.length > 0) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files (' + (deleteSize / 1024) + 'kB), keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                } else {
                    this._nativeBridge.Sdk.logInfo('Unity Ads cache: Keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                }

                let dirty: boolean = false;

                deleteFiles.map(file => {
                    if (keys.indexOf(FileId.getFileIdHash(file)) !== -1) {
                        promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + FileId.getFileIdHash(file)).catch((error) => {
                            this._nativeBridge.Sdk.logDebug('Error while removing file storage entry');
                        }));
                        dirty = true;
                    }
                    promises.push(this._nativeBridge.Cache.deleteFile(file));
                });

                if (dirty) {
                    promises.push(this._nativeBridge.Storage.write(StorageType.PRIVATE));
                }

                // check consistency of kept files so that bookkeeping and files on device match
                keepFiles.map(file => {
                    promises.push(this.getFileInfo(file).then((response): Promise<any[]> => {
                        if (response.fullyDownloaded === true) {
                            // file and bookkeeping ok
                            return Promise.all([]);
                        } else {
                            // file not fully downloaded, deleting it
                            return Promise.all([
                                this._nativeBridge.Sdk.logInfo('Unity ads cache: Deleting partial download ' + file),
                                this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + FileId.getFileIdHash(file)).catch((error) => {
                                    this._nativeBridge.Sdk.logDebug('Error while removing file storage entry for partially downloaded file');
                                }),
                                this._nativeBridge.Storage.write(StorageType.PRIVATE),
                                this._nativeBridge.Cache.deleteFile(file)
                            ]);
                        }
                    }).catch(() => {
                        // entry not found in bookkeeping so delete file
                        return Promise.all([
                            this._nativeBridge.Sdk.logInfo('Unity ads cache: Deleting desynced download ' + file),
                            this._nativeBridge.Cache.deleteFile(file)
                        ]);
                    }));
                });

                return Promise.all([this._nativeBridge.Cache.getFiles(), this.getCacheCampaigns()]).then(([cacheFilesLeft, campaignsLeft]: [IFileInfo[], { [key: string]: any }]) => {
                    const cacheFilesLeftIds: string[] = [];
                    cacheFilesLeft.map(currentFile => {
                        cacheFilesLeftIds.push(FileId.getFileIdHash(currentFile.id));
                    });
                    let campaignsDirty = false;

                    for (const campaignId in campaignsLeft) {
                        if (campaignsLeft.hasOwnProperty(campaignId)) {
                            for (const currentFileId in campaignsLeft[campaignId]) {
                                if (campaignsLeft[campaignId].hasOwnProperty(currentFileId)) {
                                    if (cacheFilesLeftIds.indexOf(currentFileId) === -1) {
                                        promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.campaigns.' + campaignId).catch((error) => {
                                            Diagnostics.trigger('clean_cache_delete_storage_entry_failed', {
                                                cleanCacheError: error,
                                                cleanCacheKey: 'cache.campaigns.' + campaignId,
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
                        promises.push(this._nativeBridge.Storage.write(StorageType.PRIVATE));
                    }
                }).then(() => {
                    return Promise.all(promises);
                });
            });
        });
    }

    public writeFileForCampaign(campaignId: string, fileId: string): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, 'cache.campaigns.' + campaignId + "." + FileId.getFileIdHash(fileId), {extension: FileId.getFileIdExtension(fileId)}).then(() => {
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }

    public createFileInfo(fullyDownloaded: boolean, size: number, totalSize: number, extension: string): IFileBookkeepingInfo {
        return {
            fullyDownloaded: fullyDownloaded,
            size: size,
            totalSize: totalSize,
            extension: extension
        };
    }

    public getFileInfo(fileId: string): Promise<IFileBookkeepingInfo> {
        return this._nativeBridge.Storage.get<IFileBookkeepingInfo>(StorageType.PRIVATE, 'cache.files.' + FileId.getFileIdHash(fileId));
    }

    public writeFileEntry(fileId: string, cacheResponse: IFileBookkeepingInfo): void {
        this._nativeBridge.Storage.set(StorageType.PRIVATE, 'cache.files.' + FileId.getFileIdHash(fileId), cacheResponse);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public removeFileEntry(fileId: string): void {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + FileId.getFileIdHash(fileId));
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private deleteCacheBookKeepingData(): Promise<void> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache').then(() => {
            return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }

    private checkAndCleanOldCacheFormat(): Promise<void> {
        return this.getKeys().then((cacheKeys) => {
            if (cacheKeys.length > 2) {
                return this.deleteCacheBookKeepingData();
            }
            for (const cacheKey of cacheKeys) {
                if (cacheKey && cacheKey !== 'files' && cacheKey !== 'campaigns') {
                    return this.deleteCacheBookKeepingData();
                }
            }
            return Promise.resolve();
        }).catch(() => {
            return Promise.resolve();
        });
    }

    private getKeysForKey(key: string, recursive: boolean): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, key, recursive).then(keys => {
            return keys;
        }).catch(() => {
            return [];
        });
    }

    private getKeys(): Promise<string[]> {
        return this.getKeysForKey('cache', false);
    }

    private getFilesKeys(): Promise<string[]> {
        return this.getKeysForKey('cache.files', false);
    }

    private getCacheCampaigns(): Promise<object> {
        return this._nativeBridge.Storage.get<ICacheCampaignsResponse>(StorageType.PRIVATE, 'cache.campaigns').then(campaigns => {
            return campaigns;
        }).catch(() => {
            return {};
        });
    }
}
