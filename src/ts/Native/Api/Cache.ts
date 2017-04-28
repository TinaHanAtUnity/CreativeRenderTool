import { NativeBridge } from 'Native/NativeBridge';
import { Observable3, Observable6, Observable5 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';
import { AndroidCacheApi } from 'Native/Api/AndroidCache';
import { IosCacheApi } from 'Native/Api/IosCache';
import { Platform } from 'Constants/Platform';

export enum CacheError {
    FILE_IO_ERROR,
    FILE_NOT_FOUND,
    FILE_ALREADY_CACHING,
    NOT_CACHING,
    JSON_ERROR,
    NO_INTERNET,
    MALFORMED_URL,
    NETWORK_ERROR,
    ILLEGAL_STATE,
    INVALID_ARGUMENT
}

export enum CacheEvent {
    DOWNLOAD_STARTED,
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
    public Android: AndroidCacheApi;
    public Ios: IosCacheApi;

    public readonly onDownloadStarted = new Observable5<string, number, number, number, Array<[string, string]>>();
    public readonly onDownloadProgress = new Observable3<string, number, number>();
    public readonly onDownloadEnd = new Observable6<string, number, number, number, number, Array<[string, string]>>();
    public readonly onDownloadStopped = new Observable6<string, number, number, number, number, Array<[string, string]>>();
    public readonly onDownloadError = new Observable3<string, string, string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');

        if(nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosCacheApi(nativeBridge);
        } else {
            this.Android = new AndroidCacheApi(nativeBridge);
        }
    }

    public download(url: string, fileId: string, headers: Array<[string, string]>): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'download', [url, fileId, headers]);
    }

    public stop(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'stop');
    }

    public isCaching(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isCaching');
    }

    public getFiles(): Promise<IFileInfo[]> {
        return this._nativeBridge.invoke<IFileInfo[]>(this._apiClass, 'getFiles');
    }

    public getFileInfo(fileId: string): Promise<IFileInfo> {
        return this._nativeBridge.invoke<IFileInfo>(this._apiClass, 'getFileInfo', [fileId]);
    }

    public getFilePath(fileId: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFilePath', [fileId]);
    }

    public getHash(value: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getHash', [value]);
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

    public getFileContent(fileId: string, encoding: string) {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFileContent', [fileId, encoding]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case CacheEvent[CacheEvent.DOWNLOAD_STARTED]:
                this.onDownloadStarted.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
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
