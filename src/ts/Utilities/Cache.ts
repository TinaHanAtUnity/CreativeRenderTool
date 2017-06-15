import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';
import { Video } from 'Models/Assets/Video';
import { Platform } from 'Constants/Platform';
import { VideoMetadata } from 'Constants/Android/VideoMetadata';
import { HttpKafka } from 'Utilities/HttpKafka';

export enum CacheStatus {
    OK,
    STOPPED,
    FAILED
}

enum CacheDiagnosticEvent {
    STARTED,
    RESUMED,
    STOPPED,
    FINISHED,
    REDIRECTED,
    ERROR
}

export interface ICacheOptions {
    retries: number;
    retryDelay: number;
}

export interface ICacheDiagnostics {
    creativeType: string;
    gamerId: string;
    targetGameId: number;
    targetCampaignId: string;
}

export interface ICacheResponse {
    fullyDownloaded: boolean;
    size: number;
    totalSize: number;
    extension: string;
}

export interface ICacheCampaignResponse {
    extension: string;
}

export interface ICacheCampaignsResponse {
    [id: string]: ICacheCampaignResponse;
}

interface ICallbackObject {
    fileId: string;
    networkRetry: boolean;
    retryCount: number;
    networkRetryCount: number;
    paused: boolean;
    startTimestamp: number;
    contentLength: number;
    diagnostics: ICacheDiagnostics;
    resolve: Function;
    reject: Function;
    originalUrl?: string;
}

export class Cache {

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _request: Request;

    private _callbacks: { [url: string]: ICallbackObject } = {};
    private _fileIds: { [key: string]: string } = {};

    private _currentUrl: string;
    private _paused: boolean;

    private _maxRetries: number = 5;
    private _retryDelay: number = 10000;

