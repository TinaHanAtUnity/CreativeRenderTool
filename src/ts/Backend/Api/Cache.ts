import { CacheError, CacheEvent, IFileInfo } from 'Core/Native/Cache';
import { Backend } from 'Backend/Backend';

export class Cache {

    private static _filePrefix = '/test/cache/dir/UnityAdsCache-';
    private static _internet: boolean = true;
    private static _files: { [key: string]: IFileInfo } = {};
    private static _currentFile: string;

    public static setProgressInterval() {
        return;
    }

    public static download(url: string, fileId: string, headers: Array<[string, string]>, append: boolean): Promise<void> {
        const byteCount: number = 12345;
        const duration: number = 6789;
        const responseCode: number = 200;

        if(Cache._currentFile !== undefined) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_CACHING]);
        }

        Cache.addFile(fileId, 123, 123);

        if(Cache._internet) {
            Cache._currentFile = url;
            setTimeout(() => {
                delete Cache._currentFile;
                Backend.sendEvent('CACHE', CacheEvent[CacheEvent.DOWNLOAD_END], url, byteCount, byteCount, duration, responseCode, []);
            }, 1);
            return Promise.resolve(void(0));
        } else {
            return Promise.reject(CacheError[CacheError.NO_INTERNET]);
        }
    }

    public static isCaching(): Promise<boolean> {
        return Promise.resolve(Cache._currentFile !== undefined);
    }

    public static getFilePath(fileId: string): Promise<string> {
        if(fileId in Cache._files) {
            return Promise.resolve(Cache._filePrefix + fileId);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public static getFiles(): Promise<IFileInfo[]> {
        const files: IFileInfo[] = [];
        for(const key in Cache._files) {
            if(Cache._files.hasOwnProperty(key)) {
                files.push(Cache._files[key]);
            }
        }
        return Promise.resolve(files);
    }

    public static getFileInfo(fileId: string): Promise<IFileInfo> {
        if(fileId in Cache._files) {
            return Promise.resolve(Cache._files[fileId]);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public static getHash(value: string): Promise<string> {
        return Promise.resolve(Cache.getHashDirect(value));
    }

    public static getHashDirect(value: string): string {
        let hash = 0;
        if(!value.length) {
            return hash.toString();
        }
        for(let i = 0; i < value.length; i++) {
            const char = value.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    public static deleteFile(fileId: string): Promise<void> {
        return Promise.resolve(void(0));
    }

    public static setInternet(internet: boolean): void {
        Cache._internet = internet;
    }

    public static addFile(id: string, mtime: number, size: number): void {
        const fileInfo: IFileInfo = {id: id, mtime: mtime, size: size, found: true};
        Cache._files[id] = fileInfo;
    }

    public static getExtension(url: string): string {
        const splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return extension;
    }

    public static addPreviouslyDownloadedFile(url: string) {
        Cache.addFile(Cache.getHashDirect(url) + '.' + Cache.getExtension(url), 123, 123);
    }

    public static getDownloadedFilesCount(): number {
        let fileCount = 0;
        for(const key in Cache._files) {
            if(Cache._files.hasOwnProperty(key)) {
                ++fileCount;
            }
        }
        return fileCount;
    }

}
