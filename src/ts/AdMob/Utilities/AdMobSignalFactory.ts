import { AdMobAdUnit } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { ITouchInfo } from 'AdMob/Views/AFMABridge';
import { IAdsApi } from 'Ads/IAds';
import { IMotionEvent } from 'Ads/Native/Android/AdUnit';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { MotionEventAction } from 'Core/Constants/Android/MotionEventAction';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class AdMobSignalFactory {
    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _focusManager: FocusManager;
    private _packageInstaller: string;
    private _packageVersionCode: number;

    constructor(platform: Platform, core: ICoreApi, ads: IAdsApi, clientInfo: ClientInfo, deviceInfo: DeviceInfo, focusManager: FocusManager) {
        this._platform = platform;
        this._core = core;
        this._ads = ads;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._focusManager = focusManager;
    }

    public getOptionalSignal(): Promise<AdMobOptionalSignal> {
        const signal = new AdMobOptionalSignal();

        signal.setSequenceNumber(SdkStats.getAdRequestOrdinal());
        signal.setIsJailbroken(this._deviceInfo.isRooted());
        signal.setDeviceIncapabilities(this.checkDeviceIncapabilities());
        signal.setDeviceSubModel(this._deviceInfo.getModel());

        const promises = [];
        promises.push(this._deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setDeviceBatteryLevel(batteryLevel);
        }).catch(() => {
            this.logFailure('batteryLevel');
        }));

        promises.push(this._deviceInfo.getBatteryStatus().then(batteryStatus => {
            signal.setIsDeviceCharging(this.getBatteryStatus(this._platform, batteryStatus) === 2);
        }).catch(() => {
            this.logFailure('batteryStatus');
        }));

        if(this._deviceInfo instanceof AndroidDeviceInfo) {
            promises.push(this._deviceInfo.getNetworkMetered().then(isNetworkMetered => {
                signal.setIsNetworkMetered(isNetworkMetered);
            }).catch(() => {
                this.logFailure('networkMetered');
            }));
        } else {
            signal.setIsNetworkMetered(false);
        }

        promises.push(UserCountData.getRequestCount(this._core).then(requestCount => {
            if (typeof requestCount === 'number') {
                signal.setNumPriorUserRequests(requestCount);
            }
        }).catch(() => {
            this.logFailure('numPriorUserRequets');
        }));

        if (this._platform === Platform.ANDROID) {
            promises.push(this._core.DeviceInfo.Android!.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if (packageInfo.versionCode && packageInfo.packageName) {
                    signal.setAndroidMarketVersion(`${packageInfo.versionCode}.${packageInfo.packageName}`);
                } else {
                    signal.setAndroidMarketVersion('null');
                }
            }).catch(() => {
                this.logFailure('androidMarketVersion');
            }));
        }

        promises.push(UserCountData.getClickCount(this._core).then(clickCount => {
            if (typeof clickCount === 'number') {
                signal.setPriorClickCount(clickCount);
            }
        }).catch(() => {
            this.logFailure('priorClickCount');
        }));

        promises.push(UserCountData.getPriorRequestToReadyTime(this._core).then(priorReadyTime => {
            if (typeof priorReadyTime === 'number') {
                signal.setAdLoadDuration(priorReadyTime);
            }
        }).catch(() => {
            this.logFailure('PriorRequestToReadyTime');
        }));

        promises.push(Promise.all([this._deviceInfo.getConnectionType(), this._deviceInfo.getNetworkType()]).then(([connectionType, networkType]) => {
            if (connectionType === 'wifi') {
                signal.setGranularSpeedBucket('wi');
            } else if (connectionType === 'cellular') {
                signal.setGranularSpeedBucket(this.getNetworkValue(networkType));
            } else {
                signal.setGranularSpeedBucket('unknown');
            }
        }).catch(() => {
            this.logFailure('granularSpeedBucket');
        }));

        promises.push(Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            signal.setIUSizes(`${width}x${height}|${height}x${width}`);
        }).catch(() => {
            this.logFailure('iuSizes');
        }));

        return Promise.all(promises).then(() => {
            return signal;
        });
    }

    public getAdRequestSignal(): Promise<AdMobSignal> {
        return this.getCommonSignal();
    }

    public setAdmobPackageInfo(installer: string, versionCode: number): void {
        this._packageInstaller = installer;
        this._packageVersionCode = versionCode;
    }

    public getClickSignal(touchInfo: ITouchInfo, adUnit: AdMobAdUnit): Promise<AdMobSignal> {
        return this.getCommonSignal().then(signal => {
            // todo: touch duration
            // todo: touch distance
            if (touchInfo.diameter) {
                signal.setTouchDiameter(touchInfo.diameter);
            }
            if (touchInfo.pressure) {
                signal.setTouchPressure(touchInfo.pressure);
            }
            if (touchInfo.start) {
                signal.setTouchXDown(touchInfo.start.x);
                signal.setTouchYDown(touchInfo.start.y);
            }
            if (touchInfo.end) {
                signal.setTouchXUp(touchInfo.end.x);
                signal.setTouchYUp(touchInfo.end.y);
            }
            if (touchInfo.duration) {
                signal.setTouchDuration(touchInfo.duration);
            }
            signal.setTouchDownTotal(touchInfo.counts.down);
            signal.setTouchUpTotal(touchInfo.counts.up);
            signal.setTouchMoveTotal(touchInfo.counts.move);
            signal.setTouchCancelTotal(touchInfo.counts.cancel);
            signal.setTimeOnScreen(adUnit.getTimeOnScreen());

            if(signal.getScreenWidth() && signal.getScreenHeight()) {
                if(this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo && this._deviceInfo.getScreenScale()) {
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

            promises.push(this._core.SensorInfo.getAccelerometerData().then(data => {
                if(this._platform === Platform.IOS) {
                    signal.setAccelerometerX(data.x);
                    signal.setAccelerometerY(data.y);
                    signal.setAccelerometerZ(data.z);
                } else {
                    const androidGravityConstant: number = 9.80665; // Android system constant SensorManager.GRAVITY_EARTH
                    signal.setAccelerometerX(data.x / androidGravityConstant * -100);
                    signal.setAccelerometerY(data.y / androidGravityConstant * -100);
                    signal.setAccelerometerZ(data.z / androidGravityConstant * -100);
                }
            }).catch(() => {
                this.logFailure('accelerometer');
            }));

            if(this._platform === Platform.ANDROID) {
                promises.push(this._ads.Android!.AdUnit.getMotionEventCount([MotionEventAction.ACTION_DOWN, MotionEventAction.ACTION_UP, MotionEventAction.ACTION_MOVE, MotionEventAction.ACTION_CANCEL]).then(results => {
                    if(results[MotionEventAction[MotionEventAction.ACTION_DOWN]]) {
                        const downIndex: number = results[MotionEventAction[MotionEventAction.ACTION_DOWN]];

                        return this._ads.Android!.AdUnit.getMotionEventData({ '0': [downIndex] }).then(motionData => {
                            if(motionData['0'] && motionData['0'][downIndex.toString()]) {
                                const motionEvent: IMotionEvent = motionData['0'][downIndex.toString()];
                                signal.setAndroidTouchObscured(motionEvent.isObscured);
                                signal.setTouchToolType(motionEvent.toolType);
                                signal.setTouchSource(motionEvent.source);
                                signal.setTouchDeviceId(motionEvent.deviceId);
                            }
                        }).catch(() => {
                            this.logFailure('motionEventData');
                        });
                    }
                }).catch(() => {
                    this.logFailure('motionEventCount');
                }));
            }
            return Promise.all(promises).then(() => {
                return signal;
            });
        });
    }

    private getCommonSignal(): Promise<AdMobSignal> {
        const signal: AdMobSignal = new AdMobSignal();
        signal.setEventTimestamp(this.getEventTimestamp());
        signal.setSdkVersion(this.getSdkVersion(this._platform, this._clientInfo));
        signal.setOsVersion(this.getOsVersion(this._platform, this._deviceInfo));
        signal.setTimeZoneOffset(this.getTimeZoneOffset());
        signal.setAppActive(this._focusManager.isAppForeground());
        signal.setAppUptime(this.getAppUptime(this._clientInfo));
        signal.setAppStartTime(this.getAppStartTime(this._clientInfo));
        signal.setAppVersionName(this._clientInfo.getApplicationVersion());
        signal.setAppIdName(this._clientInfo.getApplicationName());

        const promises = [];

        promises.push(this._deviceInfo.getBatteryLevel().then(batteryLevel => {
            signal.setBatteryLevel(Math.round(batteryLevel * 100));
        }).catch(() => {
            this.logFailure('batteryLevel');
        }));

        promises.push(this._deviceInfo.getBatteryStatus().then(batteryStatus => {
            signal.setBatteryState(this.getBatteryStatus(this._platform, batteryStatus));
        }).catch(() => {
            this.logFailure('batteryStatus');
        }));

        promises.push(this._deviceInfo.getConnectionType().then(connectionType => {
            signal.setNetworkType(this.getNetworkType(connectionType));
        }).catch(() => {
            this.logFailure('connectionType');
        }));

        promises.push(Promise.all([this._deviceInfo.getScreenWidth(), this._deviceInfo.getScreenHeight()]).then(([width, height]) => {
            if (this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
                signal.setScreenWidth(width * this._deviceInfo.getScreenScale());
                signal.setScreenHeight(height * this._deviceInfo.getScreenScale());
            } else {
                signal.setScreenWidth(width);
                signal.setScreenHeight(height);
            }
            signal.setDeviceOrientation(this.getDeviceScreenOrientation(width, height));
        }).catch(() => {
            this.logFailure('screenWidth');
        }));

        promises.push(this._core.DeviceInfo.getCPUCount().then(cpucount => {
            signal.setCpuCount(cpucount);
        }).catch(() => {
            this.logFailure('cpucount');
        }));

        if(this._platform === Platform.ANDROID) {
            if (this._packageInstaller && this._packageVersionCode) {
                signal.setAppInstaller(this._packageInstaller);
                signal.setAppVersionCode(this._packageVersionCode);
            } else {
                promises.push(this._core.DeviceInfo.Android!.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                    if(packageInfo.installer) {
                        signal.setAppInstaller(packageInfo.installer);
                        this._packageInstaller = packageInfo.installer;
                    } else {
                        signal.setAppInstaller('unknown');
                    }

                    if(packageInfo.versionCode) {
                        signal.setAppVersionCode(packageInfo.versionCode);
                        this._packageVersionCode = packageInfo.versionCode;
                    }
                }).catch(() => {
                    this.logFailure('packageInfo');
                }));
            }

            promises.push(this._core.DeviceInfo.Android!.isUSBConnected().then(usb => {
                signal.setUsbConnected(usb ? 1 : 0);
            }).catch(() => {
                signal.setUsbConnected(2); // failed to get usb connection status
                this.logFailure('usbConnected');
            }));

            // this should only be added to 2.2.1 and above
            if(this._deviceInfo instanceof AndroidDeviceInfo) {
                signal.setApkHash(this._deviceInfo.getApkDigest());
            }

            promises.push(this._core.DeviceInfo.Android!.getCertificateFingerprint().then(certificate => {
                signal.setApkDeveloperSigningCertificateHash(certificate);
            }).catch(() => {
                this.logFailure('apkDeveloperSigningCertificateHash');
            }));

            promises.push(this._core.DeviceInfo.Android!.getUptime().then(uptime => {
                signal.setDeviceUptime(uptime);
            }).catch(() => {
                this.logFailure('deviceUptime');
            }));

            promises.push(this._core.DeviceInfo.Android!.getElapsedRealtime().then(elapsedRealtime => {
                signal.setDeviceElapsedRealtime(elapsedRealtime);
            }).catch(() => {
                this.logFailure('elapsedRealtime');
            }));

            promises.push(this._core.DeviceInfo.Android!.isAdbEnabled().then(adb => {
                signal.setAdbEnabled(adb ? 1 : 0);
            }).catch(() => {
                signal.setAdbEnabled(2);
                this.logFailure('adbEnabled');
            }));
        }

        if(this._platform === Platform.ANDROID) {
            promises.push(this.getAndroidRooted(this._deviceInfo).then(rooted => {
                signal.setRooted(rooted);
            }).catch(() => {
                this.logFailure('rooted');
            }));
        } else {
            signal.setRooted(this.getIosRooted(this._deviceInfo));
        }

        return Promise.all(promises).then(() => {
            return signal;
        });
    }

    private logFailure(field: string) {
        Diagnostics.trigger('signal_failed', {
            signal: field
        });
    }

    private getEventTimestamp(): number {
        return Math.round(Date.now() / 1000);
    }

    private getSdkVersion(platform: Platform, clientInfo: ClientInfo): string {
        if(platform === Platform.IOS) {
            return 'unity-ios-v' + this._clientInfo.getSdkVersionName();
        } else {
            return 'unity-android-v' + this._clientInfo.getSdkVersionName();
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

    private getOsVersion(platform: Platform, deviceInfo: DeviceInfo): string {
        if(platform === Platform.IOS) {
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
        return this._core.DeviceInfo.Android!.getFingerprint().then(fingerprint => {
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

    private getBatteryStatus(platform: Platform, status: number): number {
        if(platform === Platform.IOS) {
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

    private checkDeviceIncapabilities(): string {
        let deviceIncapabilities = '';
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            if (!this._deviceInfo.isGoogleStoreInstalled()) {
                deviceIncapabilities += 'a';
            }
            if (!this._deviceInfo.isGoogleMapsInstalled()) {
                deviceIncapabilities += 'm';
            }
            if (!this._deviceInfo.isTelephonyInstalled()) {
                deviceIncapabilities += 't';
            }
        } else {
            deviceIncapabilities += 'atm';
        }
        return deviceIncapabilities;
    }

    private getNetworkValue(networkType: number): string {
        let bucket: string = 'unknown';
        if (networkType === 0) {
            bucket = 'unknown';
        } else if (networkType === 1 ||
                    networkType === 16 ||
                    networkType === 2 ||
                    networkType === 4 ||
                    networkType === 7 ||
                    networkType === 11) {
            bucket = 'ed';
        } else if (networkType === 3 ||
                    networkType === 5 ||
                    networkType === 6 ||
                    networkType === 8 ||
                    networkType === 9 ||
                    networkType === 10 ||
                    networkType === 12 ||
                    networkType === 14 ||
                    networkType === 15 ||
                    networkType === 17) {
            bucket = '3g';
        } else if (networkType === 13 ||
                    networkType === 18 ||
                    networkType === 19) {
            bucket = '4g';
        }
        return bucket;
    }

}
