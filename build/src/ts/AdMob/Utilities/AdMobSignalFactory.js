import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { MotionEventAction } from 'Core/Constants/Android/MotionEventAction';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { OMID_P, SDK_APIS } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
export class AdMobSignalFactory {
    constructor(platform, core, ads, clientInfo, deviceInfo, focusManager) {
        this._platform = platform;
        this._core = core;
        this._ads = ads;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._focusManager = focusManager;
    }
    getOptionalSignal() {
        const signal = new AdMobOptionalSignal();
        signal.setSequenceNumber(SdkStats.getAdRequestOrdinal());
        signal.setIsJailbroken(this._deviceInfo.isRooted());
        signal.setDeviceIncapabilities(this.checkDeviceIncapabilities());
        signal.setDeviceSubModel(this._deviceInfo.getModel());
        signal.setSDKApis(OMID_P); // TODO: Add to Request DTO once auction handles parameter
        signal.setOMIDP(SDK_APIS); // TODO: Add to Request DTO once auction handles parameter
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
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            promises.push(this._deviceInfo.getNetworkMetered().then(isNetworkMetered => {
                signal.setIsNetworkMetered(isNetworkMetered);
            }).catch(() => {
                this.logFailure('networkMetered');
            }));
        }
        else {
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
            promises.push(this._core.DeviceInfo.Android.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                if (packageInfo.versionCode && packageInfo.packageName) {
                    signal.setAndroidMarketVersion(`${packageInfo.versionCode}.${packageInfo.packageName}`);
                }
                else {
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
            }
            else if (connectionType === 'cellular') {
                signal.setGranularSpeedBucket(this.getNetworkValue(networkType));
            }
            else {
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
    getAdRequestSignal() {
        return this.getCommonSignal();
    }
    setAdmobPackageInfo(installer, versionCode) {
        this._packageInstaller = installer;
        this._packageVersionCode = versionCode;
    }
    getClickSignal(touchInfo, adUnit) {
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
            if (signal.getScreenWidth() && signal.getScreenHeight()) {
                if (this._platform === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo && this._deviceInfo.getScreenScale()) {
                    signal.setAdViewWidth(this.getIosViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenScale()));
                    signal.setAdViewHeight(this.getIosViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenScale()));
                }
                else if (this._deviceInfo instanceof AndroidDeviceInfo && this._deviceInfo.getScreenDensity()) {
                    signal.setAdViewWidth(this.getAndroidViewWidth(signal.getScreenWidth(), this._deviceInfo.getScreenDensity()));
                    signal.setAdViewHeight(this.getAndroidViewHeight(signal.getScreenHeight(), this._deviceInfo.getScreenDensity()));
                }
            }
            signal.setAdViewX(0);
            signal.setAdViewY(0);
            signal.setMinimumAlpha(100); // our views are never transparent
            const promises = [];
            promises.push(this._core.SensorInfo.getAccelerometerData().then(data => {
                if (this._platform === Platform.IOS) {
                    signal.setAccelerometerX(data.x);
                    signal.setAccelerometerY(data.y);
                    signal.setAccelerometerZ(data.z);
                }
                else {
                    const androidGravityConstant = 9.80665; // Android system constant SensorManager.GRAVITY_EARTH
                    signal.setAccelerometerX(data.x / androidGravityConstant * -100);
                    signal.setAccelerometerY(data.y / androidGravityConstant * -100);
                    signal.setAccelerometerZ(data.z / androidGravityConstant * -100);
                }
            }).catch(() => {
                this.logFailure('accelerometer');
            }));
            if (this._platform === Platform.ANDROID) {
                promises.push(this._ads.Android.AdUnit.getMotionEventCount([MotionEventAction.ACTION_DOWN, MotionEventAction.ACTION_UP, MotionEventAction.ACTION_MOVE, MotionEventAction.ACTION_CANCEL]).then(results => {
                    if (results[MotionEventAction[MotionEventAction.ACTION_DOWN]]) {
                        const downIndex = results[MotionEventAction[MotionEventAction.ACTION_DOWN]];
                        return this._ads.Android.AdUnit.getMotionEventData({ '0': [downIndex] }).then(motionData => {
                            if (motionData['0'] && motionData['0'][downIndex.toString()]) {
                                const motionEvent = motionData['0'][downIndex.toString()];
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
    getCommonSignal() {
        const signal = new AdMobSignal();
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
            }
            else {
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
        if (this._platform === Platform.ANDROID) {
            if (this._packageInstaller && this._packageVersionCode) {
                signal.setAppInstaller(this._packageInstaller);
                signal.setAppVersionCode(this._packageVersionCode);
            }
            else {
                promises.push(this._core.DeviceInfo.Android.getPackageInfo(this._clientInfo.getApplicationName()).then(packageInfo => {
                    if (packageInfo.installer) {
                        signal.setAppInstaller(packageInfo.installer);
                        this._packageInstaller = packageInfo.installer;
                    }
                    else {
                        signal.setAppInstaller('unknown');
                    }
                    if (packageInfo.versionCode) {
                        signal.setAppVersionCode(packageInfo.versionCode);
                        this._packageVersionCode = packageInfo.versionCode;
                    }
                }).catch(() => {
                    this.logFailure('packageInfo');
                }));
            }
            promises.push(this._core.DeviceInfo.Android.isUSBConnected().then(usb => {
                signal.setUsbConnected(usb ? 1 : 0);
            }).catch(() => {
                signal.setUsbConnected(2); // failed to get usb connection status
                this.logFailure('usbConnected');
            }));
            // this should only be added to 2.2.1 and above
            if (this._deviceInfo instanceof AndroidDeviceInfo) {
                signal.setApkHash(this._deviceInfo.getApkDigest());
            }
            promises.push(this._core.DeviceInfo.Android.getCertificateFingerprint().then(certificate => {
                signal.setApkDeveloperSigningCertificateHash(certificate);
            }).catch(() => {
                this.logFailure('apkDeveloperSigningCertificateHash');
            }));
            promises.push(this._core.DeviceInfo.Android.getUptime().then(uptime => {
                signal.setDeviceUptime(uptime);
            }).catch(() => {
                this.logFailure('deviceUptime');
            }));
            promises.push(this._core.DeviceInfo.Android.getElapsedRealtime().then(elapsedRealtime => {
                signal.setDeviceElapsedRealtime(elapsedRealtime);
            }).catch(() => {
                this.logFailure('elapsedRealtime');
            }));
            promises.push(this._core.DeviceInfo.Android.isAdbEnabled().then(adb => {
                signal.setAdbEnabled(adb ? 1 : 0);
            }).catch(() => {
                signal.setAdbEnabled(2);
                this.logFailure('adbEnabled');
            }));
        }
        if (this._platform === Platform.ANDROID) {
            promises.push(this.getAndroidRooted(this._deviceInfo).then(rooted => {
                signal.setRooted(rooted);
            }).catch(() => {
                this.logFailure('rooted');
            }));
        }
        else {
            signal.setRooted(this.getIosRooted(this._deviceInfo));
        }
        return Promise.all(promises).then(() => {
            return signal;
        });
    }
    logFailure(field) {
        Diagnostics.trigger('signal_failed', {
            signal: field
        });
    }
    getEventTimestamp() {
        return Math.round(Date.now() / 1000);
    }
    getSdkVersion(platform, clientInfo) {
        if (platform === Platform.IOS) {
            return 'unity-ios-v' + this._clientInfo.getSdkVersionName();
        }
        else {
            return 'unity-android-v' + this._clientInfo.getSdkVersionName();
        }
    }
    getNetworkType(type) {
        if (type === 'wifi') {
            return 1;
        }
        else if (type === 'cellular') {
            return 0;
        }
        else {
            return -1;
        }
    }
    getOsVersion(platform, deviceInfo) {
        if (platform === Platform.IOS) {
            const model = deviceInfo.getModel().split(' ')[0];
            return model.replace(/[0-9]+,[0-9]+$/, '') + ' ' + deviceInfo.getOsVersion();
        }
        else {
            return deviceInfo.getOsVersion();
        }
    }
    getTimeZoneOffset() {
        // the number of minutes from UTC plus one day
        return new Date().getTimezoneOffset() * -1 + 1440;
    }
    getAppUptime(clientInfo) {
        return Math.round((Date.now() - clientInfo.getInitTimestamp()) / 1000);
    }
    getAppStartTime(clientInfo) {
        return Math.round(clientInfo.getInitTimestamp() / 1000);
    }
    getIosRooted(deviceInfo) {
        if (deviceInfo instanceof IosDeviceInfo && deviceInfo.isSimulator()) { // not available on Android
            return 2;
        }
        else if (deviceInfo.isRooted()) {
            return 1;
        }
        else {
            return 0;
        }
    }
    getAndroidRooted(deviceInfo) {
        return this._core.DeviceInfo.Android.getFingerprint().then(fingerprint => {
            if (fingerprint.indexOf('generic') >= 0) {
                return 2; // simulator
            }
            else if (deviceInfo.isRooted()) {
                return 1;
            }
            else {
                return 0;
            }
        });
    }
    getIosViewWidth(width, scale) {
        return width / scale;
    }
    getIosViewHeight(height, scale) {
        return height / scale;
    }
    getAndroidViewWidth(width, density) {
        return width / (density / 160);
    }
    getAndroidViewHeight(height, density) {
        return height / (density / 160);
    }
    getBatteryStatus(platform, status) {
        if (platform === Platform.IOS) {
            return status;
        }
        else {
            switch (status) {
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
    getDeviceScreenOrientation(width, height) {
        if (width === height) {
            return 20; // square
        }
        else if (width > height) {
            return 3; // landscape left
        }
        else {
            return 1; // portrait
        }
    }
    checkDeviceIncapabilities() {
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
        }
        else {
            deviceIncapabilities += 'atm';
        }
        return deviceIncapabilities;
    }
    getNetworkValue(networkType) {
        let bucket = 'unknown';
        if (networkType === 0) {
            bucket = 'unknown';
        }
        else if (networkType === 1 ||
            networkType === 16 ||
            networkType === 2 ||
            networkType === 4 ||
            networkType === 7 ||
            networkType === 11) {
            bucket = 'ed';
        }
        else if (networkType === 3 ||
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
        }
        else if (networkType === 13 ||
            networkType === 18 ||
            networkType === 19) {
            bucket = '4g';
        }
        return bucket;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JTaWduYWxGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0FkTW9iL1V0aWxpdGllcy9BZE1vYlNpZ25hbEZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXZELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDN0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBR2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDekQsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUU3RSxNQUFNLE9BQU8sa0JBQWtCO0lBVTNCLFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsR0FBWSxFQUFFLFVBQXNCLEVBQUUsVUFBc0IsRUFBRSxZQUEwQjtRQUNwSSxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNoQixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztJQUN0QyxDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE1BQU0sTUFBTSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUV6QyxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUN6RCxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwRCxNQUFNLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztRQUNqRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQywwREFBMEQ7UUFDckYsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLDBEQUEwRDtRQUVyRixNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUNqRSxNQUFNLENBQUMscUJBQXFCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNuRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0YsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLElBQUksSUFBSSxDQUFDLFdBQVcsWUFBWSxpQkFBaUIsRUFBRTtZQUMvQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtnQkFDdkUsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNQO2FBQU07WUFDSCxNQUFNLENBQUMsbUJBQW1CLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDckM7UUFFRCxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUN4RSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRTtnQkFDbEMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2hEO1FBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtnQkFDbEgsSUFBSSxXQUFXLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUU7b0JBQ3BELE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7aUJBQzNGO3FCQUFNO29CQUNILE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDMUM7WUFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ1A7UUFFRCxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNwRSxJQUFJLE9BQU8sVUFBVSxLQUFLLFFBQVEsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQ3pDO1FBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUNyRixJQUFJLE9BQU8sY0FBYyxLQUFLLFFBQVEsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQzVDO1FBQ0wsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUU7WUFDeEksSUFBSSxjQUFjLEtBQUssTUFBTSxFQUFFO2dCQUMzQixNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkM7aUJBQU0sSUFBSSxjQUFjLEtBQUssVUFBVSxFQUFFO2dCQUN0QyxNQUFNLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQ3BFO2lCQUFNO2dCQUNILE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM1QztRQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtZQUN4SCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDbkMsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQ2xDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLFdBQW1CO1FBQzdELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUM7UUFDbkMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLFdBQVcsQ0FBQztJQUMzQyxDQUFDO0lBRU0sY0FBYyxDQUFDLFNBQXFCLEVBQUUsTUFBbUI7UUFDNUQsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hDLHVCQUF1QjtZQUN2Qix1QkFBdUI7WUFDdkIsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUNwQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUNwQixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQy9DO1lBQ0QsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO2dCQUNqQixNQUFNLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMzQztZQUNELElBQUksU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDZixNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QztZQUNELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtnQkFDcEIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUMvQztZQUNELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1QyxNQUFNLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNoRCxNQUFNLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO1lBRWpELElBQUksTUFBTSxDQUFDLGNBQWMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsRUFBRTtnQkFDckQsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsWUFBWSxhQUFhLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDbkgsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDeEcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUM5RztxQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLFlBQVksaUJBQWlCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO29CQUM3RixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDOUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3BIO2FBQ0o7WUFFRCxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztZQUUvRCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFcEIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxHQUFHLEVBQUU7b0JBQ2pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BDO3FCQUFNO29CQUNILE1BQU0sc0JBQXNCLEdBQVcsT0FBTyxDQUFDLENBQUMsc0RBQXNEO29CQUN0RyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNqRSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxzQkFBc0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNwRTtZQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7Z0JBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRUosSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ3JNLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUU7d0JBQzNELE1BQU0sU0FBUyxHQUFXLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO3dCQUVwRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBUSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7NEJBQ3hGLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRTtnQ0FDMUQsTUFBTSxXQUFXLEdBQWlCLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQ0FDeEUsTUFBTSxDQUFDLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQ0FDdkQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDOUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0NBQzFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7NkJBQ2pEO3dCQUNMLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO3dCQUN2QyxDQUFDLENBQUMsQ0FBQztxQkFDTjtnQkFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO29CQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNQO1lBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ25DLE9BQU8sTUFBTSxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sZUFBZTtRQUNuQixNQUFNLE1BQU0sR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM5QyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMzRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztRQUMxRCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDekQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQy9ELE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztRQUNuRSxNQUFNLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBRTNELE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVwQixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ2pFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ25FLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNqRixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRUosUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3JFLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRTtZQUN4SCxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxZQUFZLGFBQWEsRUFBRTtnQkFDOUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7YUFDdEU7aUJBQU07Z0JBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNsQztZQUNELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzlELE1BQU0sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVKLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JDLElBQUksSUFBSSxDQUFDLGlCQUFpQixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtnQkFDcEQsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQ3REO2lCQUFNO2dCQUNILFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7b0JBQ2xILElBQUksV0FBVyxDQUFDLFNBQVMsRUFBRTt3QkFDdkIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQzlDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO3FCQUNsRDt5QkFBTTt3QkFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO3FCQUNyQztvQkFFRCxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUU7d0JBQ3pCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ2xELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDO3FCQUN0RDtnQkFDTCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO29CQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDUDtZQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDckUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsc0NBQXNDO2dCQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ3BDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSiwrQ0FBK0M7WUFDL0MsSUFBSSxJQUFJLENBQUMsV0FBVyxZQUFZLGlCQUFpQixFQUFFO2dCQUMvQyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQzthQUN0RDtZQUVELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLHlCQUF5QixFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUN4RixNQUFNLENBQUMscUNBQXFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDbkUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO2dCQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDcEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFO2dCQUNyRixNQUFNLENBQUMsd0JBQXdCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVKLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBUSxDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbkUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUDtRQUVELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ2hFLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtnQkFDVixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDUDthQUFNO1lBQ0gsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1NBQ3pEO1FBRUQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDbkMsT0FBTyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sVUFBVSxDQUFDLEtBQWE7UUFDNUIsV0FBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUU7WUFDakMsTUFBTSxFQUFFLEtBQUs7U0FDaEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGlCQUFpQjtRQUNyQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTyxhQUFhLENBQUMsUUFBa0IsRUFBRSxVQUFzQjtRQUM1RCxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzNCLE9BQU8sYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztTQUMvRDthQUFNO1lBQ0gsT0FBTyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLENBQUM7U0FDbkU7SUFDTCxDQUFDO0lBRU8sY0FBYyxDQUFDLElBQVk7UUFDL0IsSUFBSSxJQUFJLEtBQUssTUFBTSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDNUIsT0FBTyxDQUFDLENBQUM7U0FDWjthQUFNO1lBQ0gsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVPLFlBQVksQ0FBQyxRQUFrQixFQUFFLFVBQXNCO1FBQzNELElBQUksUUFBUSxLQUFLLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDM0IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNoRjthQUFNO1lBQ0gsT0FBTyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDcEM7SUFDTCxDQUFDO0lBRU8saUJBQWlCO1FBQ3JCLDhDQUE4QztRQUM5QyxPQUFPLElBQUksSUFBSSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDdEQsQ0FBQztJQUVPLFlBQVksQ0FBQyxVQUFzQjtRQUN2QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRU8sZUFBZSxDQUFDLFVBQXNCO1FBQzFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU8sWUFBWSxDQUFDLFVBQXNCO1FBQ3ZDLElBQUksVUFBVSxZQUFZLGFBQWEsSUFBSSxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUUsRUFBRSwyQkFBMkI7WUFDOUYsT0FBTyxDQUFDLENBQUM7U0FDWjthQUFNLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFBTTtZQUNILE9BQU8sQ0FBQyxDQUFDO1NBQ1o7SUFDTCxDQUFDO0lBRU8sZ0JBQWdCLENBQUMsVUFBc0I7UUFDM0MsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFRLENBQUMsY0FBYyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3RFLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWTthQUN6QjtpQkFBTSxJQUFJLFVBQVUsQ0FBQyxRQUFRLEVBQUUsRUFBRTtnQkFDOUIsT0FBTyxDQUFDLENBQUM7YUFDWjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsQ0FBQzthQUNaO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sZUFBZSxDQUFDLEtBQWEsRUFBRSxLQUFhO1FBQ2hELE9BQU8sS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN6QixDQUFDO0lBRU8sZ0JBQWdCLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDbEQsT0FBTyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUN0RCxPQUFPLEtBQUssR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU8sb0JBQW9CLENBQUMsTUFBYyxFQUFFLE9BQWU7UUFDeEQsT0FBTyxNQUFNLEdBQUcsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVPLGdCQUFnQixDQUFDLFFBQWtCLEVBQUUsTUFBYztRQUN2RCxJQUFJLFFBQVEsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO1lBQzNCLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO2FBQU07WUFDSCxRQUFRLE1BQU0sRUFBRTtnQkFDWixLQUFLLENBQUMsRUFBRSx5QkFBeUI7b0JBQzdCLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVTtnQkFDeEIsS0FBSyxDQUFDLEVBQUUsMEJBQTBCO29CQUM5QixPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVc7Z0JBQ3pCLEtBQUssQ0FBQyxFQUFFLDZCQUE2QjtvQkFDakMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZO2dCQUMxQixLQUFLLENBQUMsRUFBRSw4QkFBOEI7b0JBQ2xDLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWTtnQkFDMUIsS0FBSyxDQUFDLEVBQUUsc0JBQXNCO29CQUMxQixPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU87Z0JBQ3JCO29CQUNJLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVTthQUMzQjtTQUNKO0lBQ0wsQ0FBQztJQUVPLDBCQUEwQixDQUFDLEtBQWEsRUFBRSxNQUFjO1FBQzVELElBQUksS0FBSyxLQUFLLE1BQU0sRUFBRTtZQUNsQixPQUFPLEVBQUUsQ0FBQyxDQUFDLFNBQVM7U0FDdkI7YUFBTSxJQUFJLEtBQUssR0FBRyxNQUFNLEVBQUU7WUFDdkIsT0FBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7U0FDOUI7YUFBTTtZQUNILE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVztTQUN4QjtJQUNMLENBQUM7SUFFTyx5QkFBeUI7UUFDN0IsSUFBSSxvQkFBb0IsR0FBRyxFQUFFLENBQUM7UUFDOUIsSUFBSSxJQUFJLENBQUMsV0FBVyxZQUFZLGlCQUFpQixFQUFFO1lBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHNCQUFzQixFQUFFLEVBQUU7Z0JBQzVDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQzthQUMvQjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7Z0JBQzNDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQzthQUMvQjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLEVBQUU7Z0JBQzFDLG9CQUFvQixJQUFJLEdBQUcsQ0FBQzthQUMvQjtTQUNKO2FBQU07WUFDSCxvQkFBb0IsSUFBSSxLQUFLLENBQUM7U0FDakM7UUFDRCxPQUFPLG9CQUFvQixDQUFDO0lBQ2hDLENBQUM7SUFFTyxlQUFlLENBQUMsV0FBbUI7UUFDdkMsSUFBSSxNQUFNLEdBQVcsU0FBUyxDQUFDO1FBQy9CLElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtZQUNuQixNQUFNLEdBQUcsU0FBUyxDQUFDO1NBQ3RCO2FBQU0sSUFBSSxXQUFXLEtBQUssQ0FBQztZQUNoQixXQUFXLEtBQUssRUFBRTtZQUNsQixXQUFXLEtBQUssQ0FBQztZQUNqQixXQUFXLEtBQUssQ0FBQztZQUNqQixXQUFXLEtBQUssQ0FBQztZQUNqQixXQUFXLEtBQUssRUFBRSxFQUFFO1lBQzVCLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDakI7YUFBTSxJQUFJLFdBQVcsS0FBSyxDQUFDO1lBQ2hCLFdBQVcsS0FBSyxDQUFDO1lBQ2pCLFdBQVcsS0FBSyxDQUFDO1lBQ2pCLFdBQVcsS0FBSyxDQUFDO1lBQ2pCLFdBQVcsS0FBSyxDQUFDO1lBQ2pCLFdBQVcsS0FBSyxFQUFFO1lBQ2xCLFdBQVcsS0FBSyxFQUFFO1lBQ2xCLFdBQVcsS0FBSyxFQUFFO1lBQ2xCLFdBQVcsS0FBSyxFQUFFO1lBQ2xCLFdBQVcsS0FBSyxFQUFFLEVBQUU7WUFDNUIsTUFBTSxHQUFHLElBQUksQ0FBQztTQUNqQjthQUFNLElBQUksV0FBVyxLQUFLLEVBQUU7WUFDakIsV0FBVyxLQUFLLEVBQUU7WUFDbEIsV0FBVyxLQUFLLEVBQUUsRUFBRTtZQUM1QixNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKIn0=