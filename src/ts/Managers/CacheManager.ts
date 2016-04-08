import { NativeBridge } from 'Native/NativeBridge';
import { BatchInvocation } from 'Native/BatchInvocation';
import { CacheApi, IFileInfo } from 'Native/Api/Cache';

enum CacheStatus {
    OK,
    ERROR
}

export class CacheManager {

    private _urlCallbacks: Object = {};

    constructor() {
        CacheApi.onDownloadEnd.subscribe(this.onDownloadEnd.bind(this));
    }

    public cacheAll(urls: string[]): Promise<any[]> {
        let batch = new BatchInvocation(NativeBridge.getInstance());
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
        NativeBridge.getInstance().invokeBatch(batch);
        return Promise.all(promises).then(urlPairs => {
            let urlMap = {};
            urlPairs.forEach(([url, fileUrl]) => {
                urlMap[url] = fileUrl[0];
            });
            return urlMap;
        });
    }

    public getFileUrl(url: string): Promise<[string, string]> {
        return CacheApi.getFileUrl(url).then(fileUrl => [url, fileUrl]);
    }

    public cleanCache(): Promise<any[]> {
        return CacheApi.getFiles().then(files => {
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

            if(deleteFiles.length > 0) {
                let promises = [];
                let deleteBatch: BatchInvocation = new BatchInvocation(NativeBridge.getInstance());
                promises.push(deleteBatch.queue('Sdk', 'logInfo', ['Unity Ads cache: Deleting ' + deleteFiles.length + ' old files']));

                deleteFiles.forEach((file: string) => {
                    promises.push(deleteBatch.queue('Cache', 'deleteFile', [file]));
                });

                NativeBridge.getInstance().invokeBatch(deleteBatch);
                return Promise.all(promises);
            } else {
                return Promise.resolve();
            }
        });
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
