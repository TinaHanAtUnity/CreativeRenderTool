import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class FileId {
    public static getFileId(url: string, nativeBridge: NativeBridge): Promise<string> {
        let modifiedUrl = url;
        if(modifiedUrl in this._fileIds) {
            return Promise.resolve(this._fileIds[modifiedUrl]);
        }

        if(modifiedUrl.indexOf('?') !== -1) {
            modifiedUrl = modifiedUrl.split('?')[0];
        }

        let extension: string;
        let urlFilename: string = modifiedUrl;
        const urlPaths = modifiedUrl.split('/');
        if(urlPaths.length > 1) {
            urlFilename = urlPaths[urlPaths.length - 1];
        }
        const fileExtensions = urlFilename.split('.');
        if(fileExtensions.length > 1) {
            extension = fileExtensions[fileExtensions.length - 1];
        }

        return nativeBridge.Cache.getHash(modifiedUrl).then(hash => {
            let fileId: string;
            if(extension) {
                fileId = this._fileIds[modifiedUrl] = hash + '.' + extension;
            } else {
                fileId = this._fileIds[modifiedUrl] = hash;
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

    public static getFileUrl(fileId: string, nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Cache.getFilePath(fileId).then(filePath => {
            return 'file://' + filePath;
        });
    }

    public static setFileID(url: string, fileId: string) {
        this._fileIds[url] = fileId;
    }

    private static _fileIds: { [key: string]: string } = {};
}
