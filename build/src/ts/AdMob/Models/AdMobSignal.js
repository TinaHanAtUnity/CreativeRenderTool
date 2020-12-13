import { Model } from 'Core/Models/Model';
import * as protobuf from 'protobufjs/minimal';
import { unity_proto } from 'unity_proto.js';
export class AdMobSignal extends Model {
    constructor() {
        super('AdMobSignal', {
            sdkVersion: ['string'],
            batteryLevel: ['number'],
            batteryState: ['number'],
            accelerometerX: ['number'],
            accelerometerY: ['number'],
            accelerometerZ: ['number'],
            networkType: ['number'],
            deviceOrientation: ['number'],
            touchXUp: ['number'],
            touchXDown: ['number'],
            touchYUp: ['number'],
            touchYDown: ['number'],
            touchDuration: ['number'],
            touchPressure: ['number'],
            touchDiameter: ['number'],
            cpuCount: ['number'],
            touchUpTotal: ['number'],
            touchDownTotal: ['number'],
            touchMoveTotal: ['number'],
            touchCancelTotal: ['number'],
            osVersion: ['string'],
            timeZoneOffset: ['number'],
            usbConnected: ['number'],
            appActive: ['boolean'],
            appUptime: ['number'],
            appStartTime: ['number'],
            rooted: ['number'],
            eventTimestamp: ['number'],
            apkHash: ['string'],
            apkDeveloperSigningCertificateHash: ['string'],
            appVersionName: ['string'],
            appVersionCode: ['number'],
            appIdName: ['string'],
            appInstaller: ['string'],
            deviceUptime: ['number'],
            deviceElapsedRealtime: ['number'],
            adbEnabled: ['number'],
            timeOnScreen: ['number'],
            minimumAlpha: ['number'],
            adViewWidth: ['number'],
            adViewHeight: ['number'],
            androidTouchObscured: ['boolean'],
            touchToolType: ['number'],
            touchSource: ['number'],
            touchDeviceId: ['number'],
            touchDistance: ['number'],
            adViewX: ['number'],
            adViewY: ['number'],
            screenWidth: ['number'],
            screenHeight: ['number']
        });
    }
    getSdkVersion() {
        return this.get('sdkVersion');
    }
    setSdkVersion(sdkVersion) {
        this.set('sdkVersion', sdkVersion);
    }
    getBatteryLevel() {
        return this.get('batteryLevel');
    }
    setBatteryLevel(batteryLevel) {
        this.set('batteryLevel', batteryLevel);
    }
    getBatteryState() {
        return this.get('batteryState');
    }
    setBatteryState(batteryState) {
        this.set('batteryState', batteryState);
    }
    getAccelerometerX() {
        return this.get('accelerometerX');
    }
    setAccelerometerX(accelerometerX) {
        this.set('accelerometerX', accelerometerX);
    }
    getAccelerometerY() {
        return this.get('accelerometerY');
    }
    setAccelerometerY(accelerometerY) {
        this.set('accelerometerY', accelerometerY);
    }
    getAccelerometerZ() {
        return this.get('accelerometerZ');
    }
    setAccelerometerZ(accelerometerZ) {
        this.set('accelerometerZ', accelerometerZ);
    }
    getNetworkType() {
        return this.get('networkType');
    }
    setNetworkType(networkType) {
        this.set('networkType', networkType);
    }
    getDeviceOrientation() {
        return this.get('deviceOrientation');
    }
    setDeviceOrientation(deviceOrientation) {
        this.set('deviceOrientation', deviceOrientation);
    }
    getTouchXUp() {
        return this.get('touchXUp');
    }
    setTouchXUp(touchXUp) {
        this.set('touchXUp', touchXUp);
    }
    getTouchXDown() {
        return this.get('touchXDown');
    }
    setTouchXDown(touchXDown) {
        this.set('touchXDown', touchXDown);
    }
    getTouchYUp() {
        return this.get('touchYUp');
    }
    setTouchYUp(touchYUp) {
        this.set('touchYUp', touchYUp);
    }
    getTouchYDown() {
        return this.get('touchYDown');
    }
    setTouchYDown(touchYDown) {
        this.set('touchYDown', touchYDown);
    }
    getTouchDuration() {
        return this.get('touchDuration');
    }
    setTouchDuration(touchDuration) {
        this.set('touchDuration', touchDuration);
    }
    getTouchPressure() {
        return this.get('touchPressure');
    }
    setTouchPressure(touchPressure) {
        this.set('touchPressure', touchPressure);
    }
    getTouchDiameter() {
        return this.get('touchDiameter');
    }
    setTouchDiameter(touchDiameter) {
        this.set('touchDiameter', touchDiameter);
    }
    getCpuCount() {
        return this.get('cpuCount');
    }
    setCpuCount(cpuCount) {
        this.set('cpuCount', cpuCount);
    }
    getTouchUpTotal() {
        return this.get('touchUpTotal');
    }
    setTouchUpTotal(touchUpTotal) {
        this.set('touchUpTotal', touchUpTotal);
    }
    getTouchDownTotal() {
        return this.get('touchDownTotal');
    }
    setTouchDownTotal(touchDownTotal) {
        this.set('touchDownTotal', touchDownTotal);
    }
    getTouchMoveTotal() {
        return this.get('touchMoveTotal');
    }
    setTouchMoveTotal(touchMoveTotal) {
        this.set('touchMoveTotal', touchMoveTotal);
    }
    getTouchCancelTotal() {
        return this.get('touchCancelTotal');
    }
    setTouchCancelTotal(touchCancelTotal) {
        this.set('touchCancelTotal', touchCancelTotal);
    }
    getOsVersion() {
        return this.get('osVersion');
    }
    setOsVersion(osVersion) {
        this.set('osVersion', osVersion);
    }
    getTimeZoneOffset() {
        return this.get('timeZoneOffset');
    }
    setTimeZoneOffset(timeZoneOffset) {
        this.set('timeZoneOffset', timeZoneOffset);
    }
    getUsbConnected() {
        return this.get('usbConnected');
    }
    setUsbConnected(usbConnected) {
        this.set('usbConnected', usbConnected);
    }
    getAppActive() {
        return this.get('appActive');
    }
    setAppActive(appActive) {
        this.set('appActive', appActive);
    }
    getAppUptime() {
        return this.get('appUptime');
    }
    setAppUptime(appUptime) {
        this.set('appUptime', appUptime);
    }
    getAppStartTime() {
        return this.get('appStartTime');
    }
    setAppStartTime(appStartTime) {
        this.set('appStartTime', appStartTime);
    }
    getRooted() {
        return this.get('rooted');
    }
    setRooted(rooted) {
        this.set('rooted', rooted);
    }
    getEventTimestamp() {
        return this.get('eventTimestamp');
    }
    setEventTimestamp(eventTimestamp) {
        this.set('eventTimestamp', eventTimestamp);
    }
    getApkHash() {
        return this.get('apkHash');
    }
    setApkHash(apkHash) {
        this.set('apkHash', apkHash);
    }
    getApkDeveloperSigningCertificateHash() {
        return this.get('apkDeveloperSigningCertificateHash');
    }
    setApkDeveloperSigningCertificateHash(apkDeveloperSigningCertificateHash) {
        this.set('apkDeveloperSigningCertificateHash', apkDeveloperSigningCertificateHash);
    }
    getAppVersionName() {
        return this.get('appVersionName');
    }
    setAppVersionName(appVersionName) {
        this.set('appVersionName', appVersionName);
    }
    getAppVersionCode() {
        return this.get('appVersionCode');
    }
    setAppVersionCode(appVersionCode) {
        this.set('appVersionCode', appVersionCode);
    }
    getAppIdName() {
        return this.get('appIdName');
    }
    setAppIdName(appIdName) {
        this.set('appIdName', appIdName);
    }
    getAppInstaller() {
        return this.get('appInstaller');
    }
    setAppInstaller(appInstaller) {
        this.set('appInstaller', appInstaller);
    }
    getDeviceUptime() {
        return this.get('deviceUptime');
    }
    setDeviceUptime(deviceUptime) {
        this.set('deviceUptime', deviceUptime);
    }
    getDeviceElapsedRealtime() {
        return this.get('deviceElapsedRealtime');
    }
    setDeviceElapsedRealtime(deviceElapsedRealtime) {
        this.set('deviceElapsedRealtime', deviceElapsedRealtime);
    }
    getAdbEnabled() {
        return this.get('adbEnabled');
    }
    setAdbEnabled(adbEnabled) {
        this.set('adbEnabled', adbEnabled);
    }
    getTimeOnScreen() {
        return this.get('timeOnScreen');
    }
    setTimeOnScreen(timeOnScreen) {
        this.set('timeOnScreen', timeOnScreen);
    }
    getMinimumAlpha() {
        return this.get('minimumAlpha');
    }
    setMinimumAlpha(minimumAlpha) {
        this.set('minimumAlpha', minimumAlpha);
    }
    getAdViewWidth() {
        return this.get('adViewWidth');
    }
    setAdViewWidth(adViewWidth) {
        this.set('adViewWidth', adViewWidth);
    }
    getAdViewHeight() {
        return this.get('adViewHeight');
    }
    setAdViewHeight(adViewHeight) {
        this.set('adViewHeight', adViewHeight);
    }
    getAndroidTouchObscured() {
        return this.get('androidTouchObscured');
    }
    setAndroidTouchObscured(androidTouchObscured) {
        this.set('androidTouchObscured', androidTouchObscured);
    }
    getTouchToolType() {
        return this.get('touchToolType');
    }
    setTouchToolType(touchToolType) {
        this.set('touchToolType', touchToolType);
    }
    getTouchSource() {
        return this.get('touchSource');
    }
    setTouchSource(touchSource) {
        this.set('touchSource', touchSource);
    }
    getTouchDeviceId() {
        return this.get('touchDeviceId');
    }
    setTouchDeviceId(touchDeviceId) {
        this.set('touchDeviceId', touchDeviceId);
    }
    getTouchDistance() {
        return this.get('touchDistance');
    }
    setTouchDistance(touchDistance) {
        this.set('touchDistance', touchDistance);
    }
    getAdViewX() {
        return this.get('adViewX');
    }
    setAdViewX(adViewX) {
        this.set('adViewX', adViewX);
    }
    getAdViewY() {
        return this.get('adViewY');
    }
    setAdViewY(adViewY) {
        this.set('adViewY', adViewY);
    }
    getScreenWidth() {
        return this.get('screenWidth');
    }
    setScreenWidth(screenWidth) {
        this.set('screenWidth', screenWidth);
    }
    getScreenHeight() {
        return this.get('screenHeight');
    }
    setScreenHeight(screenHeight) {
        this.set('screenHeight', screenHeight);
    }
    getBase64ProtoBuf() {
        const signalObject = {
            field_1: this.getSdkVersion(),
            field_2: this.getBatteryLevel(),
            field_3: this.getBatteryState(),
            field_4: this.getAccelerometerX(),
            field_5: this.getAccelerometerY(),
            field_6: this.getAccelerometerZ(),
            field_7: this.getTouchXUp(),
            field_8: this.getTouchYUp(),
            field_9: this.getTouchXDown(),
            field_10: this.getTouchYDown(),
            field_11: this.getTouchDuration(),
            field_12: this.getTouchPressure(),
            field_13: this.getTouchDiameter(),
            field_14: this.getAndroidTouchObscured(),
            field_15: this.getTouchToolType(),
            field_16: this.getTouchSource(),
            field_17: this.getTouchDeviceId(),
            field_18: this.getTouchDistance(),
            field_19: this.getTouchUpTotal(),
            field_20: this.getTouchDownTotal(),
            field_21: this.getTouchMoveTotal(),
            field_22: this.getTouchCancelTotal(),
            field_23: this.getOsVersion(),
            field_24: this.getCpuCount(),
            field_25: this.getDeviceUptime(),
            field_26: this.getDeviceElapsedRealtime(),
            field_27: this.getTimeZoneOffset(),
            field_28: this.getUsbConnected(),
            field_29: this.getAdbEnabled(),
            field_30: this.getRooted(),
            field_31: this.getNetworkType(),
            field_32: this.getAppActive(),
            field_33: this.getAppUptime(),
            field_34: this.getAppStartTime(),
            field_35: this.getEventTimestamp(),
            field_36: this.getTimeOnScreen(),
            field_37: this.getApkHash(),
            field_38: this.getApkDeveloperSigningCertificateHash(),
            field_39: this.getAppVersionName(),
            field_40: this.getAppVersionCode(),
            field_41: this.getAppIdName(),
            field_42: this.getAppInstaller(),
            field_43: this.getAdViewWidth(),
            field_44: this.getAdViewHeight(),
            field_45: this.getAdViewX(),
            field_46: this.getAdViewY(),
            field_47: this.getMinimumAlpha(),
            field_48: this.getScreenWidth(),
            field_49: this.getScreenHeight(),
            field_50: this.getDeviceOrientation()
        };
        const signalBuffer = unity_proto.UnityInfo.encode(signalObject).finish();
        const protocolObject = {
            encryptedBlobs: [signalBuffer],
            encryptionMethod: unity_proto.UnityProto.EncryptionMethod.UNENCRYPTED,
            protoName: unity_proto.UnityProto.ProtoName.UNITY_INFO
        };
        const protocolBuffer = unity_proto.UnityProto.encode(protocolObject).finish();
        return protobuf.util.base64.encode(protocolBuffer, 0, protocolBuffer.byteLength);
    }
    getBase64ProtoBufNonEncoded() {
        let str = this.getBase64ProtoBuf();
        str = str.replace(/\//g, '_');
        str = str.replace(/\+/g, '-');
        str = str.replace(/[=]+$/, '');
        return str;
    }
    getDTO() {
        return {
            'sdkVersion': this.getSdkVersion(),
            'batteryLevel': this.getBatteryLevel(),
            'batteryState': this.getBatteryState(),
            'accelerometerX': this.getAccelerometerX(),
            'accelerometerY': this.getAccelerometerY(),
            'accelerometerZ': this.getAccelerometerZ(),
            'networkType': this.getNetworkType(),
            'deviceOrientation': this.getDeviceOrientation(),
            'touchXUp': this.getTouchXUp(),
            'touchXDown': this.getTouchXDown(),
            'touchYUp': this.getTouchYUp(),
            'touchYDown': this.getTouchYDown(),
            'touchDuration': this.getTouchDuration(),
            'touchPressure': this.getTouchPressure(),
            'touchDiameter': this.getTouchDiameter(),
            'cpuCount': this.getCpuCount(),
            'touchUpTotal': this.getTouchUpTotal(),
            'touchDownTotal': this.getTouchDownTotal(),
            'touchMoveTotal': this.getTouchMoveTotal(),
            'touchCancelTotal': this.getTouchCancelTotal(),
            'osVersion': this.getOsVersion(),
            'timeZoneOffset': this.getTimeZoneOffset(),
            'usbConnected': this.getUsbConnected(),
            'appActive': this.getAppActive(),
            'appUptime': this.getAppUptime(),
            'appStartTime': this.getAppStartTime(),
            'rooted': this.getRooted(),
            'eventTimestamp': this.getEventTimestamp(),
            'apkHash': this.getApkHash(),
            'apkDeveloperSigningCertificateHash': this.getApkDeveloperSigningCertificateHash(),
            'appVersionName': this.getAppVersionName(),
            'appVersionCode': this.getAppVersionCode(),
            'appIdName': this.getAppIdName(),
            'appInstaller': this.getAppInstaller(),
            'deviceUptime': this.getDeviceUptime(),
            'deviceElapsedRealtime': this.getDeviceElapsedRealtime(),
            'adbEnabled': this.getAdbEnabled(),
            'timeOnScreen': this.getTimeOnScreen(),
            'minimumAlpha': this.getMinimumAlpha(),
            'adViewWidth': this.getAdViewWidth(),
            'adViewHeight': this.getAdViewHeight(),
            'androidTouchObscured': this.getAndroidTouchObscured(),
            'touchToolType': this.getTouchToolType(),
            'touchSource': this.getTouchSource(),
            'touchDeviceId': this.getTouchDeviceId(),
            'touchDistance': this.getTouchDistance(),
            'adViewX': this.getAdViewX(),
            'adViewY': this.getAdViewY(),
            'screenWidth': this.getScreenWidth(),
            'screenHeight': this.getScreenHeight()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JTaWduYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRNb2IvTW9kZWxzL0FkTW9iU2lnbmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEtBQUssUUFBUSxNQUFNLG9CQUFvQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQXVEN0MsTUFBTSxPQUFPLFdBQVksU0FBUSxLQUFtQjtJQUNoRDtRQUNJLEtBQUssQ0FBQyxhQUFhLEVBQUU7WUFDakIsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3RCLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN4QixZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDeEIsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzFCLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUMxQixjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDMUIsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3ZCLGlCQUFpQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzdCLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNwQixVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDdEIsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3BCLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN0QixhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDekIsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3pCLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN6QixRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDcEIsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3hCLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUMxQixjQUFjLEVB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