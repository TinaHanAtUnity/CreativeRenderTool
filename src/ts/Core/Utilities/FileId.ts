import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class FileId {
    public static getFileId(url: string, nativeBridge: NativeBridge): Promise<string> {
        let _url = url;
        if(_url in this._fileIds) {
            return Promise.resolve(this._fileIds[_url]);
        }

        if(_url.indexOf('?') !== -1) {
            _url = _url.split('?')[0];
        }

        let extension: string;
        let urlFilename: string = _url;
        const urlPaths = _url.split('/');
        if(urlPaths.length > 1) {
            urlFilename = urlPaths[urlPaths.length - 1];
        }
        const fileExtensions = urlFilename.split('.');
        if(fileExtensions.length > 1) {
            extension = fileExtensions[fileExtensions.length - 1];
        }

        return nativeBridge.Cache.getHash(_url).then(hash => {
            let fileId: string;
            if(extension) {
                fileId = this._fileIds[_url] = hash + '.' + extension;
            } else {
                fileId = this._fileIds[_url] = hash;
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
