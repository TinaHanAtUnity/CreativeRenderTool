import { CacheError, IFileInfo } from 'Core/Native/Cache';
import { Backend } from 'Backend/Backend';
import { VideoMetadata } from 'Common/Constants/Android/VideoMetadata';

export class Cache {

    public static setProgressInterval() {
        return;
    }

    public static getFiles() {
        return [];
    }

    public static isCaching() {
        return false;
    }

    public static getHash(url: string) {
        let hash = 0;
        if(!url.length) {
            return hash.toString();
        }
        for(let i = 0; i < url.length; i++) {
            const char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    public static getFileInfo(fileId: string): IFileInfo {
        return {
            id: fileId,
            found: true,
            size: 10000,
            mtime: 1481112345
        };
    }

    public static download(url: string, fileId: string) {
        Cache._fileIdMap[fileId] = url;
        Backend.sendEvent('CACHE', 'DOWNLOAD_STARTED', url, 0, 10000, 200, []);
        Backend.sendEvent('CACHE', 'DOWNLOAD_END', url, 10000, 10000, 1000, 200, []);
    }

    public static getFilePath(fileId: string) {
        if(fileId in Cache._fileIdMap) {
            return Cache._fileIdMap[fileId];
        }
        throw CacheError.FILE_NOT_FOUND;
    }

    public static getFileContent(fileId: string, encoding: string) {
        return new Promise((resolve, reject) => {
            window.localStorage.getItem(fileId);
        });
    }

    public static setFileContent(fileId: string, encoding: string, content: string) {
        return new Promise((resolve, reject) => {
            window.localStorage.setItem(fileId, content);

            Cache._fileIdMap[fileId] = content;
            resolve();
        });
    }

    public static getVideoInfo(fileId: string) {
        return [640, 360, 10000];
    }

    public static getMetaData(fileId: string, metadatas: number[]) {
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

    public static getFreeSpace() {
        return 10159440; // same as default DeviceInfo.getFreeSpace
    }

    private static _fileIdMap: { [key: string]: string } = {};

}
