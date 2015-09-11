import NativeBridge from 'NativeBridge';

export default class DeviceInfo {

    private _nativeBridge: NativeBridge;

    private _androidId: string = null;
    private _advertisingIdentifier: string = null;
    private _limitAdTracking: boolean = false;
    private _softwareVersion: string;
    private _hardwareVersion: string;
    private _screenLayout: number;
    private _screenDensity: number;

    constructor(nativeBridge: NativeBridge, callback: (status: string) => void) {
        this._nativeBridge = nativeBridge;

        // temporary before bundled API calls
        let callbacks: number = 7;
        this._nativeBridge.invoke('DeviceInfo', 'getAndroidId', [], (status: string, androidId: string): void => {
            this._androidId = androidId;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getAdvertisingTrackingId', [], (status: string, advertisingIdentifier: string): void => {
            this._advertisingIdentifier = advertisingIdentifier;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getLimitAdTrackingFlag', [], (status: string, limitAdTracking: boolean): void => {
            this._limitAdTracking = limitAdTracking;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getSoftwareVersion', [], (status: string, softwareVersion: string): void => {
            this._softwareVersion = softwareVersion;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getHardwareVersion', [], (status: string, hardwareVersion: string): void => {
            this._hardwareVersion = hardwareVersion;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getScreenLayout', [], (status: string, screenLayout: number): void => {
            this._screenLayout = screenLayout;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke('DeviceInfo', 'getScreenDensity', [], (status: string, screenDensity: number): void => {
            this._screenDensity = screenDensity;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });
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

    public getScreenLayout(): number {
        return this._screenLayout;
    }

    public getScreenDensity(): number {
        return this._screenDensity;
    }

    private _checkCallback(callbacks: number, callback: any): void {
        if(callbacks === 0) {
            callback('OK');
        }
    }

}
