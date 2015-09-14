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
        this._urlCallbacks[url] = callback;
        this._nativeBridge.invoke('Cache', 'download', [url, true]);
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

    private onDownloadEnd(url: string, size: number, duration: number): void {
        this._nativeBridge.invoke('Cache', 'getFileUrl', [url], (status: string, fileUrl: string): void => {
            let urlCallback: Function = this._urlCallbacks[url];
            if(urlCallback) {
                urlCallback(url, fileUrl);
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
