import NativeBridge = require('NativeBridge');

class DeviceInfo {

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

        // Temporary before bundled API calls
        let callbacks = 7;
        this._nativeBridge.invoke("DeviceInfo", "getAndroidId", [], (status, androidId) => {
            this._androidId = androidId;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getAdvertisingTrackingId", [], (status, advertisingIdentifier) => {
            this._advertisingIdentifier = advertisingIdentifier;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getLimitAdTrackingFlag", [], (status, limitAdTracking) => {
            this._limitAdTracking = limitAdTracking;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getSoftwareVersion", [], (status, softwareVersion) => {
            this._softwareVersion = softwareVersion;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getHardwareVersion", [], (status, hardwareVersion) => {
            this._hardwareVersion = hardwareVersion;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getScreenLayout", [], (status, screenLayout) => {
            this._screenLayout = screenLayout;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });

        this._nativeBridge.invoke("DeviceInfo", "getScreenDensity", [], (status, screenDensity) => {
            this._screenDensity = screenDensity;
            callbacks--;
            this._checkCallback(callbacks, callback);
        });
    }

    private _checkCallback(callbacks, callback) {
        if(callbacks === 0) {
            callback("OK");
        }
    }

    getAndroidId() {
        return this._androidId;
    }

    getAdvertisingIdentifier() {
        return this._advertisingIdentifier;
    }

    getLimitAdTracking() {
        return this._limitAdTracking;
    }

    getSoftwareVersion() {
        return this._softwareVersion;
    }

    getHardwareVersion() {
        return this._hardwareVersion;
    }

    getScreenLayout() {
        return this._screenLayout;
    }

    getScreenDensity() {
        return this._screenDensity;
    }

}

export = DeviceInfo;