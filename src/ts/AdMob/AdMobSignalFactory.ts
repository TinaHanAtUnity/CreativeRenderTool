import { AdMobSignal } from 'Models/AdMobSignal';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { FocusManager } from 'Managers/FocusManager';

export class AdMobSignalFactory {
    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _focusManager: FocusManager;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, focusManager: FocusManager) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._focusManager = focusManager;
    }

    public getAdRequestSignal(): Promise<AdMobSignal> {
        return this.getCommonSignal();
    }

    public getClickSignal(): Promise<AdMobSignal> {
        return this.getCommonSignal().then(signal => {
            // todo: touchXUp
            // todo: touchYUp
            // todo: touchXDown
            // todo: touchYDown
            // todo: touch duration
            // todo: touch pressure
            // todo: touch diameter
            // todo: up count
            // todo: down count
            // todo: move count
            // todo: cancel count
            // todo: time on screen

            if(signal.getScreenWidth() && signal.getScreenHeight()) {
                if(this._clientInfo.getPlatform() === Platform.IOS && this._deviceInfo.getScreenScale()) {
                    signal.setAdViewWidth(this.getIosViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenScale()));
                    signal.setAdViewHeight(this.getIosViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenScale()));
                } else if(this._deviceInfo.getScreenDensity()) {
                    signal.setAdViewWidth(this.getAndroidViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenDensity()));
                    signal.setAdViewHeight(this.getAndroidViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenDensity()));
                }
            }

            signal.setAdViewX(0);
            signal.setAdViewY(0);

            return signal;
        });
    }

    private getCommonSignal(): Promise<AdMobSignal> {
        const nativeBridge = this._nativeBridge;
        const signal: AdMobSignal = new AdMobSignal();
        signal.setEventTimestamp(this.getEventTimestamp());
        signal.setSdkVersion(this.getSdkVersion(this._clientInfo));
        signal.setOsVersion(this.getOsVersion(this._clientInfo, this._deviceInfo));
        signal.setTimeZoneOffset(this.getTimeZoneOffset());
        signal.setAppActive(this._focusManager.isAppForeground());
        signal.setAppUptime(this.getAppUptime(this._clientInfo));
        signal.setAppStartTime(this.getAppStartTime(this._clientInfo));
        signal.setRooted(this.getRooted(this._deviceInfo));
        signal.setAppVersionName(this._clientInfo.getApplicationVersion());
        signal.setAppIdName(this._clientInfo.getApplicationName());

        const promises = [];

        promises.push(this._deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setBatteryLevel(this.getBatteryLevel(batteryLevel));
        }).catch(() => {
            this.logFailure(nativeBridge, 'batteryLevel');
        }));

        promises.push(this._deviceInfo.getBatteryStatus().then(batteryStatus => {
            signal.setBatteryState(this.getBatteryStatus(this._clientInfo, batteryStatus));
        }).catch(() => {
            this.logFailure(nativeBridge, 'batteryStatus');
        }));

        promises.push(this._deviceInfo.getConnectionType().then(connectionType => {
            signal.setNetworkType(this.getNetworkType(connectionType));
        }).catch(() => {
            this.logFailure(nativeBridge, 'connectionType');
        }));

        promises.push(Promise.all([this._deviceInfo.getScreenWidth(),this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            if (this._nativeBridge.getPlatform() === Platform.IOS) {
                signal.setScreenWidth(width * this._deviceInfo.getScreenScale());
                signal.setScreenHeight(height * this._deviceInfo.getScreenScale());
            } else {
                signal.setScreenWidth(width);
                signal.setScreenHeight(height);
            }
            signal.setDeviceOrientation(this.getDeviceScreenOrientation(width, height));
        }).catch(() => {
            this.logFailure(nativeBridge, 'screenWidth');
        }));

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(nativeBridge.DeviceInfo.Android.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if(packageInfo.installer) {
                    signal.setAppInstaller(packageInfo.installer);
                } else {
                    signal.setAppInstaller('unknown');
                }

                if(packageInfo.versionCode) {
                    signal.setAppVersionCode(packageInfo.versionCode);
                }
            }).catch(() => {
                this.logFailure(nativeBridge, 'packageInfo');
            }));
        }

        return Promise.all(promises).then(() => {
            return signal;
        });
    }

    private logFailure(nativeBridge: NativeBridge, field: string) {
        Diagnostics.trigger('signal_failed', {
            signal: field
        });
    }

    private getEventTimestamp(): number {
        return Math.round(Date.now() / 1000);
    }

    private getSdkVersion(clientInfo: ClientInfo): string {
        if(this._clientInfo.getPlatform() === Platform.IOS) {
            return 'unity-ios-v' + this._clientInfo.getSdkVersionName();
        } else {
            return 'unity-android-v' + this._clientInfo.getSdkVersionName();
        }
    }

    private getBatteryLevel(level: number): number {
        if(level === -1) {
            return -1;
        } else {
            return Math.round(level * 100);
        }
    }

    private getNetworkType(type: string): number {
        if(type === 'wifi') {
            return 1;
        } else if(type === 'cellular') {
            return 0;
        } else {
            return -1;
        }
    }

    private getOsVersion(clientInfo: ClientInfo, deviceInfo: DeviceInfo): string {
        if(clientInfo.getPlatform() === Platform.IOS) {
            const model = deviceInfo.getModel().split(' ')[0];
            return model.replace(/[0-9]+,[0-9]+$/, '') + ' ' + deviceInfo.getOsVersion();
        } else {
            return deviceInfo.getOsVersion();
        }
    }

    private getTimeZoneOffset(): number {
        // the number of minutes from UTC plus one day
        return new Date().getTimezoneOffset() * -1 + 1440;
    }

    private getAppUptime(clientInfo: ClientInfo): number {
        return Math.round((Date.now() - clientInfo.getInitTimestamp()) / 1000);
    }

    private getAppStartTime(clientInfo: ClientInfo): number {
        return Math.round(clientInfo.getInitTimestamp() / 1000);
    }

    private getRooted(deviceInfo: DeviceInfo): number {
        if(deviceInfo.isSimulator()) { // not available on Android
            return 2;
        } else if(deviceInfo.isRooted()) {
            return 1;
        } else {
            return 0;
        }
    }

    private getIosViewWidth(width: number, scale: number): number {
        return width / scale;
    }

    private getIosViewHeight(height: number, scale: number): number {
        return height / scale;
    }

    private getAndroidViewWidth(width: number, density: number): number {
        return width / (density / 160);
    }

    private getAndroidViewHeight(height: number, density: number): number {
        return height / (density / 160);
    }

    private getBatteryStatus(clientInfo: ClientInfo, status: number): number {
        if(clientInfo.getPlatform() === Platform.IOS) {
            return status;
        } else {
            switch(status) {
                case 1: // BATTERY_STATUS_UNKNOWN
                    return 0; // unknown
                case 2: // BATTERY_STATUS_CHARGING
                    return 2; // charging
                case 3: // BATTERY_STATUS_DISCHARGING
                    return 1; // unplugged
                case 4: // BATTERY_STATUS_NOT_CHARGING
                    return 1; // unplugged
                case 5: // BATTERY_STATUS_FULL
                    return 3; // full
                default:
                    return 0; // unknown
            }
        }
    }

    private getDeviceScreenOrientation(width: number, height: number): number {
        if(width === height) {
            return 20; // square
        } else if(width > height) {
            return 3; // landscape left
        } else {
            return 1; // portrait
        }
    }
}
