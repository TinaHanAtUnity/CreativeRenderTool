
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Vast } from 'VAST/Models/Vast';

export enum VASTMediaFileSize {
    WIFI_MIN = 10485760,    // 10 MB in Bytes
    WIFI_MAX = 20971520,    // 20 MB
    CELL_MIN = 5242880,     // 5 MB
    CELL_MAX = 10485760,    // 10 MB
    SDK_MAX = 20971520      // 20 MB SDK max limit for 'too_large_file' error
}

export class VastCampaignHelper {
    private _vast: Vast;
    private _deviceInfo: DeviceInfo | undefined;
    private _connectionStatus: string = 'none';

    constructor(vast:Vast, deviceInfo?: DeviceInfo) {
        this._vast = vast;
        this._deviceInfo = deviceInfo;

        this.refreshNetworkStatus();
    }

    public getOptmizedVideoUrl(): string {
        if (this._connectionStatus === 'wifi') {
            return this.getVideoUrlInRange(VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        } else {
            return this.getVideoUrlInRange(VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        }
    }

    public refreshNetworkStatus() {
        if (this._deviceInfo) {
            this._deviceInfo.getConnectionType().then((conn) => {
                this._connectionStatus = conn;
            });
        }
    }

    public getVideoUrlInRange(minSize: number, maxSize: number): string {
        let mediaUrl: string | null = null;
        let minFileSize: number = -1;
        const ad = this._vast.getAd();
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    const mimeType = mediaFile.getMIMEType();
                    const playable = mimeType && this.isPlayableMIMEType(mimeType);
                    const fileUrl = mediaFile.getFileURL();
                    if (playable && fileUrl) {
                        const fileSize = mediaFile.getFileSize();
                        if (fileSize >= minSize && fileSize <= maxSize) {
                            if (fileSize < minFileSize) {
                                mediaUrl = mediaFile.getFileURL();
                                minFileSize = fileSize;
                            }
                        } else if (fileSize <= VASTMediaFileSize.SDK_MAX) {
                            if (!mediaUrl) {
                                mediaUrl = fileUrl;
                            }
                        }
                    }
                }
            }
        }

        if (mediaUrl) {
            return mediaUrl;
        } else {
            throw new Error('No Video URL found for VAST');
        }
    }

    private isPlayableMIMEType(MIMEType: string): boolean {
        const playableMIMEType = 'video/mp4';
        MIMEType = MIMEType.toLowerCase();
        return MIMEType === playableMIMEType;
    }
}
