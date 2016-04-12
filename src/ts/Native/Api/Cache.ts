import { NativeBridge } from 'Native/NativeBridge';
import { Observable5, Observable1 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';

enum CacheEvent {
    COULDNT_CREATE_TARGET_FILE,
    COULDNT_REQUEST_STREAM,
    COULDNT_CLOSE_OUTPUT_FILE,
    DOWNLOAD_STARTED,
    DOWNLOAD_RESUMED,
    DOWNLOAD_END,
    DOWNLOAD_STOPPED,
    DOWNLOAD_NO_INTERNET
}

export interface IFileInfo {
    id: string;
    found: boolean;
    size: number;
    mtime: number;
}

export class CacheApi extends NativeApi {

    public onDownloadStarted: Observable1<string> = new Observable1();
    public onDownloadEnd: Observable5<string, number, number, number, [string, string][]> = new Observable5();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Cache');
    }

    public download(url: string, overwrite: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'download', [url, overwrite]);
    }

    public resumeDownload(url: string, fileId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'resumeDownload', [url, fileId]);
    }

    public cancelAllDownloads(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'cancelAllDownloads');
    }

    public getFiles(urls?: string[]): Promise<IFileInfo[]> {
        if(urls && urls.length) {
            return this._nativeBridge.invoke<IFileInfo[][]>(this._apiClass, 'getFiles', [urls]).then(([files]) => files);
        }
        return this._nativeBridge.invoke<IFileInfo[][]>(this._apiClass, 'getFiles').then(([files]) => files);
    }

    public getFileInfo(url: string): Promise<IFileInfo> {
        return this._nativeBridge.invoke<IFileInfo>(this._apiClass, 'getFileInfo', [url]);
    }

    public getFileIdFileInfo(fileId: string): Promise<IFileInfo> {
        return this._nativeBridge.invoke<IFileInfo>(this._apiClass, 'getFileIdFileInfo', [fileId]);
    }

    public getFileUrl(url: string): Promise<string> {
        return this._nativeBridge.invoke<[string]>(this._apiClass, 'getFileUrl', [url]).then(([fileUrl]) => {
            return fileUrl;
        });
    }

    public getFileIdFileUrl(fileId: string): Promise<string> {
        return this._nativeBridge.invoke<string>(this._apiClass, 'getFileIdFileUrl', [fileId]);
    }

    public deleteFile(fileId: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'deleteFile', [fileId]);
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

            case CacheEvent[CacheEvent.DOWNLOAD_END]:
                this.onDownloadEnd.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
