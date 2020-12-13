import { FileId } from 'Core/Utilities/FileId';
export class FileInfo {
    static getFileInfo(cache, fileId) {
        return cache.getFileInfo(fileId).catch(() => {
            return Promise.resolve(undefined);
        });
    }
    static isCached(cache, cacheBookkeeping, url) {
        return FileId.getFileId(url, cache).then(fileId => {
            return this.getFileInfo(cache, fileId).then(fileInfo => {
                if (fileInfo && fileInfo.found && fileInfo.size > 0) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlsZUluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9VdGlsaXRpZXMvRmlsZUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRS9DLE1BQU0sT0FBTyxRQUFRO0lBQ1YsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFlLEVBQUUsTUFBYztRQUNyRCxPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUN4QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFlLEVBQUUsZ0JBQXlDLEVBQUUsR0FBVztRQUMxRixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM5QyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDbkQsSUFBSSxRQUFRLElBQUksUUFBUSxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtvQkFDakQsT0FBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dCQUM3RCxPQUFPLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3pDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7d0JBQ1YsT0FBTyxLQUFLLENBQUM7b0JBQ2pCLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2dCQUNELE9BQU8sS0FBSyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==