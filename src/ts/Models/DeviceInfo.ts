import { NativeBridge, BatchInvocation } from 'NativeBridge';

export class DeviceInfo {

    private _androidId: string = null;
    private _advertisingIdentifier: string = null;
    private _limitAdTracking: boolean = false;
    private _softwareVersion: string;
    private _hardwareVersion: string;
    private _networkType: string;
    private _screenLayout: number;
    private _screenDensity: number;
    private _isWifi: boolean;

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let className: string = 'DeviceInfo';
        let batch: BatchInvocation = new BatchInvocation(nativeBridge);
        batch.queue(className, 'getAndroidId').then(([androidId]) => this._androidId = androidId);
        batch.queue(className, 'getAdvertisingTrackingId').then(([advertisingIdentifier]) => this._advertisingIdentifier = advertisingIdentifier);
        batch.queue(className, 'getLimitAdTrackingFlag').then(([limitAdTracking]) => this._limitAdTracking = limitAdTracking);
        batch.queue(className, 'getSoftwareVersion').then(([softwareVersion]) => this._softwareVersion = softwareVersion);
        batch.queue(className, 'getHardwareVersion').then(([hardwareVersion]) => this._hardwareVersion = hardwareVersion);
        batch.queue(className, 'getNetworkType').then(([networkType]) => this._networkType = networkType);
        batch.queue(className, 'getScreenLayout').then(([screenLayout]) => this._screenLayout = screenLayout);
        batch.queue(className, 'getScreenDensity').then(([screenDensity]) => this._screenDensity = screenDensity);
        batch.queue(className, 'isWifi').then(([isWifi]) => this._isWifi = isWifi);
        return nativeBridge.invokeBatch(batch);
    }

    public getAndroidId(): string {
        return this._androidId;
    }

    public getAdvertisingIdentifier(): string {
        return this._advertisingIdentifier;
    }

    public getLimitAdTracking(): boolean {
        return this._limitAdTracking;
    }

    public getSoftwareVersion(): string {
        return this._softwareVersion;
    }

    public getHardwareVersion(): string {
        return this._hardwareVersion;
    }

    public getNetworkType(): string {
        return this._networkType;
    }

    public getScreenLayout(): number {
        return this._screenLayout;
    }

    public getScreenDensity(): number {
        return this._screenDensity;
    }

    public isWifi(): boolean {
        return this._isWifi;
    }

}
