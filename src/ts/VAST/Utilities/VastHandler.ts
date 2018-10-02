import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Vast, VASTMediaFileSize } from 'VAST/Models/Vast';

export class VastHandler {
    private _vast: Vast;
    private _deviceInfo: DeviceInfo;
    private _connectionStatus: string = 'none';

    constructor(vast:Vast, deviceInfo: DeviceInfo) {
        this._vast = vast;
        this._deviceInfo = deviceInfo;

        this.setConnectionStatus();
    }

    public getOptmizedVideoUrl(): string | null {
        if (this._connectionStatus === 'celluar') {
            return this._vast.getVideoUrlInRange(VASTMediaFileSize.CELL_MIN, VASTMediaFileSize.CELL_MAX);
        } else {
            return this._vast.getVideoUrlInRange(VASTMediaFileSize.WIFI_MIN, VASTMediaFileSize.WIFI_MAX);
        }
    }

    public setConnectionStatus() {
        this._deviceInfo.getConnectionType().then((conn) => {
            this._connectionStatus = conn;
        });
    }
}
