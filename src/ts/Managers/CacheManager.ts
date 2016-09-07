import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { JsonParser } from 'Utilities/JsonParser';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';

export enum CacheStatus {
    OK,
    STOPPED,
    FAILED
}

export interface ICacheOptions {
    retries: number;
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
    resolve: Function;
    reject: Function;
    options: ICacheOptions;
}

export class CacheManager {

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _callbacks: { [url: string]: ICallbackObject } = {};
    private _fileIds: { [key: string]: string } = {};

    private static getDefaultCacheOptions(): ICacheOptions {
        return {
            retries: 0
        };
    }

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
        this._nativeBridge.Cache.setProgressInterval(500);
        this._nativeBridge.Cache.onDownloadStarted.subscribe((url, size, totalSize, responseCode, headers) => this.onDownloadStarted(url, size, totalSize, responseCode, headers));
        this._nativeBridge.Cache.onDownloadProgress.subscribe((url, size, totalSize) => this.onDownloadProgress(url, size, totalSize));
        this._nativeBridge.Cache.onDownloadEnd.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadEnd(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadStopped.subscribe((url, size, totalSize, duration, responseCode, headers) => this.onDownloadStopped(url, size, totalSize, duration, responseCode, headers));
        this._nativeBridge.Cache.onDownloadError.subscribe((error, url, message) => this.onDownloadError(error, url, message));
    }

    public cache(url: string, options?: ICacheOptions): Promise<[CacheStatus, string]> {
        if(typeof options === 'undefined') {
            options = CacheManager.getDefaultCacheOptions();
        }

        return this._nativeBridge.Cache.isCaching().then(isCaching => {
            if(isCaching) {
                return Promise.reject(CacheStatus.FAILED);
            }
            return Promise.all([
                this.shouldCache(url),
                this.getFileId(url)
            ]).then(([shouldCache, fileId]) => {
                if(!shouldCache) {
                    return Promise.resolve([CacheStatus.OK, fileId]);
                }

                let promise = this.registerCallback(url, fileId, options);
                this.downloadFile(url, fileId);
                return promise;
            });
        });
    }

    public stop(): void {
        let activeDownload: boolean = false;

        let url: any;
        for(url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                let callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry) {
                    callback.reject(CacheStatus.STOPPED);
                    delete this._callbacks[url];
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
        return this._nativeBridge.Cache.getFiles().then(files => {
            if(!files || !files.length) {
                return Promise.resolve();
            }

            // clean files older than three weeks and limit cache size to 50 megabytes
            let timeThreshold: number = new Date().getTime() - 21 * 24 * 60 * 60 * 1000;
            let sizeThreshold: number = 50 * 1024 * 1024;

            let deleteFiles: string[] = [];
            let totalSize: number = 0;

            // sort files from newest to oldest
            files.sort((n1: IFileInfo, n2: IFileInfo) => {
                return n2.mtime - n1.mtime;
            });

            for(let i: number = 0; i < files.length; i++) {
                let file: IFileInfo = files[i];
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

            let promises: Promise<any>[] = [];

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

        let extension: string;
        let urlFilename: string = url;
        let urlPaths = url.split('/');
        if(urlPaths.length > 1) {
            urlFilename = urlPaths[urlPaths.length - 1];
        }
        let fileExtensions = urlFilename.split('.');
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

    private shouldCache(url: string): Promise<boolean> {
        return this.getFileId(url).then(fileId => {
            return this._nativeBridge.Cache.getFileInfo(fileId).then(fileInfo => {
                if(fileInfo.found && fileInfo.size > 0) {
                    return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'cache.' + fileId).then(rawStoredCacheResponse => {
                        let storedCacheResponse: ICacheResponse = JsonParser.parse(rawStoredCacheResponse);
                        return !storedCacheResponse.fullyDownloaded;
                    });
                } else {
                    return true;
                }
            });
        });
    }

    private downloadFile(url: string, fileId: string): void {
        this._nativeBridge.Cache.download(url, fileId).catch(error => {
            let callback = this._callbacks[url];
            if(callback) {
                switch(error) {
                    case CacheError[CacheError.FILE_ALREADY_CACHING]:
                        this._nativeBridge.Sdk.logError('Unity Ads cache error: attempted to add second download from ' + url + ' to ' + fileId);
                        callback.reject(CacheStatus.FAILED);
                        return;

                    case CacheError[CacheError.NO_INTERNET]:
                        this.handleRetry(callback, url, CacheError[CacheError.NO_INTERNET]);
                        return;

                    default:
                        callback.reject(CacheStatus.FAILED);
                        return;
                }
            }
        });
    }

    private registerCallback(url: string, fileId: string, options: ICacheOptions): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            let callbackObject: ICallbackObject = {
                fileId: fileId,
                networkRetry: false,
                retryCount: 0,
                resolve: resolve,
                reject: reject,
                options: options
            };
            this._callbacks[url] = callbackObject;
        });
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
        let callback = this._callbacks[url];
        if(callback) {
            // todo: add redirect logic here
            if(responseCode !== 200 && responseCode !== 206) {
                let error: DiagnosticError = new DiagnosticError(new Error('HTTP ' + responseCode), {
                    url: url,
                    size: size,
                    totalSize: totalSize,
                    duration: duration,
                    responseCode: responseCode,
                    headers: JSON.stringify(headers)
                });
                Diagnostics.trigger({
                    'type': 'cache_error',
                    'error': error
                });

                this.deleteCacheResponse(url);
                if(size > 0) {
                    this._nativeBridge.Cache.deleteFile(callback.fileId);
                }

                callback.reject(CacheStatus.FAILED);
                delete this._callbacks[url];
            } else {
                this.writeCacheResponse(url, this.createCacheResponse(true, url, size, totalSize, duration, responseCode, headers));
                callback.resolve([CacheStatus.OK, callback.fileId]);
                delete this._callbacks[url];
            }
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        let callback = this._callbacks[url];
        if(callback) {
            this.writeCacheResponse(url, this.createCacheResponse(false, url, size, totalSize, duration, responseCode, headers));
            callback.resolve([CacheStatus.STOPPED, callback.fileId]);
            delete this._callbacks[url];
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
        let callback = this._callbacks[url];
        if(callback) {
            switch(error) {
                case CacheError[CacheError.FILE_IO_ERROR]:
                    this.handleRetry(callback, url, error);
                    return;

                default:
                    callback.reject(CacheStatus.FAILED);
                    delete this._callbacks[url];
                    return;
            }
        }
    }

    private handleRetry(callback: ICallbackObject, url: string, error: string): void {
        if(callback.retryCount < callback.options.retries) {
            callback.retryCount++;
            callback.networkRetry = true;
        } else {
            callback.reject(CacheStatus.FAILED);
            delete this._callbacks[url];
        }
    }

    private onNetworkConnected(): void {
        let url: any;
        for(url in this._callbacks) {
            if(this._callbacks.hasOwnProperty(url)) {
                let callback: ICallbackObject = this._callbacks[url];
                if(callback.networkRetry) {
                    callback.networkRetry = false;
                    this.downloadFile(url, callback.fileId);
                }
            }
        }
    }
}
