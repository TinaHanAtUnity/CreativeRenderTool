import { BackendApi } from 'Backend/BackendApi';
import { VideoMetadata } from 'Core/Constants/Android/VideoMetadata';
import { CacheError, CacheEvent, IFileInfo } from 'Core/Native/Cache';

export class Cache extends BackendApi {

    private _filePrefix = '/test/cache/dir/UnityAdsCache-';
    private _internet: boolean = true;
    private _files: { [key: string]: IFileInfo } = {};
    private _currentFile: string;
    private _freeSpace = 123456789;

    public setProgressInterval() {
        return;
    }

    public download(url: string, fileId: string, headers: Array<[string, string]>, append: boolean): Promise<void> {
        const byteCount: number = 12345;
        const duration: number = 6789;
        const responseCode: number = 200;

        if(this._currentFile !== undefined) {
            return Promise.reject(CacheError[CacheError.FILE_ALREADY_CACHING]);
        }

        this.addFile(fileId, 123, 1445875);

        if(this._internet) {
            this._currentFile = url;
            setTimeout(() => {
                delete this._currentFile;
                this._backend.sendEvent('CACHE', CacheEvent[CacheEvent.DOWNLOAD_END], url, byteCount, byteCount, duration, responseCode, []);
            }, 1);
            return Promise.resolve(void(0));
        } else {
            return Promise.reject(CacheError[CacheError.NO_INTERNET]);
        }
    }

    public isCaching(): Promise<boolean> {
        return Promise.resolve(this._currentFile !== undefined);
    }

    public getFilePath(fileId: string): Promise<string> {
        if(fileId in this._files) {
            return Promise.resolve(this._filePrefix + fileId);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public getFiles(): Promise<IFileInfo[]> {
        const files: IFileInfo[] = [];
        for(const key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                files.push(this._files[key]);
            }
        }
        return Promise.resolve(files);
    }

    public getFileInfo(fileId: string): Promise<IFileInfo> {
        if(fileId in this._files) {
            return Promise.resolve(this._files[fileId]);
        }
        return Promise.reject(new Error(CacheError[CacheError.FILE_NOT_FOUND]));
    }

    public getHash(value: string): Promise<string> {
        return Promise.resolve(this.getHashDirect(value));
    }

    public getHashDirect(value: string): string {
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

    public deleteFile(fileId: string): Promise<void> {
        return Promise.resolve(void(0));
    }

    public setInternet(internet: boolean): void {
        this._internet = internet;
    }

    public addFile(id: string, mtime: number, size: number): void {
        const fileInfo: IFileInfo = {id: id, mtime: mtime, size: size, found: true};
        this._files[id] = fileInfo;
    }

    public getExtension(url: string): string {
        const splittedUrl = url.split('.');
        let extension: string = '';
        if(splittedUrl.length > 1) {
            extension = splittedUrl[splittedUrl.length - 1];
        }
        return extension;
    }

    public addPreviouslyDownloadedFile(url: string) {
        this.addFile(this.getHashDirect(url) + '.' + this.getExtension(url), 123, 1445875);
    }

    public getDownloadedFilesCount(): number {
        let fileCount = 0;
        for(const key in this._files) {
            if(this._files.hasOwnProperty(key)) {
                ++fileCount;
            }
        }
        return fileCount;
    }

    public getFreeSpace(): number {
        return this._freeSpace;
    }

    public setFreeSpace(freeSpace: number) {
        this._freeSpace = freeSpace;
    }

    public getVideoInfo(fileId: string) {
        return [640, 360, 10000];
    }

    public getMetaData(fileId: string, metadatas: number[]) {
        const retValue = [];

        for(const metadata of metadatas) {
            switch(metadata) {
                case VideoMetadata.METADATA_KEY_VIDEO_WIDTH:
                    retValue.push([VideoMetadata.METADATA_KEY_VIDEO_WIDTH, 640]);
                    break;

                case VideoMetadata.METADATA_KEY_VIDEO_HEIGHT:
                    retValue.push([VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, 360]);
                    break;

                case VideoMetadata.METADATA_KEY_DURATION:
                    retValue.push([VideoMetadata.METADATA_KEY_DURATION, 10000]);
                    break;

                default:
                // error handling not implemented
            }
        }

        return retValue;
    }

}
