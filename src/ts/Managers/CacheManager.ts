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
        this._nativeBridge.Cache.onDownloadStarted.subscribe(this.onDownloadStarted.bind(this));
        this._nativeBridge.Cache.onDownloadEnd.subscribe(this.onDownloadEnd.bind(this));
        this._nativeBridge.Cache.onDownloadStopped.subscribe(this.onDownloadStopped.bind(this));
        this._nativeBridge.Cache.onDownloadError.subscribe(this.onDownloadError.bind(this));
    }

    public cache(url: string): Promise<CacheStatus> {
        let promise = this.registerCallback(url).then(cacheResponse => {
            // todo: add cacheResponse.responseCode handling & retrying here
            if(cacheResponse.size !== cacheResponse.totalSize) {
                return CacheStatus.STOPPED;
            }
            return CacheStatus.OK;
        });
        return this._nativeBridge.Cache.isCaching().then(isCaching => {
            if(isCaching) {
                return Promise.reject(CacheError.FILE_ALREADY_CACHING);
            }
            return this.getFileId(url).then(fileId => {
                return this._nativeBridge.Cache.download(url, fileId).then(() => promise);
            });
        }).catch(error => {
            switch(error) {
                case CacheError[CacheError.FILE_ALREADY_IN_CACHE]:
                    return CacheStatus.OK;

                default:
                    return Promise.reject(error);
            }
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

    private registerCallback(url: string): Promise<ICacheResponse> {
        return new Promise<ICacheResponse>((resolve, reject) => {
            this._callbacks[url] = new CallbackContainer(resolve, reject);
        });
    }

    private getFileId(url: string): Promise<string> {
        let splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return this._nativeBridge.Cache.getHash(url).then(hash => {
            return hash + '.' + extension;
        });

    }

    private onDownloadStarted(url: string, size: number, totalSize: number, responseCode: number, headers: [string, string][]): void {
        // empty block
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
