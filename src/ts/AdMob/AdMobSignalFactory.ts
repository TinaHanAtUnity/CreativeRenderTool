import { AdMobSignal } from 'Models/AdMobSignal';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { Diagnostics } from 'Utilities/Diagnostics';
import { FocusManager } from 'Managers/FocusManager';
import { ITouchInfo } from 'Views/AFMABridge';
import { AdMobAdUnit } from 'AdUnits/AdMobAdUnit';
import { MotionEventAction } from 'Constants/Android/MotionEventAction';
import { IMotionEvent } from 'Native/Api/AndroidAdUnit';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { AdMobOptionalSignal } from 'Models/AdMobOptionalSignal';
import { SdkStats } from 'Utilities/SdkStats';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { UserMetaData } from 'Models/MetaData/UserMetaData';

export class AdMobSignalFactory {
    private _nativeBridge: NativeBridge;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _focusManager: FocusManager;
    private _metaDataManager: MetaDataManager;

    constructor(nativeBridge: NativeBridge, clientInfo: ClientInfo, deviceInfo: DeviceInfo, focusManager: FocusManager, metaDataManager: MetaDataManager) {
        this._nativeBridge = nativeBridge;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._focusManager = focusManager;
        this._metaDataManager = metaDataManager;
    }

    public getOptionalSignal(adUnit: AdMobAdUnit): Promise<AdMobOptionalSignal> {
        const signal = new AdMobOptionalSignal();

        signal.setAdLoadDuration(adUnit.getRequestToReadyTime());
        signal.setSequenceNumber(SdkStats.getAdRequestOrdinal());
        signal.setIsJailbroken(this._deviceInfo.isRooted());
        signal.setIsDeviceCharging(this.checkChargingStatus());
        signal.setDeviceIncapabilities(this.checkDeviceIncapabilities());

        const promises = [];
        promises.push(this._deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setDeviceBatteryLevel(this.getBatteryLevel(batteryLevel));
        }).catch(() => {
            this.logFailure(this._nativeBridge, 'batteryLevel');
        }));

        promises.push(this._metaDataManager.fetch(UserMetaData, false).then(user => {
            if (user) {
                signal.setPriorClickCount(user.getClickCount());
            }
        }).catch(() => {
            this.logFailure(this._nativeBridge, 'priorClickCount');
        }));

        promises.push(this._metaDataManager.fetch(UserMetaData, false).then(user => {
            if (user) {
                signal.setNumPriorUserRequests(user.getRequestCount());
            }
        }).catch(() => {
            this.logFailure(this._nativeBridge, 'numPriorUserRequests');
        }));

        return Promise.all(promises).then(() => {
            return signal;
        });
    }

    public getAdRequestSignal(): Promise<AdMobSignal> {
        return this.getCommonSignal();
    }

    public getClickSignal(touchInfo: ITouchInfo, adUnit: AdMobAdUnit): Promise<AdMobSignal> {
        return this.getCommonSignal().then(signal => {
            // todo: touch duration
            // todo: touch distance

            signal.setTouchDiameter(touchInfo.diameter);
            signal.setTouchPressure(touchInfo.pressure);
            signal.setTouchXDown(touchInfo.start.x);
            signal.setTouchYDown(touchInfo.start.y);
            signal.setTouchXUp(touchInfo.end.x);
            signal.setTouchYUp(touchInfo.end.y);
            signal.setTouchDownTotal(touchInfo.counts.down);
            signal.setTouchUpTotal(touchInfo.counts.up);
            signal.setTouchMoveTotal(touchInfo.counts.move);
            signal.setTouchCancelTotal(touchInfo.counts.cancel);
            signal.setTimeOnScreen(adUnit.getTimeOnScreen());

            if(signal.getScreenWidth() && signal.getScreenHeight()) {
                if(this._clientInfo.getPlatform() === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo && this._deviceInfo.getScreenScale()) {
                    signal.setAdViewWidth(this.getIosViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenScale()));
                    signal.setAdViewHeight(this.getIosViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenScale()));
                } else if(this._deviceInfo instanceof AndroidDeviceInfo && this._deviceInfo.getScreenDensity()) {
                    signal.setAdViewWidth(this.getAndroidViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenDensity()));
                    signal.setAdViewHeight(this.getAndroidViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenDensity()));
                }
            }

            signal.setAdViewX(0);
            signal.setAdViewY(0);
            signal.setMinimumAlpha(100); // our views are never transparent

            const promises = [];

            promises.push(this._nativeBridge.SensorInfo.getAccelerometerData().then(data => {
                if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    signal.setAccelerometerX(data.x);
                    signal.setAccelerometerY(data.y);
                    signal.setAccelerometerZ(data.z);
                } else {
                    const androidGravityConstant: number = 9.80665; // Android system constant SensorManager.GRAVITY_EARTH
                    signal.setAccelerometerX(data.x / androidGravityConstant * -100);
                    signal.setAccelerometerX(data.y / androidGravityConstant * -100);
                    signal.setAccelerometerX(data.z / androidGravityConstant * -100);
                }
            }).catch(() => {
                this.logFailure(this._nativeBridge, 'accelerometer');
            }));

            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                promises.push(this._nativeBridge.AndroidAdUnit.getMotionEventCount([MotionEventAction.ACTION_DOWN, MotionEventAction.ACTION_UP, MotionEventAction.ACTION_MOVE, MotionEventAction.ACTION_CANCEL]).then(results => {
                    if(results[MotionEventAction[MotionEventAction.ACTION_DOWN]]) {
                        const downIndex: number = results[MotionEventAction[MotionEventAction.ACTION_DOWN]];

                        return this._nativeBridge.AndroidAdUnit.getMotionEventData({ "0": [downIndex] }).then(motionData => {
                            if(motionData["0"] && motionData["0"][downIndex.toString()]) {
                                const motionEvent: IMotionEvent = motionData["0"][downIndex.toString()];
                                signal.setAndroidTouchObscured(motionEvent.isObscured);
                                signal.setTouchToolType(motionEvent.toolType);
                                signal.setTouchSource(motionEvent.source);
                                signal.setTouchDeviceId(motionEvent.deviceId);
                            }
                        }).catch(() => {
                            this.logFailure(this._nativeBridge, 'motionEventData');
                        });
                    }
                }).catch(() => {
                    this.logFailure(this._nativeBridge,'motionEventCount');
                }));
            }
            return Promise.all(promises).then(() => {
                return signal;
            });
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
            if (this._nativeBridge.getPlatform() === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
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

        promises.push(this._nativeBridge.DeviceInfo.getCPUCount().then(cpucount => {
            signal.setCpuCount(cpucount);
        }).catch(() => {
            this.logFailure(nativeBridge, 'cpucount');
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

            promises.push(this._nativeBridge.DeviceInfo.Android.isUSBConnected().then(usb => {
                signal.setUsbConnected(usb ? 1 : 0);
            }).catch(() => {
                signal.setUsbConnected(2); // failed to get usb connection status
                this.logFailure(nativeBridge, 'usbConnected');
            }));

            promises.push(this._nativeBridge.DeviceInfo.Android.getApkDigest().then(apkdigest => {
                signal.setApkHash(apkdigest);
            }).catch(() => {
                this.logFailure(nativeBridge, 'apkHash');
            }));

            promises.push(this._nativeBridge.DeviceInfo.Android.getCertificateFingerprint().then(certificate => {
                signal.setApkDeveloperSigningCertificateHash(certificate);
            }).catch(() => {
                this.logFailure(nativeBridge, 'apkDeveloperSigningCertificateHash');
            }));

            promises.push(this._nativeBridge.DeviceInfo.Android.getUptime().then(uptime => {
                signal.setDeviceUptime(uptime);
            }).catch(() => {
                this.logFailure(nativeBridge, 'deviceUptime');
            }));

            promises.push(this._nativeBridge.DeviceInfo.Android.getElapsedRealtime().then(elapsedRealtime => {
                signal.setDeviceElapsedRealtime(elapsedRealtime);
            }).catch(() => {
                this.logFailure(nativeBridge, 'elapsedRealtime');
            }));

            promises.push(this._nativeBridge.DeviceInfo.Android.isAdbEnabled().then(adb => {
                signal.setAdbEnabled(adb ? 1 : 0);
            }).catch(() => {
                signal.setAdbEnabled(2);
                this.logFailure(nativeBridge, 'adbEnabled');
            }));
        }

        if(nativeBridge.getPlatform() === Platform.ANDROID) {
            promises.push(this.getAndroidRooted(this._deviceInfo).then(rooted => {
                signal.setRooted(rooted);
            }).catch(() => {
                this.logFailure(nativeBridge, 'rooted');
            }));
        } else {
            signal.setRooted(this.getIosRooted(this._deviceInfo));
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

    private getIosRooted(deviceInfo: DeviceInfo): number {
        if(deviceInfo instanceof IosDeviceInfo && deviceInfo.isSimulator()) { // not available on Android
            return 2;
        } else if(deviceInfo.isRooted()) {
            return 1;
        } else {
            return 0;
        }
    }

    private getAndroidRooted(deviceInfo: DeviceInfo): Promise<number> {
        return this._nativeBridge.DeviceInfo.Android.getFingerprint().then(fingerprint => {
            if(fingerprint.indexOf('generic') >= 0) {
                return 2; // simulator
            } else if(deviceInfo.isRooted()) {
                return 1;
            } else {
                return 0;
            }
        });
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

    private checkChargingStatus(): boolean {
        if (this._deviceInfo.get('batteryStatus') === 2) {
            return true;
        }
        return false;
    }

    private checkDeviceIncapabilities(): string {
        let deviceIncapabilities = '';
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            if (!(<AndroidDeviceInfo>this._deviceInfo).isGoogleStoreInstalled()) {
                deviceIncapabilities += 'a';
            }
            if (!(<AndroidDeviceInfo>this._deviceInfo).isGoogleMapsInstalled()) {
                deviceIncapabilities += 'm';
            }
            if (!(<AndroidDeviceInfo>this._deviceInfo).isTelephonyInstalled()) {
                deviceIncapabilities += 't';
            }
        } else {
            deviceIncapabilities += 'atm';
        }
        return deviceIncapabilities;
    }
}
