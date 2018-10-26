import { CacheBookkeepingManager } from 'Core/Managers/CacheBookkeepingManager';
import { CacheApi, IFileInfo } from 'Core/Native/Cache';
import { FileId } from 'Core/Utilities/FileId';

export class FileInfo {
    public static getFileInfo(cache: CacheApi, fileId: string): Promise<IFileInfo | undefined> {
        return cache.getFileInfo(fileId).catch(() => {
            return Promise.resolve(undefined);
        });
    }

    public static isCached(cache: CacheApi, cacheBookkeeping: CacheBookkeepingManager, url: string): Promise<boolean> {
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
