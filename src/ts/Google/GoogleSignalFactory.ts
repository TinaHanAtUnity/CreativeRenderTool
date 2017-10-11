import { GoogleSignal } from 'Models/GoogleSignal';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';

export class GoogleSignalFactory {
    public static getAdRequestSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<GoogleSignal> {
        return GoogleSignalFactory.getCommonSignal(nativeBridge, clientInfo, deviceInfo).then(signal => {
            // todo: fill ad request specific info
            return signal;
        });
    }

    public static getClickSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<GoogleSignal> {
        return GoogleSignalFactory.getCommonSignal(nativeBridge, clientInfo, deviceInfo).then(signal => {
            // todo: fill click specific info
            return signal;
        });
    }

    private static getCommonSignal(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo): Promise<GoogleSignal> {
        const signal: GoogleSignal = new GoogleSignal();
        signal.setEventTimestamp((Date.now() / 1000) - 8 * 3600); // unixtime in seconds, in Pacific standard timezone
        signal.setSdkVersion(GoogleSignalFactory.getSdkVersion(clientInfo));
        signal.setOsVersion(GoogleSignalFactory.getOsVersion(clientInfo, deviceInfo));
        signal.setTimeZoneOffset(GoogleSignalFactory.getTimeZoneOffset());
        // todo: signal app active
        signal.setAppUptime(GoogleSignalFactory.getAppUptime(clientInfo));
        signal.setAppStartTimeInPST(GoogleSignalFactory.getAppStartTimeInPST(clientInfo));
        signal.setRooted(GoogleSignalFactory.getRooted(deviceInfo));
        signal.setAppVersionName(clientInfo.getApplicationVersion());

        const promises = [];

        promises.push(deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setBatteryLevel(GoogleSignalFactory.getBatteryLevel(batteryLevel));
        }).catch(() => {
            GoogleSignalFactory.logFailure(nativeBridge, 'batteryLevel');
        }));

        promises.push(deviceInfo.getBatteryStatus().then(batteryStatus => {
            signal.setBatteryState(batteryStatus);
        }).catch(() => {
            GoogleSignalFactory.logFailure(nativeBridge, 'batteryStatus');
        }));

        promises.push(deviceInfo.getConnectionType().then(connectionType => {
            signal.setNetworkType(GoogleSignalFactory.getNetworkType(connectionType));
        }).catch(() => {
            GoogleSignalFactory.logFailure(nativeBridge, 'connectionType');
        }));

        promises.push(deviceInfo.getScreenWidth().then(width => {
            signal.setScreenWidth(width);
        }).catch(() => {
            GoogleSignalFactory.logFailure(nativeBridge, 'screenWidth');
        }));

        promises.push(deviceInfo.getScreenHeight().then(height => {
            signal.setScreenHeight(height);
        }).catch(() => {
            GoogleSignalFactory.logFailure(nativeBridge, 'screenHeight');
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
                GoogleSignalFactory.logFailure(nativeBridge, 'packageInfo');
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

    private static getAppStartTimeInPST(clientInfo: ClientInfo): number {
        return clientInfo.getInitTimestamp() / 1000 - 8 * 3600;
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
}