    private _sendDiagnosticEvents = false;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, options?: ICacheOptions) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._request = request;

        if(options) {
            this._maxRetries = options.retries;
            this._retryDelay = options.retryDelay;
        }

        this._paused = false;

        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

        this._nativeBridge.Cache.setProgressInterval(500);
        this._nativeBridge.Cache.onDownloadStarted.subscribe((url, size, totalSize, responseCode, headers) => this.onDownloadStarted(url, size, totalSize, responseCode, headers));
        this._nativeBridge.Cache.onDownloadProgress.subscribe((url, size, totalSize) => this.onDownloadProgress(url, size, totalSize));
        this._nativeBridge.Cache.onDownloadEnd.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadEnd(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadStopped.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadStopped(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadError.subscribe((error, url, message) => this.onDownloadError(error, url, message));
        this._nativeBridge.Storage.onSet.subscribe((eventType, data) => this.onStorageSet(eventType, data));

        this._nativeBridge.Storage.get<boolean>(StorageType.PUBLIC, 'caching.pause.value').then(paused => {
            this._paused = paused;
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        }).catch(() => {
            // ignore errors, assume caching not paused
        });
    }

    public cache(url: string, diagnostics: ICacheDiagnostics): Promise<[string, string]> {
        return this._nativeBridge.Cache.isCaching().then(isCaching => {
            if(isCaching) {
                throw CacheStatus.FAILED;
            }
            return Promise.all<boolean, string>([
                this.isCached(url),
                this.getFileId(url)
            ]);
        }).then(([isCached, fileId]) => {
            if(isCached) {
                return Promise.resolve([CacheStatus.OK, fileId]);
            }
            const promise = this.registerCallback(url, fileId, this._paused, diagnostics);
            if(!this._paused) {
                this.downloadFile(url, fileId);
            }
            return promise;
        }).then(([status, fileId]: [CacheStatus, string]) => {
            if(status === CacheStatus.OK) {
                return this.getFileUrl(fileId).then(fileUrl => {
                    return [fileId, fileUrl];
                });
            }
            throw status;
        }).catch(error => {
            throw error;
        });
    }

    public isCached(url: string): Promise<boolean> {
        return this.getFileId(url).then(fileId => {
            return this._nativeBridge.Cache.getFileInfo(fileId).then(fileInfo => {
                if(fileInfo.found && fileInfo.size > 0) {
                    return this.getCacheResponse(fileId).then(cacheResponse => {
                        return cacheResponse.fullyDownloaded;
                    });
                }
                return false;
            }).catch(error => {
                // todo: should we do something more intelligent here?
                return false;
            });
        });
    }

    public stop(): void {
        let activeDownload: boolean = false;

        for(const url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry || callback.paused) {
                    this.fulfillCallback(url, CacheStatus.STOPPED);
                } else {
                    activeDownload = true;
                }
            }
        }

        if(activeDownload) {
            this._nativeBridge.Cache.stop();
        }
    }

    public cleanCache(): Promise<any[]> {
        return Promise.all([this.getCacheFilesKeys(), this._nativeBridge.Cache.getFiles(), this.getCacheCampaigns()]).then(([keys, files, campaigns]): Promise<any> => {
            if(!files || !files.length) {
                let campaignCount = 0;
                if (campaigns) {
                    for (const campaign in campaigns) {
                        if (campaigns.hasOwnProperty(campaign)) {
                            campaignCount++;
                        }
                    }
                }
                if((keys && keys.length > 0) || campaignCount > 0) {
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

                for(const file of files) {
                    totalSize += file.size;
                    if(file.mtime < timeThreshold || totalSize > sizeThreshold) {
                        deleteFiles.push(file.id);
                        deleteSize += file.size;
                    } else {
                        keepFiles.push(file.id);
                        keepSize += file.size;
                    }
                }

                if(deleteFiles.length > 0) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files (' + (deleteSize / 1024) + 'kB), keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                } else {
                    this._nativeBridge.Sdk.logInfo('Unity Ads cache: Keeping ' + keepFiles.length + ' cached files (' + (keepSize / 1024) + 'kB)');
                }

                let dirty: boolean = false;

                deleteFiles.map(file => {
                    if(keys.indexOf(this.getFileIdHash(file)) !== -1) {
                        promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + this.getFileIdHash(file)).catch((error) => {
                            Diagnostics.trigger('clean_cache_delete_storage_entry_failed', {
                                cleanCacheError: error,
                                cleanCacheKey: 'cache.files.' + this.getFileIdHash(file),
                                cleanCacheErrorType: 'deleteFiles'
                            });
                        }));
                        dirty = true;
                    }
                    promises.push(this._nativeBridge.Cache.deleteFile(file));
                });

                if(dirty) {
                    promises.push(this._nativeBridge.Storage.write(StorageType.PRIVATE));
                }

                // check consistency of kept files so that bookkeeping and files on device match
                keepFiles.map(file => {
                    promises.push(this.getCacheResponse(file).then(response => {
                        if(response.fullyDownloaded === true) {
                            // file and bookkeeping ok
                            return Promise.all([]);
                        } else {
                            // file not fully downloaded, deleting it
                            return Promise.all([
                                this._nativeBridge.Sdk.logInfo('Unity ads cache: Deleting partial download ' + file),
                                this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + this.getFileIdHash(file)).catch((error) => {
                                    Diagnostics.trigger('clean_cache_delete_storage_entry_failed', {
                                        cleanCacheError: error,
                                        cleanCacheKey: 'cache.files.' + this.getFileIdHash(file),
                                        cleanCacheErrorType: 'keepFiles'
                                    });
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

                return this._nativeBridge.Cache.getFiles().then((cacheFilesLeft) => {
                    const cacheFilesLeftIds: string[] = [];
                    cacheFilesLeft.map(currentFile => {
                        cacheFilesLeftIds.push(this.getFileIdHash(currentFile.id));
                    });
                    let campaignsDirty = false;

                    for(const campaignId in campaigns) {
                        if(campaigns.hasOwnProperty(campaignId)) {
                            for(const currentFileId in campaigns[campaignId]) {
                                if(campaigns[campaignId].hasOwnProperty(currentFileId)) {
                                    if(cacheFilesLeftIds.indexOf(currentFileId) === -1) {
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

    public getFileId(url: string): Promise<string> {
        if(url in this._fileIds) {
            return Promise.resolve(this._fileIds[url]);
        }

        if(url.indexOf('?') !== -1) {
            url = url.split('?')[0];
        }

        let extension: string;
        let urlFilename: string = url;
        const urlPaths = url.split('/');
        if(urlPaths.length > 1) {
            urlFilename = urlPaths[urlPaths.length - 1];
        }
        const fileExtensions = urlFilename.split('.');
        if(fileExtensions.length > 1) {
            extension = fileExtensions[fileExtensions.length - 1];
        }

        return this._nativeBridge.Cache.getHash(url).then(hash => {
            let fileId: string;
            if(extension) {
                fileId = this._fileIds[url] = hash + '.' + extension;
            } else {
                fileId = this._fileIds[url] = hash;
            }
            return fileId;
        });
    }

    public getFileUrl(fileId: string): Promise<string> {
        return this._nativeBridge.Cache.getFilePath(fileId).then(filePath => {
            return 'file://' + filePath;
        });
    }

    public isVideoValid(video: Video): Promise<boolean> {
        return this.getFileId(video.getOriginalUrl()).then(fileId => {
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                return this._nativeBridge.Cache.Ios.getVideoInfo(fileId).then(([width, height, duration]) => {
                    return (width > 0 && height > 0 && duration > 0);
                }).catch(error => {
                    return false;
                });
            } else {
                const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
                return this._nativeBridge.Cache.Android.getMetaData(fileId, metadataKeys).then(results => {
                    let width: number = 0;
                    let height: number = 0;
                    let duration: number = 0;

                    for(const entry of results) {
                        const key = entry[0];
                        const value = entry[1];

                        switch(key) {
                            case VideoMetadata.METADATA_KEY_VIDEO_WIDTH:
                                width = value;
                                break;

                            case VideoMetadata.METADATA_KEY_VIDEO_HEIGHT:
                                height = value;
                                break;

                            case VideoMetadata.METADATA_KEY_DURATION:
                                duration = value;
                                break;

                            default:
                                // unknown key, ignore
                                break;
                        }
                    }

                    return (width > 0 && height > 0 && duration > 0);
                }).catch(error => {
                    return false;
                });
            }
        });
    }

    public isPaused(): boolean {
        return this._paused;
    }

    public writeCachedFileForCampaign(campaignId: string, fileId: string): Promise<void> {
        return this._nativeBridge.Storage.set(StorageType.PRIVATE, 'cache.campaigns.' + campaignId + "." + this.getFileIdHash(fileId), {extension: this.getFileIdExtension(fileId)}).then(() => {
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }

    public setDiagnostics(value: boolean) {
        this._sendDiagnosticEvents = value;
    }

    private deleteCacheBookKeepingData(): Promise<void> {
        return this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache').then(() => {
            return this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }).catch(() => {
            return Promise.resolve();
        });
    }

    private checkAndCleanOldCacheFormat(): Promise<void> {
        return this.getCacheKeys().then((cacheKeys) => {
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

    private downloadFile(url: string, fileId: string): void {
        this._currentUrl = url;
        this._nativeBridge.Cache.download(url, fileId, []).catch(error => {
            const callback = this._callbacks[url];
            if(callback) {
                switch(error) {
                    case CacheError[CacheError.FILE_ALREADY_CACHING]:
                        this._nativeBridge.Sdk.logError('Unity Ads cache error: attempted to add second download from ' + url + ' to ' + fileId);
                        this.fulfillCallback(url, CacheStatus.FAILED);
                        return;

                    case CacheError[CacheError.NO_INTERNET]:
                        this.handleRetry(callback, url, CacheError[CacheError.NO_INTERNET]);
                        return;

                    default:
                        this.fulfillCallback(url, CacheStatus.FAILED);
                        return;
                }
            }
        });
    }

    private registerCallback(url: string, fileId: string, paused: boolean, diagnostics: ICacheDiagnostics, originalUrl?: string): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            const callbackObject: ICallbackObject = {
                fileId: fileId,
                networkRetry: false,
                retryCount: 0,
                networkRetryCount: 0,
                paused: paused,
                startTimestamp: 0,
                contentLength: 0,
                diagnostics: diagnostics,
                resolve: resolve,
                reject: reject,
                originalUrl: originalUrl
            };
            this._callbacks[url] = callbackObject;
        });
    }

    private fulfillCallback(url: string, cacheStatus: CacheStatus) {
        const callback = this._callbacks[url];
        const originalCallback = callback.originalUrl ? this._callbacks[callback.originalUrl] : undefined;
        if(cacheStatus === CacheStatus.FAILED) {
            callback.reject(CacheStatus.FAILED);
            if(originalCallback) {
                originalCallback.reject(CacheStatus.FAILED);
            }
        } else {
            callback.resolve([cacheStatus, callback.fileId]);
            if(originalCallback) {
                originalCallback.resolve([cacheStatus, originalCallback.fileId]);
            }
        }
        if(callback.originalUrl) {
            delete this._callbacks[callback.originalUrl];
        }
        delete this._callbacks[url];
    }

    private createCacheResponse(fullyDownloaded: boolean, size: number, totalSize: number, extension: string): ICacheResponse {
        return {
            fullyDownloaded: fullyDownloaded,
            size: size,
            totalSize: totalSize,
            extension: extension
        };
    }

    private getCacheResponse(fileId: string): Promise<ICacheResponse> {
        return this._nativeBridge.Storage.get<ICacheResponse>(StorageType.PRIVATE, 'cache.files.' + this.getFileIdHash(fileId));
    }

    private writeCacheResponse(fileId: string, cacheResponse: ICacheResponse): void {
        this._nativeBridge.Storage.set(StorageType.PRIVATE, 'cache.files.' + this.getFileIdHash(fileId), cacheResponse);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private deleteCacheResponse(fileId: string): void {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.files.' + this.getFileIdHash(fileId));
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private getCacheKeysForKey(key: string, recursive: boolean): Promise<string[]> {
        return this._nativeBridge.Storage.getKeys(StorageType.PRIVATE, key, recursive).then(keys => {
            return keys;
        }).catch(() => {
            return [];
        });
    }

    private getCacheKeys(): Promise<string[]> {
        return this.getCacheKeysForKey('cache', false);
    }

    private getCacheFilesKeys(): Promise<string[]> {
        return this.getCacheKeysForKey('cache.files', false);
    }

    private getCacheCampaigns(): Promise<object> {
        return this._nativeBridge.Storage.get<ICacheCampaignsResponse>(StorageType.PRIVATE, 'cache.campaigns').then(campaigns => {
            return campaigns;
        }).catch(() => {
            return {};
        });
    }

    private getFileIdHash(fileId: string): string {
        const fileIdSplit = fileId.split(".", 2);
        const fileIdHash = fileIdSplit[0];

        return fileIdHash;
    }

    private getFileIdExtension(fileId: string): string {
        const fileIdSplit = fileId.split(".", 2);
        const fileIdExtension = fileIdSplit[1];

        return fileIdExtension;
    }

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: Array<[string, string]>): void {
        const callback = this._callbacks[url];

        callback.startTimestamp = Date.now();
        callback.contentLength = totalSize;

        if(size === 0) {
            this.writeCacheResponse(callback.fileId, this.createCacheResponse(false, size, totalSize, this.getFileIdExtension(callback.fileId)));
            this.sendDiagnostic(CacheDiagnosticEvent.STARTED, callback);
        } else {
            this.sendDiagnostic(CacheDiagnosticEvent.RESUMED, callback);
        }
    }

    private onDownloadProgress(url: string, size: number, totalSize: number): void {
        this._nativeBridge.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: Array<[string, string]>): void {
        const callback = this._callbacks[url];
        if(callback) {
            if(Request.AllowedResponseCodes.exec(responseCode.toString())) {
                this.writeCacheResponse(callback.fileId, this.createCacheResponse(true, size, totalSize, this.getFileIdExtension(callback.fileId)));
                this.sendDiagnostic(CacheDiagnosticEvent.FINISHED, callback);
                this.fulfillCallback(url, CacheStatus.OK);
                return;
            } else if(Request.RedirectResponseCodes.exec(responseCode.toString())) {
                this.sendDiagnostic(CacheDiagnosticEvent.REDIRECTED, callback);
                this.deleteCacheResponse(callback.fileId);
                if(size > 0) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }
                const location = Request.getHeader(headers, 'location');
                if(location) {
                    let fileId = callback.fileId;
                    let originalUrl = url;
                    if(callback.originalUrl) {
                        fileId = this._callbacks[callback.originalUrl].fileId;
                        originalUrl = callback.originalUrl;
                    }
                    this.registerCallback(location, fileId, false, callback.diagnostics, originalUrl);
                    this.downloadFile(location, fileId);
                    return;
                }
            } else if(responseCode === 416) {
                this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);
                this.handleRequestRangeError(callback, url);
                return;
            }

            this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);

            const error: DiagnosticError = new DiagnosticError(new Error('HTTP ' + responseCode), {
                url: url,
                size: size,
                totalSize: totalSize,
                duration: duration,
                responseCode: responseCode,
                headers: JSON.stringify(headers)
            });
            Diagnostics.trigger('cache_error', error);

            this.deleteCacheResponse(callback.fileId);
            if(size > 0) {
                this._nativeBridge.Cache.deleteFile(callback.fileId);
            }

            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: Array<[string, string]>): void {
        const callback = this._callbacks[url];
        if(callback) {
            this.writeCacheResponse(callback.fileId, this.createCacheResponse(false, size, totalSize, this.getFileIdExtension(callback.fileId)));
            this.sendDiagnostic(CacheDiagnosticEvent.STOPPED, callback);
            if(!callback.paused) {
                this.fulfillCallback(url, CacheStatus.STOPPED);
            }
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
        const callback = this._callbacks[url];
        if(callback) {
            this.sendDiagnostic(CacheDiagnosticEvent.ERROR, callback);

            switch (error) {
                case CacheError[CacheError.NETWORK_ERROR]:
                    this.handleRetry(callback, url, error);
                    return;

                case CacheError[CacheError.NO_INTERNET]:
                    this.handleRetry(callback, url, error);
                    return;

                default:
                    this.fulfillCallback(url, CacheStatus.FAILED);
                    return;
            }
        }
    }

    private handleRetry(callback: ICallbackObject, url: string, error: string): void {
        if(callback.retryCount < this._maxRetries) {
            callback.retryCount++;
            callback.networkRetry = true;

            // note: this timeout may never trigger since timeouts are unreliable when ad unit is not active
            // therefore this method should not assume any previous state and work the same way as system event handlers
            // if this never triggers, retrying will still be triggered from connection events
            setTimeout(() => {
                const retryCallback = this._callbacks[url];
                if(retryCallback && retryCallback.networkRetry) {
                    retryCallback.networkRetry = false;
                    this.downloadFile(url, retryCallback.fileId);
                }
            }, this._retryDelay);
        } else if(callback.networkRetryCount < this._maxRetries) {
            callback.networkRetryCount++;
            callback.networkRetry = true;
        } else {
            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private handleRequestRangeError(callback: ICallbackObject, url: string): void {
        Promise.all([this._nativeBridge.Cache.getFileInfo(callback.fileId), this._request.head(url)]).then(([fileInfo, response]) => {
            const contentLength = Request.getHeader(response.headers, 'Content-Length');

            if(response.responseCode === 200 && fileInfo.found && contentLength && fileInfo.size === parseInt(contentLength, 10) && fileInfo.size > 0) {
                Diagnostics.trigger('cache_desync_fixed', {
                    url: url,
                    responseCode: response.responseCode,
                    fileFound: fileInfo.found,
                    fileSize: fileInfo.size,
                    contentLength: parseInt(contentLength, 10)
                });
                this.writeCacheResponse(callback.fileId, this.createCacheResponse(true, fileInfo.size, fileInfo.size, this.getFileIdExtension(callback.fileId)));
                this.fulfillCallback(url, CacheStatus.OK);
            } else {
                let parsedContentLength = undefined;
                if (contentLength) {
                    parsedContentLength = parseInt(contentLength, 10);
                }
                Diagnostics.trigger('cache_desync_failure', {
                    url: url,
                    responseCode: response.responseCode,
                    fileFound: fileInfo.found,
                    fileSize: fileInfo.size,
                    contentLength: parsedContentLength
                });
                this.deleteCacheResponse(callback.fileId);
                if(fileInfo.found) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }
                this.fulfillCallback(url, CacheStatus.FAILED);
            }
        }).catch((error) => {
            Diagnostics.trigger('cache_desync_failure', {
                url: url,
                error: error,
            });
            this.deleteCacheResponse(callback.fileId);
            this.fulfillCallback(url, CacheStatus.FAILED);
        });
    }

    private onNetworkConnected(): void {
        for(const url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                const callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry) {
                    callback.networkRetry = false;
                    this.downloadFile(url, callback.fileId);
                }
            }
        }
    }

    private pause(paused: boolean): void {
        if(paused === this._paused) {
            return;
        }
        this._paused = paused;

        if(paused) {
            let activeDownload: boolean = false;

            for(const url in this._callbacks) {
                if(this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    callback.paused = true;
                    if(!callback.networkRetry) {
                        activeDownload = true;
                    }
                }
            }

            if(activeDownload) {
                this._nativeBridge.Cache.stop();
            }
        } else {
            for(const url in this._callbacks) {
                if (this._callbacks.hasOwnProperty(url)) {
                    const callback: ICallbackObject = this._callbacks[url];
                    if(callback.paused) {
                        callback.paused = false;
                        this.downloadFile(url, callback.fileId);
                    }
                }
            }
        }
    }

    private onStorageSet(eventType: string, data: any) {
        let deleteValue: boolean = false;

        // note: these match Android and iOS storage event formats for 2.1 and earlier versions
        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            if(data.indexOf('caching.pause.value=true') !== -1) {
                this.pause(true);
                deleteValue = true;
            } else if(data.indexOf('caching.pause.value=false') !== -1) {
                this.pause(false);
                deleteValue = true;
            }
        } else if(this._nativeBridge.getPlatform() === Platform.IOS) {
            if(typeof data['caching.pause.value'] !== 'undefined') {
                if(data['caching.pause.value'] === true) {
                    this.pause(true);
                    deleteValue = true;
                } else {
                    this.pause(false);
                    deleteValue = true;
                }
            }
        }

        if(deleteValue) {
            this._nativeBridge.Storage.delete(StorageType.PUBLIC, 'caching.pause');
            this._nativeBridge.Storage.write(StorageType.PUBLIC);
        }
    }

    private sendDiagnostic(event: CacheDiagnosticEvent, callback: ICallbackObject) {
        if(this._sendDiagnosticEvents) {
            const msg: any = {
                eventTimestamp: Date.now(),
                eventType: CacheDiagnosticEvent[event],
                creativeType: callback.diagnostics.creativeType,
                size: callback.contentLength,
                downloadStartTimestamp: callback.startTimestamp,
                gamerId: callback.diagnostics.gamerId,
                targetGameId: callback.diagnostics.targetGameId,
                targetCampaignId: callback.diagnostics.targetCampaignId
            };
            HttpKafka.sendEvent('events.creativedownload.json', msg);
        }
    }
}
