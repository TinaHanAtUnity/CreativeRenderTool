import { VastMediaFile } from 'VAST/Models/VastMediaFile';

export enum VASTMediaFileSize {
    WIFI_MIN = 5242880,    // 5 MB in Bytes
    WIFI_MAX = 10485760,   // 10 MB
    CELL_MIN = 512000,     // 500 KB
    CELL_MAX = 3145728,    // 3 MB
    SDK_MAX = 20971520     // 20 MB SDK max limit for 'too_large_file' error
}

export class VastMediaSelector {

    public static getOptimizedVideoUrl(mediaFiles: VastMediaFile[], connectionType?: string): string | null {
        if (connectionType && connectionType === 'wifi') {
            return VastMediaSelector.getVideoUrlInRange(mediaFiles, VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        } else {
            return VastMediaSelector.getVideoUrlInRange(mediaFiles, VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        }
    }

    private static getVideoUrlInRange(mediaFiles: VastMediaFile[], minSize: number, maxSize: number): string | null {
        let mediaUrl: string | null = null;
        let mediaMinSize = Number.MAX_SAFE_INTEGER;
        let mediaMinBitrate = Number.MAX_SAFE_INTEGER;
        let defaultMediaUrl: string | null = null;
        let defaultMinDiff = Number.MAX_SAFE_INTEGER;
        for (const mediaFile of mediaFiles) {
            const fileSize = mediaFile.getFileSize();
            const bitRate = mediaFile.getBitrate();
            if (fileSize >= minSize && fileSize <= maxSize) {
                if (fileSize < mediaMinSize) {
                    mediaUrl = mediaFile.getFileURL();
                    mediaMinSize = fileSize;
                }
            } else if (fileSize <= VASTMediaFileSize.SDK_MAX) {
                // if there is no media in the range or file size is 0
                // then pick the closest to minSize or the lowest bitrate file
                if (Math.abs(fileSize - minSize) < defaultMinDiff || bitRate < mediaMinBitrate) {
                    defaultMediaUrl = mediaFile.getFileURL();
                    defaultMinDiff = Math.abs(fileSize - minSize);
                    mediaMinBitrate = bitRate;
                }
            }
        }

        if (mediaUrl) {
            return mediaUrl;
        }

        return defaultMediaUrl;
    }
}
