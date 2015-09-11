import NativeBridge = require('NativeBridge');

class CacheManager {

    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        nativeBridge.subscribe('CACHE', this.onCacheEvent.bind(this));
    }

    private _urlCallbacks = {};

    cache(url: string, callback: (url: string, fileUrl: string) => void) {
        this._urlCallbacks[url] = callback;
        this._nativeBridge.invoke("Cache", "download", [url], (status) => {});
    }

    cacheAll(urls: string[], callback: (fileUrls: Object) => void) {
        let callbacks = urls.length;
        let fileUrls = {};
        let finishCallback = (url: string, fileUrl: string) => {
            callbacks--;
            fileUrls[url] = fileUrl;
            if(callbacks === 0) {
                callback(fileUrls);
            }
        };

        urls.forEach((url) => {
            this.cache(url, finishCallback);
        });
    }

    private onDownloadEnd(url: string, size: number, duration: number) {
        this._nativeBridge.invoke("Cache", "getFileUrl", [url], (status, fileUrl) => {
            let urlCallback = this._urlCallbacks[url];
            if(urlCallback) {
                urlCallback(url, fileUrl);
            }
        });
    }

    private _eventHandlers = {
        'DOWNLOAD_END': this.onDownloadEnd
    };

    private onCacheEvent(id: string, ...parameters) {
        let handler = this._eventHandlers[id];
        if(handler) {
            handler.apply(this, parameters);
        }
    }

}

export = CacheManager;