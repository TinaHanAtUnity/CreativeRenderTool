import { AdMobSignal } from 'Models/AdMobSignal';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';

import { unity_proto } from '../../proto/unity_proto.js';

export class AdMobSignalFactory {

    public static createSomething() {
        return unity_proto.UnityInfo.create();
    }

    public static getAdRequestSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<AdMobSignal> {
        return AdMobSignalFactory.getCommonSignal(nativeBridge, clientInfo, deviceInfo).then(signal => {
            return signal;
        });
    }

    public static getClickSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<AdMobSignal> {
        return AdMobSignalFactory.getCommonSignal(nativeBridge, clientInfo, deviceInfo).then(signal => {
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
                if(clientInfo.getPlatform() === Platform.IOS && deviceInfo.getScreenScale()) {
                    signal.setAdViewWidth(AdMobSignalFactory.getIosViewWidth(signal.getScreenWidth(), deviceInfo.getScreenScale()));
                    signal.setAdViewHeight(AdMobSignalFactory.getIosViewHeight(signal.getScreenHeight(), deviceInfo.getScreenScale()));
                } else if(deviceInfo.getScreenDensity()) {
                    signal.setAdViewWidth(AdMobSignalFactory.getAndroidViewWidth(signal.getScreenWidth(), deviceInfo.getScreenDensity()));
                    signal.setAdViewHeight(AdMobSignalFactory.getAndroidViewHeight(signal.getScreenHeight(), deviceInfo.getScreenDensity()));
                }
            }

            signal.setAdViewX(0);
            signal.setAdViewY(0);

            return signal;
        });
    }

    private static getCommonSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<AdMobSignal> {
        const signal: AdMobSignal = new AdMobSignal();
        signal.setEventTimestamp(AdMobSignalFactory.getEventTimestamp());
        signal.setSdkVersion(AdMobSignalFactory.getSdkVersion(clientInfo));
        signal.setOsVersion(AdMobSignalFactory.getOsVersion(clientInfo, deviceInfo));
        signal.setTimeZoneOffset(AdMobSignalFactory.getTimeZoneOffset());
        // todo: signal app active
        signal.setAppUptime(AdMobSignalFactory.getAppUptime(clientInfo));
        signal.setAppStartTime(AdMobSignalFactory.getAppStartTime(clientInfo));
        signal.setRooted(AdMobSignalFactory.getRooted(deviceInfo));
        signal.setAppVersionName(clientInfo.getApplicationVersion());
        signal.setAppIdName(clientInfo.getApplicationName());

        const promises = [];

        promises.push(deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setBatteryLevel(AdMobSignalFactory.getBatteryLevel(batteryLevel));
        }).catch(() => {
            AdMobSignalFactory.logFailure(nativeBridge, 'batteryLevel');
        }));

        promises.push(deviceInfo.getBatteryStatus().then(batteryStatus => {
            signal.setBatteryState(AdMobSignalFactory.getBatteryStatus(clientInfo, batteryStatus));
        }).catch(() => {
            AdMobSignalFactory.logFailure(nativeBridge, 'batteryStatus');
        }));

        promises.push(deviceInfo.getConnectionType().then(connectionType => {
            signal.setNetworkType(AdMobSignalFactory.getNetworkType(connectionType));
        }).catch(() => {
            AdMobSignalFactory.logFailure(nativeBridge, 'connectionType');
        }));

        promises.push(Promise.all([deviceInfo.getScreenWidth(),deviceInfo.getScreenHeight()]).then(([width, height]) => {
            signal.setScreenWidth(width);
            signal.setScreenHeight(height);
            signal.setDeviceOrientation(AdMobSignalFactory.getDeviceScreenOrientation(width, height));
        }).catch(() => {
            AdMobSignalFactory.logFailure(nativeBridge, 'screenWidth');
        }));

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(nativeBridge.DeviceInfo.Android.getPackageInfo(clientInfo.getApplicationName()).then(packageInfo => {
                if(packageInfo.installer) {
                    signal.setAppInstaller(packageInfo.installer);
                }

                if(packageInfo.versionCode) {
                    signal.setAppVersionCode(packageInfo.versionCode);
                }
            }).catch(() => {
                AdMobSignalFactory.logFailure(nativeBridge, 'packageInfo');
            }));
        }

        return Promise.all(promises).then(() => {
            return signal;
        });
    }

    private static logFailure(nativeBridge: NativeBridge, field: string) {
        nativeBridge.Sdk.logDebug('Fetching ' + field + ' failed');
        Diagnostics.trigger('signal_failed', {
            signal: field
        });
    }

    private static getEventTimestamp(): number {
        return Math.round(Date.now() / 1000);
    }

    private static getSdkVersion(clientInfo: ClientInfo): string {
        if(clientInfo.getPlatform() === Platform.IOS) {
            return 'unity-ios-v' + clientInfo.getSdkVersionName();
        } else {
            return 'unity-android-v' + clientInfo.getSdkVersionName();
        }
    }

    private static getBatteryLevel(level: number): number {
        if(level === -1) {
            return -1;
        } else {
            return Math.round(level * 100);
        }
    }

    private static getNetworkType(type: string): number {
        if(type === 'wifi') {
            return 1;
        } else if(type === 'cellular') {
            return 0;
        } else {
            return -1;
        }
    }

    private static getOsVersion(clientInfo: ClientInfo, deviceInfo: DeviceInfo): string {
        if(clientInfo.getPlatform() === Platform.IOS) {
            return deviceInfo.getModel().split(' ')[0] + ' ' + deviceInfo.getOsVersion();
        } else {
            return deviceInfo.getOsVersion();
        }
    }

    private static getTimeZoneOffset(): number {
        // the number of minutes from UTC plus one day
        return new Date().getTimezoneOffset() * -1 + 1440;
    }

    private static getAppUptime(clientInfo: ClientInfo): number {
        return Math.round((Date.now() - clientInfo.getInitTimestamp()) / 1000);
    }

    private static getAppStartTime(clientInfo: ClientInfo): number {
        return Math.round(clientInfo.getInitTimestamp() / 1000);
    }

    private static getRooted(deviceInfo: DeviceInfo): number {
        if(deviceInfo.isSimulator()) { // not available on Android
            return 2;
        } else if(deviceInfo.isRooted()) {
            return 1;
        } else {
            return 0;
        }
    }

    private static getIosViewWidth(width: number, scale: number): number {
        return width / scale;
    }

    private static getIosViewHeight(height: number, scale: number): number {
        return height / scale;
    }

    private static getAndroidViewWidth(width: number, density: number): number {
        return width / (density / 160);
    }

    private static getAndroidViewHeight(height: number, density: number): number {
        return height / (density / 160);
    }

    private static getBatteryStatus(clientInfo: ClientInfo, status: number): number {
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

    private static getDeviceScreenOrientation(width: number, height: number): number {
        if(width === height) {
            return 20; // square
        } else if(width > height) {
            return 3; // landscape left
        } else {
            return 1; // portrait
        }
    }
}
