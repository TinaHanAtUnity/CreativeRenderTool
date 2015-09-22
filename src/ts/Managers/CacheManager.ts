import NativeBridge from 'NativeBridge';

export default class CacheManager {

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe('CACHE', this.onCacheEvent.bind(this));
    }

    private _urlCallbacks: Object = {};

    private _eventHandlers: Object = {
        'DOWNLOAD_END': this.onDownloadEnd
    };

    public cache(url: string, callback: (url: string, fileUrl: string) => void): void {
        let callbackList: Function[] = this._urlCallbacks[url];
        if(callbackList) {
            this._urlCallbacks[url].push(callback);
        } else {
            this._urlCallbacks[url] = [callback];
        }

        let onError: Function = (message: string) => {
            switch(message) {
                case 'FILE_ALREADY_IN_QUEUE':
                    break;

                case 'FILE_ALREADY_IN_CACHE':
                    this.getFileUrl(url, (status: string, fileUrl: string) => {
                        callback(url, fileUrl);
                    });
                    break;

                default:
                    break;
            }
        };

        let onComplete: Function = () => {
            console.log('Caching ' + url);
        };

        this._nativeBridge.invoke('Cache', 'download', [url, false], (status: string, ...parameters: any[]) => {
            if(status === 'OK') {
                onComplete.apply(this, parameters);
            } else {
                onError.apply(this, parameters);
            }
        });
    }

    public cacheAll(urls: string[], callback: (fileUrls: Object) => void): void {
        let callbacks: number = urls.length;
        let fileUrls: Object = {};
        let finishCallback: (url: string, fileUrl: string) => void = (url: string, fileUrl: string) => {
            callbacks--;
            fileUrls[url] = fileUrl;
            if(callbacks === 0) {
                callback(fileUrls);
            }
        };

        urls.forEach((url: string): void => {
            this.cache(url, finishCallback);
        });
    }

    public getFileUrl(url: string, callback: (status: string, fileUrl: string) => void): void {
        this._nativeBridge.invoke('Cache', 'getFileUrl', [url], callback);
    }

    private onDownloadEnd(url: string, size: number, duration: number): void {
        this.getFileUrl(url, (status: string, fileUrl: string): void => {
            let urlCallbacks: Function[] = this._urlCallbacks[url];
            if(urlCallbacks) {
                urlCallbacks.forEach((callback: Function) => {
                    callback(url, fileUrl);
                });
                delete this._urlCallbacks[url];
            }
        });
    }

    private onCacheEvent(id: string, ...parameters: any[]): void {
        let handler: Function = this._eventHandlers[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

}
