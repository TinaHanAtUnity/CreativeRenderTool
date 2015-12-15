import { NativeBridge, BatchInvocation } from 'NativeBridge';

enum CacheStatus {
    OK,
    ERROR
}

export class CacheManager {

    private _nativeBridge: NativeBridge;
    private _urlCallbacks: Object = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe({
            'CACHE_DOWNLOAD_END': this.onDownloadEnd.bind(this)
        });
    }

    public cache(url: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let callbackObject = {};
            callbackObject[CacheStatus.OK] = resolve;
            callbackObject[CacheStatus.ERROR] = reject;

            let callbackList: Function[] = this._urlCallbacks[url];
            if(callbackList) {
                this._urlCallbacks[url].push(callbackObject);
            } else {
                this._urlCallbacks[url] = [callbackObject];
            }

            this._nativeBridge.invoke('Cache', 'download', [url, false]);
        });
    }

    public cacheAll(urls: string[]): Promise<any[]> {
        let batch = new BatchInvocation(this._nativeBridge);
        let promises = urls.map((url: string) => {
            return batch.queue('Cache', 'download', [url, false]).then(() => {
                return this.registerCallback(url);
            }).catch((error) => {
                let errorCode = error.shift();
                switch(errorCode) {
                    case 'FILE_ALREADY_IN_CACHE':
                        return this.getFileUrl(url);

                    case 'FILE_ALREADY_IN_QUEUE':
                        return this.registerCallback(url);

                    default:
                        return Promise.reject(error);
                }
            });
        });
        this._nativeBridge.invokeBatch(batch);
        return Promise.all(promises).then((urlPairs) => {
            let urlMap = {};
            urlPairs.forEach(([url, fileUrl]) => {
                urlMap[url] = fileUrl;
            });
            return urlMap;
        });
    }

    public getFileUrl(url: string): Promise<any[]> {
        return this._nativeBridge.invoke('Cache', 'getFileUrl', [url]).then(([fileUrl]) => [url, fileUrl]);
    }

    private registerCallback(url): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let callbackObject = {};
            callbackObject[CacheStatus.OK] = resolve;
            callbackObject[CacheStatus.ERROR] = reject;

            let callbackList: Function[] = this._urlCallbacks[url];
            if(callbackList) {
                this._urlCallbacks[url].push(callbackObject);
            } else {
                this._urlCallbacks[url] = [callbackObject];
            }
        });
    }

    private onDownloadEnd(url: string, size: number, duration: number): void {
        this.getFileUrl(url).then(([url, fileUrl]) => {
            let urlCallbacks: Function[] = this._urlCallbacks[url];
            if(urlCallbacks) {
                urlCallbacks.forEach((callbackObject: Object) => {
                    callbackObject[CacheStatus.OK]([url, fileUrl]);
                });
                delete this._urlCallbacks[url];
            }
        });
    }

}
