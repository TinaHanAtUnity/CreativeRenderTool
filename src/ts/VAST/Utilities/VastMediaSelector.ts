
import { Vast } from 'VAST/Models/Vast';

export enum VASTMediaFileSize {
    WIFI_MIN = 5242880,    // 5 MB in Bytes
    WIFI_MAX = 10485760,   // 10 MB
    CELL_MIN = 512000,     // 500 KB
    CELL_MAX = 3145728,    // 3 MB
    SDK_MAX = 20971520     // 20 MB SDK max limit for 'too_large_file' error
}

// To be tested
//  WIFI_MIN = 10485760,    // 10 MB in Bytes
//  WIFI_MAX = 20971520,    // 20 MB
//  CELL_MIN = 5242880,     // 5 MB
//  CELL_MAX = 10485760,    // 10 MB

export class VastMediaSelector {
    private _vast: Vast;
    private _wifiMediaFileUrl: string | undefined;
    private _cellMediaFileUrl: string | undefined;
    private _connectionType: string | undefined;

    constructor(vast:Vast, connectionType?: string) {
        this._vast = vast;
        this._connectionType = connectionType;
    }

    public getOptimizedVideoUrl(): string {
        if (!this._wifiMediaFileUrl || !this._cellMediaFileUrl) {
            this._wifiMediaFileUrl = this.getVideoUrlInRange(VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
            this._cellMediaFileUrl = this.getVideoUrlInRange(VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        }

        if (this._connectionType && this._connectionType === 'wifi') {
            return this._wifiMediaFileUrl;
        } else {
            return this._cellMediaFileUrl;
        }
    }

    // Pick the smallest size media in assigned range,
    // if there is no media in the range or file size is 0
    // then pick the closest to minSize below SDK_MAX size
    public getVideoUrlInRange(minSize: number, maxSize: number): string {
        let mediaUrl: string | null = null;
        let mediaMinSize = Number.MAX_SAFE_INTEGER;
        let defaultMediaUrl: string | null = null;
        let defaultMinDiff = Number.MAX_SAFE_INTEGER;
        const ad = this._vast.getAd();
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    const mimeType = mediaFile.getMIMEType();
                    const isSupported = mimeType && this.isSupportedMIMEType(mimeType);
                    const fileUrl = mediaFile.getFileURL();
                    if (isSupported && fileUrl) {
                        const fileSize = mediaFile.getFileSize();
                        if (fileSize >= minSize && fileSize <= maxSize) {
                            if (fileSize < mediaMinSize) {
                                mediaUrl = mediaFile.getFileURL();
                                mediaMinSize = fileSize;
                            }
                        } else if (fileSize <= VASTMediaFileSize.SDK_MAX) {
                            if (Math.abs(fileSize - minSize) < defaultMinDiff) {
                                defaultMediaUrl = mediaFile.getFileURL();
                                defaultMinDiff = Math.abs(fileSize - minSize);
                            }
                        }
                    }
                }
            }
        }

        if (mediaUrl) {
            return mediaUrl;
        } else if (defaultMediaUrl) {
            return defaultMediaUrl;
        } else {
            throw new Error('No Video URL found for VAST');
        }
    }

    private isSupportedMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
