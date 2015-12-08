/// <reference path="../../../typings/tsd.d.ts" />

import { NativeBridge } from 'NativeBridge';

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

    constructor(data: any) {
        this._androidId = data.androidId;
        this._advertisingIdentifier = data.advertisingIdentifier;
        this._limitAdTracking = data.limitAdTracking;
        this._softwareVersion = data.softwareVersion;
        this._hardwareVersion = data.hardwareVersion;
        this._networkType = data.networkType;
        this._screenLayout = data.screenLayout;
        this._screenDensity = data.screenDensity;
        this._isWifi = data.isWifi;
    }

    public static fetch(nativeBridge: NativeBridge): Promise<DeviceInfo> {
        let className: string = 'DeviceInfo';

        return nativeBridge.invokeBatch([
            [className, 'getAndroidId', []],
            [className, 'getAdvertisingTrackingId', []],
            [className, 'getLimitAdTrackingFlag', []],
            [className, 'getSoftwareVersion', []],
            [className, 'getHardwareVersion', []],
            [className, 'getNetworkType', []],
            [className, 'getScreenLayout', []],
            [className, 'getScreenDensity', []],
            [className, 'isWifi', []]
        ]).then(([androidId,
            advertisingTrackingId,
            limitAdTracking,
            softwareVersion,
            hardwareVersion,
            networkType,
            screenLayout,
            screenDensity,
            isWifi]) => {
            return new DeviceInfo({
                androidId,
                advertisingTrackingId,
                limitAdTracking,
                softwareVersion,
                hardwareVersion,
                networkType,
                screenLayout,
                screenDensity,
                isWifi
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