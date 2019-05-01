import { VastMediaFile } from 'VAST/Models/VastMediaFile';

export enum VASTMediaFileSize {
    WIFI_MIN = 5242880,    // 5 MB in Bytes
    WIFI_MAX = 10485760,   // 10 MB
    CELL_MIN = 512000,     // 500 KB
    CELL_MAX = 3145728,    // 3 MB
    SDK_MAX = 20971520     // 20 MB SDK max limit for 'too_large_file' error
}

export class VastMediaSelector {

    public static getOptimizedVastMediaFile(mediaFiles: VastMediaFile[], connectionType?: string): VastMediaFile | null {
        if (connectionType && connectionType === 'wifi') {
            return VastMediaSelector.getVastMediaInRange(mediaFiles, VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        } else {
            return VastMediaSelector.getVastMediaInRange(mediaFiles, VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        }
    }

    private static getVastMediaInRange(mediaFiles: VastMediaFile[], minSize: number, maxSize: number): VastMediaFile | null {
        let selectedMediaFile: VastMediaFile | null = null;
        let defaultMediaFile: VastMediaFile | null = null;
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
            } else if (fileSize <= VASTMediaFileSize.SDK_MAX) {
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
