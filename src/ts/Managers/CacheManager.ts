import { NativeBridge, PackedCall } from 'NativeBridge';

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
        let promises = urls.map((url: string) => {
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
            }).catch((error, ...parameters: any[]) => {
                console.log('lol');
                switch(error) {
                    case 'FILE_ALREADY_IN_QUEUE':
                        console.log('WTFWTFWTFWTFWTF');
                        break;

                    case 'FILE_ALREADY_IN_CACHE':
                        return this.getFileUrl(url);
                        break;

                    default:
                        break;
                }
            });
        });
        this._nativeBridge.invokeBatch(urls.map((url: string): PackedCall => {
            return ['Cache', 'download', [url, false]];
        }));
        return Promise.all(promises);
    }

    public getFileUrl(url: string): Promise<any[]> {
        return this._nativeBridge.invoke('Cache', 'getFileUrl', [url]);
    }

    private onDownloadEnd(url: string, size: number, duration: number): void {
        this.getFileUrl(url).then((fileUrl) => {
            let urlCallbacks: Function[] = this._urlCallbacks[url];
            if(urlCallbacks) {
                urlCallbacks.forEach((callbackObject: Object) => {
                    callbackObject[CacheStatus.OK](url, fileUrl);
                });
                delete this._urlCallbacks[url];
            }
        });
    }

}
