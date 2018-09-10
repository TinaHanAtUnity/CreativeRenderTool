import { CacheApi } from 'Core/Native/Cache';

export class FileId {
    public static getFileId(url: string, cache: CacheApi): Promise<string> {
        if(url in this._fileIds) {
            return Promise.resolve(this._fileIds[url]);
        }

        if(url.indexOf('?') !== -1) {
            url = url.split('?')[0];
        }

        let extension: string;
        let urlFilename: string = url;
        const urlPaths = url.split('/');
        if(urlPaths.length > 1) {
            urlFilename = urlPaths[urlPaths.length - 1];
        }
        const fileExtensions = urlFilename.split('.');
        if(fileExtensions.length > 1) {
            extension = fileExtensions[fileExtensions.length - 1];
        }

        return cache.getHash(url).then(hash => {
            let fileId: string;
            if(extension) {
                fileId = this._fileIds[url] = hash + '.' + extension;
            } else {
                fileId = this._fileIds[url] = hash;
            }
            return fileId;
        });
    }

    public static getFileIdHash(fileId: string): string {
        const fileIdSplit = fileId.split('.', 2);
        return fileIdSplit[0];
    }

    public static getFileIdExtension(fileId: string): string {
        const fileIdSplit = fileId.split('.', 2);
        return fileIdSplit[1];
    }

    public static getFileUrl(fileId: string, cache: CacheApi): Promise<string> {
        return cache.getFilePath(fileId).then(filePath => {
            return 'file://' + filePath;
        });
    }

    public static setFileID(url: string, fileId: string) {
        this._fileIds[url] = fileId;
    }

    private static _fileIds: { [key: string]: string } = {};
}
