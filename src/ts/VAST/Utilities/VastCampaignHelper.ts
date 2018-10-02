
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
        if (this._connectionStatus === 'celluar') {
            return this._vast.getVideoUrlInRange(VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        } else {
            return this._vast.getVideoUrlInRange(VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        }
    }

    public refreshNetworkStatus() {
        if (this._deviceInfo) {
            this._deviceInfo.getConnectionType().then((conn) => {
                this._connectionStatus = conn;
            });
        }
    }
}
