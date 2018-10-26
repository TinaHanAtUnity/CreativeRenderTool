import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IFileInfo } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { ICacheCampaignsResponse } from 'Core/Utilities/Cache';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FileId } from 'Core/Utilities/FileId';
import { INativeResponse } from 'Core/Utilities/Request';

export interface IFileBookkeepingInfo {
    fullyDownloaded: boolean;
    size: number;
    totalSize: number;
    extension: string;
}

enum CacheKey {
    CAMPAIGN = 'campaign', // todo: key for legacy backup campaigns, remove in early 2019
    FILES = 'files',
    CAMPAIGNS = 'campaigns'
}

export class CacheBookkeeping {
    private _nativeBridge: NativeBridge;
    private _rootKey: string = 'cache';

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
                    return this.cleanCacheBookKeeping();
                }
            }

            return this.cleanCacheBookKeeping().then(() => {
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
                    this._nativeBridge.Sdk.logDebug('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files (' + (deleteSize / 1024) + 'kB), keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                } else {
                    this._nativeBridge.Sdk.logDebug('Unity Ads cache: Keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                }

                let dirty: boolean = false;

                deleteFiles.map(file => {
                    if (keys.indexOf(FileId.getFileIdHash(file)) !== -1) {
                        promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(file))).catch((error) => {
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
                                this._nativeBridge.Sdk.logDebug('Unity ads cache: Deleting partial download ' + file),
                                this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(file))).catch((error) => {
                                    this._nativeBridge.Sdk.logDebug('Error while removing file storage entry for partially downloaded file');
                                }),
                                this._nativeBridge.Storage.write(StorageType.PRIVATE),
                                this._nativeBridge.Cache.deleteFile(file)
                            ]);
                        }
                    }).catch(() => {
                        // entry not found in bookkeeping so delete file
                        return Promise.all([
                            this._nativeBridge.Sdk.logDebug('Unity ads cache: Deleting desynced download ' + file),
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
                                        promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS, campaignId)).catch((error) => {
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
                        promises.push(this._nativeBridge.Storage.write(StorageType.PRIVATE));
                    }
                }).then(() => {
                    return Promise.all(promises);
                });
            });
        });
    }

    public writeFileForCampaign(campaignId: string, fileId: string): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS, campaignId, FileId.getFileIdHash(fileId)), {extension: FileId.getFileIdExtension(fileId)}).then(() => {
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
        return this._nativeBridge.Storage.get<IFileBookkeepingInfo>(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)));
    }

    public writeFileEntry(fileId: string, cacheResponse: IFileBookkeepingInfo): void {
        this._nativeBridge.Storage.set(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)), cacheResponse);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public removeFileEntry(fileId: string): void {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.FILES, FileId.getFileIdHash(fileId)));
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    // todo: This method exists for legacy backup campaign implementation that was live from April 2018 to October 2018. It should be removed in early 2019.
    public deleteCachedCampaignResponse(): Promise<any> {
        const cacheCampaignUrlPromise = this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGN, 'url'));
        const cachedCampaignResponsePromise = this._nativeBridge.Storage.delete(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGN, 'response'));

        return Promise.all([cacheCampaignUrlPromise, cachedCampaignResponsePromise]).then(() => this._nativeBridge.Storage.write(StorageType.PRIVATE)).catch(error => {
            // ignore error
        });
    }

    private deleteCacheBookKeepingData(): Promise<void> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, this._rootKey).then(() => {
            return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }

    private cleanCacheBookKeeping(): Promise<void> {
        return this.getKeys().then((cacheKeys) => {
            const promises: Array<Promise<any>> = cacheKeys
                .filter(cacheKey => cacheKey && !(cacheKey.toUpperCase() in CacheKey))
                .map(cacheKey => this._nativeBridge.Storage.delete(StorageType.PRIVATE, this._rootKey + '.' + cacheKey));

            if(promises.length > 0) {
                return Promise.all(promises).catch(() => {
                    return Promise.resolve();
                }).then(() => {
                    return this._nativeBridge.Storage.write(StorageType.PRIVATE);
                }).catch(() => {
                    return Promise.resolve();
                });
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
        return this.getKeysForKey(this._rootKey, false);
    }

    private getFilesKeys(): Promise<string[]> {
        return this.getKeysForKey(this.makeCacheKey(CacheKey.FILES), false);
    }

    private makeCacheKey(key: CacheKey, ...subKeys: string[]): string {
        let finalKey = this._rootKey + '.' + key;
        if(subKeys && subKeys.length > 0) {
            finalKey = subKeys.reduce((previousValue, currentValue) => previousValue + '.' + currentValue, finalKey);
        }

        return finalKey;
    }

    private getCacheCampaigns(): Promise<object> {
        return this._nativeBridge.Storage.get<ICacheCampaignsResponse>(StorageType.PRIVATE, this.makeCacheKey(CacheKey.CAMPAIGNS)).then(campaigns => {
            return campaigns;
        }).catch(() => {
            return {};
        });
    }
}
