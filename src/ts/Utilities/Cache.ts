import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { JsonParser } from 'Utilities/JsonParser';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Request } from 'Utilities/Request';
import { Video } from 'Models/Video';
import { Platform } from 'Constants/Platform';
import { VideoMetadata } from 'Constants/Android/VideoMetadata';

export enum CacheStatus {
    OK,
    STOPPED,
    FAILED
}

export interface ICacheOptions {
    retries: number;
    retryDelay: number;
}

export interface ICacheResponse {
    fullyDownloaded: boolean;
    url: string;
    size: number;
    totalSize: number;
    duration: number;
    responseCode: number;
    headers: [string, string][];
}

interface ICallbackObject {
    fileId: string;
    networkRetry: boolean;
    retryCount: number;
    networkRetryCount: number;
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

    private _maxRetries: number = 5;
    private _retryDelay: number = 10000;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, request: Request, options?: ICacheOptions) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._request = request;

        if(options) {
            this._maxRetries = options.retries;
            this._retryDelay = options.retryDelay;
        }

        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

        this._nativeBridge.Cache.setProgressInterval(500);
        this._nativeBridge.Cache.onDownloadStarted.subscribe((url, size, totalSize, responseCode, headers) => this.onDownloadStarted(url, size, totalSize, responseCode, headers));
        this._nativeBridge.Cache.onDownloadProgress.subscribe((url, size, totalSize) => this.onDownloadProgress(url, size, totalSize));
        this._nativeBridge.Cache.onDownloadEnd.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadEnd(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadStopped.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadStopped(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadError.subscribe((error, url, message) => this.onDownloadError(error, url, message));
    }

    public cache(url: string): Promise<[string, string]> {
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
                return [CacheStatus.OK, fileId];
            }
            const promise = this.registerCallback(url, fileId);
            this.downloadFile(url, fileId);
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
                if(callback.networkRetry) {
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
        return this._nativeBridge.Cache.getFiles().then((files): Promise<any> => {
            if(!files || !files.length) {
                return Promise.resolve();
            }

            // clean files older than three weeks and limit cache size to 50 megabytes
            const timeThreshold: number = new Date().getTime() - 21 * 24 * 60 * 60 * 1000;
            const sizeThreshold: number = 50 * 1024 * 1024;

            const deleteFiles: string[] = [];
            let totalSize: number = 0;

            // sort files from newest to oldest
            files.sort((n1: IFileInfo, n2: IFileInfo) => {
                return n2.mtime - n1.mtime;
            });

            for(let i = 0; i < files.length; i++) {
                const file: IFileInfo = files[i];
                totalSize += file.size;

                if(file.mtime < timeThreshold || totalSize > sizeThreshold) {
                    deleteFiles.push(file.id);
                }
            }

            if(deleteFiles.length === 0) {
                return Promise.resolve();
            } else {
                this._nativeBridge.Sdk.logInfo('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files');
            }

            const promises: Promise<any>[] = [];

            deleteFiles.map(file => {
                promises.push(this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.' + file));
                promises.push(this._nativeBridge.Cache.deleteFile(file));
            });

            promises.push(this._nativeBridge.Storage.write(StorageType.PRIVATE));

            return Promise.all(promises);
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

    private registerCallback(url: string, fileId: string, originalUrl?: string): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            const callbackObject: ICallbackObject = {
                fileId: fileId,
                networkRetry: false,
                retryCount: 0,
                networkRetryCount: 0,
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

    private createCacheResponse(fullyDownloaded: boolean, url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): ICacheResponse {
        return {
            fullyDownloaded: fullyDownloaded,
            url: url,
            size: size,
            totalSize: totalSize,
            duration: duration,
            responseCode: responseCode,
            headers: headers
        };
    }

    private getCacheResponse(fileId: string): Promise<ICacheResponse> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'cache.' + fileId).then(rawStoredCacheResponse => {
            return <ICacheResponse>JsonParser.parse(rawStoredCacheResponse);
        });
    }

    private writeCacheResponse(url: string, cacheResponse: ICacheResponse): void {
        this._nativeBridge.Storage.set(StorageType.PRIVATE, 'cache.' + this._fileIds[url], JSON.stringify(cacheResponse));
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private deleteCacheResponse(url: string): void {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.' + this._fileIds[url]);
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: [string, string][]): void {
        if(size === 0) {
            this.writeCacheResponse(url, this.createCacheResponse(false, url, size, totalSize, 0, responseCode, headers));
        }
    }

    private onDownloadProgress(url: string, size: number, totalSize: number): void {
        this._nativeBridge.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        const callback = this._callbacks[url];
        if(callback) {
            if(Request.AllowedResponseCodes.exec(responseCode.toString())) {
                this.writeCacheResponse(url, this.createCacheResponse(true, url, size, totalSize, duration, responseCode, headers));
                this.fulfillCallback(url, CacheStatus.OK);
                return;
            } else if(Request.RedirectResponseCodes.exec(responseCode.toString())) {
                this.deleteCacheResponse(url);
                if(size > 0) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }
                const location = Request.getHeader(headers, 'location');
                if(location) {
                    let fileId = callback.fileId;
                    if(callback.originalUrl) {
                        fileId = this._callbacks[callback.originalUrl].fileId;
                    }
                    this.registerCallback(location, fileId, url);
                    this.downloadFile(location, fileId);
                    return;
                }
            } else if(responseCode === 416) {
                this.handleRequestRangeError(callback, url);
                return;
            }

            const error: DiagnosticError = new DiagnosticError(new Error('HTTP ' + responseCode), {
                url: url,
                size: size,
                totalSize: totalSize,
                duration: duration,
                responseCode: responseCode,
                headers: JSON.stringify(headers)
            });
            Diagnostics.trigger('cache_error', error);

            this.deleteCacheResponse(url);
            if(size > 0) {
                this._nativeBridge.Cache.deleteFile(callback.fileId);
            }

            this.fulfillCallback(url, CacheStatus.FAILED);
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        const callback = this._callbacks[url];
        if(callback) {
            this.writeCacheResponse(url, this.createCacheResponse(false, url, size, totalSize, duration, responseCode, headers));
            this.fulfillCallback(url, CacheStatus.STOPPED);
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
        const callback = this._callbacks[url];
        if(callback) {
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
                    url: url
                });
                this.writeCacheResponse(url, this.createCacheResponse(true, url, fileInfo.size, fileInfo.size, 0, 200, response.headers));
                this.fulfillCallback(url, CacheStatus.OK);
            } else {
                Diagnostics.trigger('cache_desync_failure', {
                    url: url
                });
                this.deleteCacheResponse(url);
                if(fileInfo.found) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }
                this.fulfillCallback(url, CacheStatus.FAILED);
            }
        }).catch(() => {
            Diagnostics.trigger('cache_desync_failure', {
                url: url
            });
            this.deleteCacheResponse(url);
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
}
