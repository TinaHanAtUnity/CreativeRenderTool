import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo, CacheError } from 'Native/Api/Cache';

enum CacheStatus {
    OK,
    ERROR
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
    private _callbacks: { [key: string]: { [key: number]: Function } } = {};
    private _queue: string[] = [];

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Cache.onDownloadEnd.subscribe(this.onDownloadEnd.bind(this));
        this._nativeBridge.Cache.onDownloadStopped.subscribe(this.onDownloadStopped.bind(this));
        this._nativeBridge.Cache.onDownloadError.subscribe(this.onDownloadError.bind(this));
    }

    public cache(url: string): Promise<string> {
        if(!this.addUrl(url)) {
            return Promise.reject(new Error(url + ' already in queue'));
        }

        let promise = this.registerCallback(url).then(cacheResponse => {
            // todo: add cacheResponse.responseCode handling & retrying here
            return this._nativeBridge.Cache.getFileUrl(url);
        });

        return this._nativeBridge.Cache.isCaching().then(isCaching => {
            if(isCaching) {
                return promise;
            }
            return this._nativeBridge.Cache.download(url, false).then(() => promise);
        }).catch(error => {
            switch(error) {
                case CacheError[CacheError.FILE_ALREADY_IN_CACHE]:
                    this.removeUrl(url);
                    return this._nativeBridge.Cache.getFileUrl(url);

                case CacheError[CacheError.FILE_ALREADY_CACHING]:
                    return promise;

                default:
                    this.removeUrl(url);
                    return Promise.reject(error);
            }
        });
    }

    public stop(): void {
        this._nativeBridge.Cache.cancel(false);
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

    private addUrl(url: string): boolean {
        if(this._queue.indexOf(url) !== -1) {
            return false;
        }
        this._queue.push(url);
        return true;
    }

    private removeUrl(url: string): boolean {
        if(this._queue.indexOf(url) === -1) {
            return false;
        }
        this._queue = this._queue.filter(queueUrl => queueUrl !== url);
        return true;
    }

    private registerCallback(url): Promise<ICacheResponse> {
        return new Promise<ICacheResponse>((resolve, reject) => {
            let callbackObject: { [key: number]: Function } = {};
            callbackObject[CacheStatus.OK] = resolve;
            callbackObject[CacheStatus.ERROR] = reject;
            this._callbacks[url] = callbackObject;
        });
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
            this.removeUrl(url);
            callback[CacheStatus.OK](cacheResponse);
            delete this._callbacks[url];
        }
        if(this._queue.length > 0) {
            this._nativeBridge.Cache.download(this._queue[0], false);
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
            this.removeUrl(url);
            callback[CacheStatus.OK](cacheResponse);
            delete this._callbacks[url];
        }
    }

    private onDownloadError(error: string, url: string, message: string) {
        let callback = this._callbacks[url];
        if(callback) {
            this.removeUrl(url);
            callback[CacheStatus.ERROR]([error, url, message]);
            delete this._callbacks[url];
        }
    }

}
