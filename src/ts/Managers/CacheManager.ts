import { NativeBridge } from 'Native/NativeBridge';
import { IFileInfo } from 'Native/Api/Cache';
import { CallbackContainer } from 'Utilities/CallbackContainer';


export class CacheManager {

    private _nativeBridge: NativeBridge;
    private _urlCallbacks: Object = {};

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
        this._nativeBridge.Cache.onDownloadEnd.subscribe((url, size, duration) => this.onDownloadEnd(url, size, duration));
    }

    public cacheAll(urls: string[]): Promise<any[]> {
        let promises = urls.map((url: string) => {
            return this._nativeBridge.Cache.download(url, false).then(() => {
                return this.registerCallback(url);
            }).catch(error => {
                switch (error) {
                    case 'FILE_ALREADY_IN_CACHE':
                        return this.getFileUrl(url);

                    case 'FILE_ALREADY_IN_QUEUE':
                        return this.registerCallback(url);

                    default:
                        return Promise.reject(error);
                }
            });
        });
        return Promise.all(promises).then(urlPairs => {
            let urlMap = {};
            urlPairs.forEach(([url, fileUrl]) => {
                urlMap[url] = fileUrl;
            });
            return urlMap;
        });
    }

    public getFileUrl(url: string): Promise<[string, string]> {
        return this._nativeBridge.Cache.getFileUrl(url).then(fileUrl => [url, fileUrl]);
    }

    public cleanCache(): Promise<any[]> {
        return this._nativeBridge.Cache.getFiles().then(files => {
            if (!files || !files.length) {
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

            for (let i: number = 0; i < files.length; i++) {
                let file: IFileInfo = files[i];
                totalSize += file.size;

                if (file.mtime < timeThreshold || totalSize > sizeThreshold) {
                    deleteFiles.push(file.id);
                }
            }

            return Promise.all(deleteFiles.map(file => {
                this._nativeBridge.Sdk.logInfo('Unity Ads cache: Deleting ' + deleteFiles.length + ' old files');
                return this._nativeBridge.Cache.deleteFile(file);
            }));
        });
    }

    private registerCallback(url: string): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let callbackObject = new CallbackContainer(resolve, reject);

            if (this._urlCallbacks[url]) {
                this._urlCallbacks[url].push(callbackObject);
            } else {
                this._urlCallbacks[url] = [callbackObject];
            }
        });
    }

    private onDownloadEnd(url: string, size: number, duration: number): void {
        this.getFileUrl(url).then(([url, fileUrl]) => {
            let urlCallbacks: CallbackContainer[] = this._urlCallbacks[url];
            if (urlCallbacks) {
                urlCallbacks.forEach((callbackObject: CallbackContainer) => {
                    callbackObject.resolve([url, fileUrl]);
                });
                delete this._urlCallbacks[url];
            }
        });
    }

}
