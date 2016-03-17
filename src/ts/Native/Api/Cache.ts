import {NativeBridge} from 'Native/NativeBridge';
import {Observable5, Observable1} from "../../Utilities/Observable";

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

export class Cache {

    public static onDownloadStarted: Observable1<string> = new Observable1();
    public static onDownloadEnd: Observable5<string, number, number, number, [string, string][]> = new Observable5();

    private static ApiClass = 'Cache';

    public static download(url: string, overwrite: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Cache.ApiClass, 'download', [url, overwrite]);
    }

    public static resumeDownload(url: string, fileId: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Cache.ApiClass, 'resumeDownload', [url, fileId]);
    }

    public static cancelAllDownloads(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Cache.ApiClass, 'cancelAllDownloads');
    }

    public static getFiles(urls?: string[]): Promise<Object[]> {
        return NativeBridge.getInstance().invoke<Object[]>(Cache.ApiClass, 'getFiles', [urls]);
    }

    public static getFileInfo(url: string): Promise<Object> {
        return NativeBridge.getInstance().invoke<Object>(Cache.ApiClass, 'getFileInfo', [url]);
    }

    public static getFileIdFileInfo(fileId: string): Promise<Object> {
        return NativeBridge.getInstance().invoke<Object>(Cache.ApiClass, 'getFileIdFileInfo', [fileId]);
    }

    public static getFileUrl(url: string): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(Cache.ApiClass, 'getFileUrl', [url]);
    }

    public static getFileIdFileUrl(fileId: string): Promise<string> {
        return NativeBridge.getInstance().invoke<string>(Cache.ApiClass, 'getFileIdFileUrl', [fileId]);
    }

    public static deleteFile(fileId: string): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Cache.ApiClass, 'deleteFile', [fileId]);
    }

    public static setTimeouts(connectTimeout: number, readTimeout: number): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(Cache.ApiClass, 'setTimeouts', [connectTimeout, readTimeout]);
    }

    public static getTimeouts(): Promise<[number, number]> {
        return NativeBridge.getInstance().invoke<[number, number]>(Cache.ApiClass, 'getTimeouts');
    }

    public static getFreeSpace(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Cache.ApiClass, 'getFreeSpace');
    }

    public static getTotalSpace(): Promise<number> {
        return NativeBridge.getInstance().invoke<number>(Cache.ApiClass, 'getTotalSpace');
    }

    public static handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case CacheEvent[CacheEvent.DOWNLOAD_STARTED]:
                Cache.onDownloadStarted.trigger(parameters[0]);
                break;

            case CacheEvent[CacheEvent.DOWNLOAD_END]:
                Cache.onDownloadEnd.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;

            default:
                throw new Error('Cache event ' + event + ' does not have an observable');
        }
    }

}
