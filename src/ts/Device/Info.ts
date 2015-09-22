import { NativeBridge } from 'NativeBridge';

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

    constructor(nativeBridge: NativeBridge, callback: () => void) {
        this._nativeBridge = nativeBridge;

        let deviceInfoCalls: any = [
            ['getAndroidId', '_androidId'],
            ['getAdvertisingTrackingId', '_advertisingIdentifier'],
            ['getLimitAdTrackingFlag', '_limitAdTracking'],
            ['getSoftwareVersion', '_softwareVersion'],
            ['getHardwareVersion', '_hardwareVersion'],
            ['getNetworkType', '_networkType'],
            ['getScreenLayout', '_screenLayout'],
            ['getScreenDensity', '_screenDensity'],
            ['isWifi', '_isWifi']
        ];

        // temporary before bundled API calls
        let callbacks: number = deviceInfoCalls.length;
        let checkCallback: (c: number, callback: any) => void = (callbacks: number, callback: any): void => {
            if (callbacks === 0) {
                callback();
            }
        };

        deviceInfoCalls.forEach((entry: any): void => {
            let nativeCall: string = entry[0];
            let dataField: any = entry[1];
            this._nativeBridge.invoke('DeviceInfo', nativeCall, [], (value: any): void => {
                this[dataField] = value;
                callbacks--;
                checkCallback(callbacks, callback);
            });
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
