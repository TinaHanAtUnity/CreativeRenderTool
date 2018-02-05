import { NativeBridge } from 'Native/NativeBridge';

export class FileId {
    public static getFileId(url: string, nativeBridge: NativeBridge): Promise<string> {
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

        return nativeBridge.Cache.getHash(url).then(hash => {
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
        const fileIdSplit = fileId.split(".", 2);
        return fileIdSplit[0];
    }

    public static getFileIdExtension(fileId: string): string {
        const fileIdSplit = fileId.split(".", 2);
        return fileIdSplit[1];
    }

    public static getFileUrl(fileId: string, nativeBridge: NativeBridge): Promise<string> {
        return nativeBridge.Cache.getFilePath(fileId).then(filePath => {
            return 'file://' + filePath;
        });
    }

    private static _fileIds: { [key: string]: string } = {};
}
