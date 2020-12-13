export var VASTMediaFileSize;
(function (VASTMediaFileSize) {
    VASTMediaFileSize[VASTMediaFileSize["WIFI_MIN"] = 5242880] = "WIFI_MIN";
    VASTMediaFileSize[VASTMediaFileSize["WIFI_MAX"] = 10485760] = "WIFI_MAX";
    VASTMediaFileSize[VASTMediaFileSize["CELL_MIN"] = 512000] = "CELL_MIN";
    VASTMediaFileSize[VASTMediaFileSize["CELL_MAX"] = 3145728] = "CELL_MAX";
    VASTMediaFileSize[VASTMediaFileSize["SDK_MAX"] = 20971520] = "SDK_MAX"; // 20 MB SDK max limit for 'too_large_file' error
})(VASTMediaFileSize || (VASTMediaFileSize = {}));
export class VastMediaSelector {
    static getOptimizedVastMediaFile(mediaFiles, connectionType) {
        if (connectionType && connectionType === 'wifi') {
            return VastMediaSelector.getVastMediaInRange(mediaFiles, VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        }
        else {
            return VastMediaSelector.getVastMediaInRange(mediaFiles, VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        }
    }
    static getVastMediaInRange(mediaFiles, minSize, maxSize) {
        let selectedMediaFile = null;
        let defaultMediaFile = null;
        let mediaMinSize = Number.MAX_SAFE_INTEGER;
        let mediaMinBitrate = Number.MAX_SAFE_INTEGER;
        let defaultMinDiff = Number.MAX_SAFE_INTEGER;
        for (const mediaFile of mediaFiles) {
            const fileSize = mediaFile.getFileSize();
            const bitRate = mediaFile.getBitrate();
            if (fileSize >= minSize && fileSize <= maxSize) {
                if (fileSize < mediaMinSize) {
                    mediaMinSize = fileSize;
                    selectedMediaFile = mediaFile;
                }
            }
            else if (fileSize <= VASTMediaFileSize.SDK_MAX) {
                // if there is no media in the range or file size is 0
                // then pick the closest to minSize or the lowest bitrate file
                if (Math.abs(fileSize - minSize) < defaultMinDiff || bitRate < mediaMinBitrate) {
                    defaultMinDiff = Math.abs(fileSize - minSize);
                    mediaMinBitrate = bitRate;
                    defaultMediaFile = mediaFile;
                }
            }
        }
        if (selectedMediaFile) {
            return selectedMediaFile;
        }
        return defaultMediaFile;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE1lZGlhU2VsZWN0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9VdGlsaXRpZXMvVmFzdE1lZGlhU2VsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFOLElBQVksaUJBTVg7QUFORCxXQUFZLGlCQUFpQjtJQUN6Qix1RUFBa0IsQ0FBQTtJQUNsQix3RUFBbUIsQ0FBQTtJQUNuQixzRUFBaUIsQ0FBQTtJQUNqQix1RUFBa0IsQ0FBQTtJQUNsQixzRUFBa0IsQ0FBQSxDQUFDLGlEQUFpRDtBQUN4RSxDQUFDLEVBTlcsaUJBQWlCLEtBQWpCLGlCQUFpQixRQU01QjtBQUVELE1BQU0sT0FBTyxpQkFBaUI7SUFFbkIsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFVBQTJCLEVBQUUsY0FBdUI7UUFDeEYsSUFBSSxjQUFjLElBQUksY0FBYyxLQUFLLE1BQU0sRUFBRTtZQUM3QyxPQUFPLGlCQUFpQixDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEg7YUFBTTtZQUNILE9BQU8saUJBQWlCLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNwSDtJQUNMLENBQUM7SUFFTyxNQUFNLENBQUMsbUJBQW1CLENBQUMsVUFBMkIsRUFBRSxPQUFlLEVBQUUsT0FBZTtRQUM1RixJQUFJLGlCQUFpQixHQUF5QixJQUFJLENBQUM7UUFDbkQsSUFBSSxnQkFBZ0IsR0FBeUIsSUFBSSxDQUFDO1FBQ2xELElBQUksWUFBWSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztRQUMzQyxJQUFJLGVBQWUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7UUFDOUMsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1FBQzdDLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO1lBQ2hDLE1BQU0sUUFBUSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxNQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdkMsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLFFBQVEsSUFBSSxPQUFPLEVBQUU7Z0JBQzVDLElBQUksUUFBUSxHQUFHLFlBQVksRUFBRTtvQkFDekIsWUFBWSxHQUFHLFFBQVEsQ0FBQztvQkFDeEIsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO2lCQUNqQzthQUNKO2lCQUFNLElBQUksUUFBUSxJQUFJLGlCQUFpQixDQUFDLE9BQU8sRUFBRTtnQkFDOUMsc0RBQXNEO2dCQUN0RCw4REFBOEQ7Z0JBQzlELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsY0FBYyxJQUFJLE9BQU8sR0FBRyxlQUFlLEVBQUU7b0JBQzVFLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQztvQkFDOUMsZUFBZSxHQUFHLE9BQU8sQ0FBQztvQkFDMUIsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO2lCQUNoQzthQUNKO1NBQ0o7UUFFRCxJQUFJLGlCQUFpQixFQUFFO1lBQ25CLE9BQU8saUJBQWlCLENBQUM7U0FDNUI7UUFFRCxPQUFPLGdCQUFnQixDQUFDO0lBQzVCLENBQUM7Q0FDSiJ9