import { NativeBridge, Callback, PackedCall } from 'NativeBridge';

export default class DeviceInfo {

    private _nativeBridge: NativeBridge;

    private _androidId: string = null;
    private _advertisingIdentifier: string = null;
    private _limitAdTracking: boolean = false;
    private _softwareVersion: string;
    private _hardwareVersion: string;
    private _networkType: string;
    private _screenLayout: number;
    private _screenDensity: number;
    private _isWifi: boolean;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public fetch(callback: Callback): void {
        let className: string = 'DeviceInfo';
        let batch: PackedCall[] = [
            [className, 'getAndroidId',             [], (androidId: string)             => { this._androidId             = androidId; },             null],
            [className, 'getAdvertisingTrackingId', [], (advertisingIdentifier: string) => { this._advertisingIdentifier = advertisingIdentifier; }, null],
            [className, 'getLimitAdTrackingFlag',   [], (limitAdTracking: boolean)      => { this._limitAdTracking       = limitAdTracking; },       null],
            [className, 'getSoftwareVersion',       [], (softwareVersion: string)       => { this._softwareVersion       = softwareVersion; },       null],
            [className, 'getHardwareVersion',       [], (hardwareVersion: string)       => { this._hardwareVersion       = hardwareVersion; },       null],
            [className, 'getNetworkType',           [], (networkType: string)           => { this._networkType           = networkType; },           null],
            [className, 'getScreenLayout',          [], (screenLayout: number)          => { this._screenLayout          = screenLayout; },          null],
            [className, 'getScreenDensity',         [], (screenDensity: number)         => { this._screenDensity         = screenDensity; },         null],
            [className, 'isWifi',                   [], (isWifi: boolean)               => { this._isWifi                = isWifi; },                null]
        ];
        this._nativeBridge.invokeBatch(batch, callback);
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
