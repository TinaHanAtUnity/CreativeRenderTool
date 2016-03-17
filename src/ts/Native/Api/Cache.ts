import {NativeBridge} from 'Native/NativeBridge';
import {Observable5} from "../../Utilities/Observable";
export class Cache {

    public static onDownloadEnd: Observable5<string, number, number, number, [string, string][]>;

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

}
