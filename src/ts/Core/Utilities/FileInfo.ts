import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IFileInfo } from 'Core/Native/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { FileId } from 'Core/Utilities/FileId';

export class FileInfo {
    public static getFileInfo(nativeBridge: NativeBridge, fileId: string): Promise<IFileInfo | undefined> {
        return nativeBridge.Cache.getFileInfo(fileId).catch(() => {
            return Promise.resolve(undefined);
        });
    }

    public static isCached(cache: CacheApi, cacheBookkeeping: CacheBookkeeping, url: string): Promise<boolean> {
        return FileId.getFileId(url, cache).then(fileId => {
            return this.getFileInfo(cache, fileId).then(fileInfo => {
                if(fileInfo && fileInfo.found && fileInfo.size > 0) {
                    return cacheBookkeeping.getFileInfo(fileId).then(cacheResponse => {
                        return cacheResponse.fullyDownloaded;
                    }).catch(() => {
                        return false;
                    });
                }
                return false;
            });
        });
    }
}
