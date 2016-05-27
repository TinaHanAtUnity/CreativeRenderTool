import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';
import { CallbackContainer } from 'Utilities/CallbackContainer';

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

export class CacheManager {

    private _nativeBridge: NativeBridge;
    private _callbacks: { [key: string]: CallbackContainer } = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
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
            return this.getFileId(url).then(fileId => {
                return this._nativeBridge.Cache.download(url, fileId).then(() => {
                    return this.registerCallback(url).then(cacheResponse => {
                        // todo: add cacheResponse.responseCode handling & retrying here
                        if(cacheResponse.size !== cacheResponse.totalSize) {
                            return [CacheStatus.STOPPED, fileId];
                        }
                        return [CacheStatus.OK, fileId];
                    });
                }).catch(error => {
                    switch(error) {
                        case CacheError[CacheError.FILE_ALREADY_IN_CACHE]:
                            return [CacheStatus.OK, fileId];

                        default:
                            return Promise.reject(error);
                    }
                });
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

            return Promise.all(deleteFiles.map(file => {
                this._nativeBridge.Sdk.logInfo('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files');
                return this._nativeBridge.Cache.deleteFile(file);
            }));
        });
    }

    public getFileId(url: string): Promise<string> {
        let splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return this._nativeBridge.Cache.getHash(url).then(hash => {
            return hash + '.' + extension;
        });
    }

    public getFileUrl(fileId: string): Promise<string> {
        return this._nativeBridge.Cache.getFilePath(fileId).then(filePath => {
            return 'file://' + filePath;
        });
    }

    private registerCallback(url: string): Promise<ICacheResponse> {
        return new Promise<ICacheResponse>((resolve, reject) => {
            this._callbacks[url] = new CallbackContainer(resolve, reject);
        });
    }

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: [string, string][]): void {
        // empty block
    }

    private onDownloadProgress(url: string, size: number, totalSize: number): void {
        this._nativeBridge.Sdk.logDebug('Cache progress for "' + url + '": ' + Math.round(size / totalSize * 100) + '%');
    }

    private onDownloadEnd(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]): void {
        let callback = this._callbacks[url];
        if(callback) {
            let cacheResponse: ICacheResponse = {
                url: url,
                size: size,
                totalSize: totalSize,
                duration: duration,
                responseCode: responseCode,
                headers: headers
            };
            callback.resolve(cacheResponse);
            delete this._callbacks[url];
        }
    }

    private onDownloadStopped(url: string, size: number, totalSize: number, duration: number, responseCode: number, headers: [string, string][]) {
        let callback = this._callbacks[url];
        if(callback) {
            let cacheResponse: ICacheResponse = {
                url: url,
                size: size,
                totalSize: totalSize,
                duration: duration,
                responseCode: responseCode,
                headers: headers
            };
            callback.resolve(cacheResponse);
            delete this._callbacks[url];
        }
    }

    private onDownloadError(error: string, url: string, message: string) {
        let callback = this._callbacks[url];
        if(callback) {
            callback.reject([error, url, message]);
            delete this._callbacks[url];
        }
    }

}
