import { NativeBridge, BatchInvocation } from 'NativeBridge';

export class DeviceInfo {

    private _androidId: string = null;
    private _advertisingIdentifier: string = null;
    private _limitAdTracking: boolean = false;
    private _apiLevel: number;
    private _osVersion: string;
    private _manufacturer: string;
    private _model: string;
    private _networkType: string;
    private _screenLayout: number;
    private _screenDensity: number;

    public fetch(nativeBridge: NativeBridge): Promise<any[]> {
        let className: string = 'DeviceInfo';
        let batch: BatchInvocation = new BatchInvocation(nativeBridge);
        batch.queue(className, 'getAndroidId').then(([androidId]) => this._androidId = androidId);
        batch.queue(className, 'getAdvertisingTrackingId').then(([advertisingIdentifier]) => this._advertisingIdentifier = advertisingIdentifier);
        batch.queue(className, 'getLimitAdTrackingFlag').then(([limitAdTracking]) => this._limitAdTracking = limitAdTracking);
        batch.queue(className, 'getApiLevel').then(([apiLevel]) => this._apiLevel = apiLevel);
        batch.queue(className, 'getOsVersion').then(([osVersion]) => this._osVersion = osVersion);
        batch.queue(className, 'getManufacturer').then(([manufacturer]) => this._manufacturer = manufacturer);
        batch.queue(className, 'getModel').then(([model]) => this._model = model);
        batch.queue(className, 'getNetworkType').then(([networkType]) => this._networkType = networkType);
        batch.queue(className, 'getScreenLayout').then(([screenLayout]) => this._screenLayout = screenLayout);
        batch.queue(className, 'getScreenDensity').then(([screenDensity]) => this._screenDensity = screenDensity);
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

    public getApiLevel(): number {
        return this._apiLevel;
    }

    public getManufacturer(): string {
        return this._manufacturer;
    }

    public getModel(): string {
        return this._model;
    }

    public getNetworkType(): string {
        return this._networkType;
    }

    public getOsVersion(): string {
        return this._osVersion;
    }

    public getScreenLayout(): number {
        return this._screenLayout;
    }

    public getScreenDensity(): number {
        return this._screenDensity;
    }

}
