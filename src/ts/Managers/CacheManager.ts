import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';
import { StorageType } from 'Native/Api/Storage';
import { WakeUpManager } from 'Managers/WakeUpManager';

export enum CacheStatus {
    OK,
    STOPPED
}

export interface ICacheResponse {
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
    resolve: Function;
    reject: Function;
}

export class CacheManager {

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _callbacks: { [url: string]: ICallbackObject } = {};
    private _fileIds: { [key: string]: string } = {};

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

    public cache(url: string): Promise<[CacheStatus, string]> {
        return this._nativeBridge.Cache.isCaching().then(isCaching => {
            if(isCaching) {
                return Promise.reject(CacheError.FILE_ALREADY_CACHING);
            }
            return Promise.all([
                this.shouldCache(url),
                this.getFileId(url)
            ]).then(([shouldCache, fileId]) => {
                if(!shouldCache) {
                    return Promise.resolve([CacheStatus.OK, fileId]);
                }

                let promise = this.registerCallback(url, fileId);
                this.downloadFile(url, fileId);
                return promise;
            });
        });
    }

    public stop(): void {
        this._nativeBridge.Cache.stop();
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

            return Promise.all(deleteFiles.map(file => {
                this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'cache.' + file);
                this._nativeBridge.Storage.write(StorageType.PRIVATE);
                return this._nativeBridge.Cache.deleteFile(file);
            }));
        });
    }

    public getFileId(url: string): Promise<string> {
        if(url in this._fileIds) {
            return Promise.resolve(this._fileIds[url]);
        }
        let splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return this._nativeBridge.Cache.getHash(url).then(hash => {
            let fileId = this._fileIds[url] = hash + '.' + extension;
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
                if(fileInfo.found) {
                    return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'cache.' + fileId).then(rawStoredCacheResponse => {
                        let storedCacheResponse: ICacheResponse = JSON.parse(rawStoredCacheResponse);
                        return fileInfo.size !== storedCacheResponse.totalSize;
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
                        callback.reject(error);
                        return;

                    case CacheError[CacheError.NO_INTERNET]:
                        callback.networkRetry = true;
                        return;

                    default:
                        callback.reject(error);
                        return;
                }
            }
        });
    }

    private registerCallback(url: string, fileId: string): Promise<[CacheStatus, string]> {
        return new Promise<[CacheStatus, string]>((resolve, reject) => {
            let callbackObject: ICallbackObject = {
                fileId: fileId,
                networkRetry: false,
                resolve: resolve,
                reject: reject
            };
            this._callbacks[url] = callbackObject;
        });
    }

    private createCacheResponse(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): ICacheResponse {
        return {
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

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: [string, string][]): void {
        if(size === 0) {
            this.writeCacheResponse(url, this.createCacheResponse(url, size, totalSize, 0, responseCode, headers));
        }
    }

    private onDownloadProgress(url: string, size: number, totalSize: number): void {
        this._nativeBridge.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        let callback = this._callbacks[url];
        if(callback) {
            this._nativeBridge.Cache.getFileInfo(this._fileIds[url]).then(fileInfo => {
                let cacheResponse = this.createCacheResponse(url, size, totalSize, duration, responseCode, headers);
                if(fileInfo.size === totalSize) {
                    this.writeCacheResponse(url, cacheResponse);
                }
                callback.resolve([CacheStatus.OK, callback.fileId]);
                delete this._callbacks[url];
            });
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        let callback = this._callbacks[url];
        if(callback) {
            let cacheResponse = this.createCacheResponse(url, size, totalSize, duration, responseCode, headers);
            this.writeCacheResponse(url, cacheResponse);
            callback.resolve([CacheStatus.STOPPED, callback.fileId]);
            delete this._callbacks[url];
        }
    }

    private onDownloadError(error: string, url: string, message: string): void {
        let callback = this._callbacks[url];
        if(callback) {
            switch(error) {
                case CacheError[CacheError.FILE_IO_ERROR]:
                    callback.networkRetry = true;
                    return;

                default:
                    callback.reject(error);
                    delete this._callbacks[url];
                    return;
            }
        }
    }

    private onNetworkConnected(): void {
        // todo
    }
}
