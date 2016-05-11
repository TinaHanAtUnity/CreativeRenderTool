import { NativeBridge } from 'Native/NativeBridge';
import { Observable1, Observable3, Observable2, Observable6 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

export enum CacheError {
    FILE_IO_ERROR,
    FILE_NOT_FOUND,
    FILE_ALREADY_IN_CACHE,
    FILE_ALREADY_CACHING,
    NOT_CACHING,
    JSON_ERROR,
    NO_INTERNET
}

export enum CacheEvent {
    DOWNLOAD_STARTED,
    DOWNLOAD_RESUMED,
    DOWNLOAD_PROGRESS,
    DOWNLOAD_END,
    DOWNLOAD_STOPPED,
    DOWNLOAD_ERROR
}

export interface IFileInfo {
    id: string;
    found: boolean;
    size: number;
    mtime: number;
}

export class CacheApi extends NativeApi {

    public onDownloadStarted: Observable1<string> = new Observable1();
    public onDownloadResumed: Observable2<string, number> = new Observable2();
    public onDownloadProgress: Observable3<string, number, number> = new Observable3();
    public onDownloadEnd: Observable6<string, number, number, number, number, [string, string][]> = new Observable6();
    public onDownloadStopped: Observable6<string, number, number, number, number, [string, string][]> = new Observable6();
    public onDownloadError: Observable3<string, string, string> = new Observable3();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public download(url: string, overwrite: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'download', [url, overwrite]);
    }

    public isCaching(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isCaching');
    }

    public cancel(remove: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'cancel', [remove]);
    }

    public getFiles(urls?: string[]): Promise<IFileInfo[]> {
        if(urls && urls.length) {
            return this._nativeBridge.invoke<IFileInfo[]>(this._apiClass, 'getFiles', [urls]);
        }
        return this._nativeBridge.invoke<IFileInfo[]>(this._apiClass, 'getFiles');
    }

    public getFileInfo(url: string): Promise<IFileInfo> {
        return this._nativeBridge.invoke<IFileInfo>(this._apiClass, 'getFileInfo', [url]);
    }

    public getFileIdFileInfo(fileId: string): Promise<IFileInfo> {
        return this._nativeBridge.invoke<IFileInfo>(this._apiClass, 'getFileIdFileInfo', [fileId]);
    }

    public getFileUrl(url: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFileUrl', [url]);
    }

    public getFileIdFileUrl(fileId: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFileIdFileUrl', [fileId]);
    }

    public deleteFile(fileId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'deleteFile', [fileId]);
    }

    public setProgressInterval(interval: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setProgressInterval', [interval]);
    }

    public getProgressInterval(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getProgressInterval');
    }

    public setTimeouts(connectTimeout: number, readTimeout: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setTimeouts', [connectTimeout, readTimeout]);
    }

    public getTimeouts(): Promise<[number, number]> {
        return this._nativeBridge.invoke<[number, number]>(this._apiClass, 'getTimeouts');
    }

    public getFreeSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getFreeSpace');
    }

    public getTotalSpace(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._apiClass, 'getTotalSpace');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case CacheEvent[CacheEvent.DOWNLOAD_STARTED]:
                this.onDownloadStarted.trigger(parameters[0]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_RESUMED]:
                this.onDownloadResumed.trigger(parameters[0], parameters[1]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_PROGRESS]:
                this.onDownloadProgress.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_END]:
                this.onDownloadEnd.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_STOPPED]:
                this.onDownloadStopped.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_ERROR]:
                this.onDownloadError.trigger(parameters[0], parameters[1], parameters[2]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
