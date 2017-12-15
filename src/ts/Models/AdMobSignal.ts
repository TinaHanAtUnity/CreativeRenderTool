import { Model } from 'Models/Model';
import { unity_proto } from '../../proto/unity_proto.js';
import * as protobuf from 'protobufjs/minimal';

interface IAdMobSignal {
    sdkVersion: string;
    batteryLevel: number;
    batteryState: number;
    accelerometerX: number;
    accelerometerY: number;
    accelerometerZ: number;
    networkType: number;
    deviceOrientation: number;
    touchXUp: number;
    touchXDown: number;
    touchYUp: number;
    touchYDown: number;
    touchDuration: number;
    touchPressure: number;
    touchDiameter: number;
    cpuCount: number;
    touchUpTotal: number;
    touchDownTotal: number;
    touchMoveTotal: number;
    touchCancelTotal: number;
    osVersion: string;
    timeZoneOffset: number;
    usbConnected: number;
    appActive: boolean;
    appUptime: number;
    appStartTime: number;
    rooted: number;
    eventTimestamp: number;
    apkHash: string;
    apkDeveloperSigningCertificateHash: string;
    appVersionName: string;
    appVersionCode: number;
    appIdName: string;
    appInstaller: string;
    deviceUptime: number;
    deviceElapsedRealtime: number;
    adbEnabled: number;
    timeOnScreen: number;
    minimumAlpha: number;
    adViewWidth: number;
    adViewHeight: number;
    androidTouchObscured: boolean;
    touchToolType: number;
    touchSource: number;
    touchDeviceId: number;
    touchDistance: number;
    adViewX: number;
    adViewY: number;
    screenWidth: number;
    screenHeight: number;
}

export class AdMobSignal extends Model<IAdMobSignal> {
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

    public getSdkVersion(): string {
        return this.get('sdkVersion');
    }

    public setSdkVersion(sdkVersion: string): void {
        this.set('sdkVersion', sdkVersion);
    }

    public getBatteryLevel(): number {
        return this.get('batteryLevel');
    }

    public setBatteryLevel(batteryLevel: number): void {
        this.set('batteryLevel', batteryLevel);
    }

    public getBatteryState(): number {
        return this.get('batteryState');
    }

    public setBatteryState(batteryState: number): void {
        this.set('batteryState', batteryState);
    }

    public getAccelerometerX(): number {
        return this.get('accelerometerX');
    }

    public setAccelerometerX(accelerometerX: number): void {
        this.set('accelerometerX', accelerometerX);
    }

    public getAccelerometerY(): number {
        return this.get('accelerometerY');
    }

    public setAccelerometerY(accelerometerY: number): void {
        this.set('accelerometerY', accelerometerY);
    }

    public getAccelerometerZ(): number {
        return this.get('accelerometerZ');
    }

    public setAccelerometerZ(accelerometerZ: number): void {
        this.set('accelerometerZ', accelerometerZ);
    }

    public getNetworkType(): number {
        return this.get('networkType');
    }

    public setNetworkType(networkType: number): void {
        this.set('networkType', networkType);
    }

    public getDeviceOrientation(): number {
        return this.get('deviceOrientation');
    }

    public setDeviceOrientation(deviceOrientation: number): void {
        this.set('deviceOrientation', deviceOrientation);
    }

    public getTouchXUp(): number {
        return this.get('touchXUp');
    }

    public setTouchXUp(touchXUp: number): void {
        this.set('touchXUp', touchXUp);
    }

    public getTouchXDown(): number {
        return this.get('touchXDown');
    }

    public setTouchXDown(touchXDown: number): void {
        this.set('touchXDown', touchXDown);
    }

    public getTouchYUp(): number {
        return this.get('touchYUp');
    }

    public setTouchYUp(touchYUp: number): void {
        this.set('touchYUp', touchYUp);
    }

    public getTouchYDown(): number {
        return this.get('touchYDown');
    }

    public setTouchYDown(touchYDown: number): void {
        this.set('touchYDown', touchYDown);
    }

    public getTouchDuration(): number {
        return this.get('touchDuration');
    }

    public setTouchDuration(touchDuration: number): void {
        this.set('touchDuration', touchDuration);
    }

    public getTouchPressure(): number {
        return this.get('touchPressure');
    }

    public setTouchPressure(touchPressure: number): void {
        this.set('touchPressure', touchPressure);
    }

    public getTouchDiameter(): number {
        return this.get('touchDiameter');
    }

    public setTouchDiameter(touchDiameter: number): void {
        this.set('touchDiameter', touchDiameter);
    }

    public getCpuCount(): number {
        return this.get('cpuCount');
    }

    public setCpuCount(cpuCount: number): void {
        this.set('cpuCount', cpuCount);
    }

    public getTouchUpTotal(): number {
        return this.get('touchUpTotal');
    }

    public setTouchUpTotal(touchUpTotal: number): void {
        this.set('touchUpTotal', touchUpTotal);
    }

    public getTouchDownTotal(): number {
        return this.get('touchDownTotal');
    }

    public setTouchDownTotal(touchDownTotal: number): void {
        this.set('touchDownTotal', touchDownTotal);
    }

    public getTouchMoveTotal(): number {
        return this.get('touchMoveTotal');
    }

    public setTouchMoveTotal(touchMoveTotal: number): void {
        this.set('touchMoveTotal', touchMoveTotal);
    }

    public getTouchCancelTotal(): number {
        return this.get('touchCancelTotal');
    }

    public setTouchCancelTotal(touchCancelTotal: number): void {
        this.set('touchCancelTotal', touchCancelTotal);
    }

    public getOsVersion(): string {
        return this.get('osVersion');
    }

    public setOsVersion(osVersion: string): void {
        this.set('osVersion', osVersion);
    }

    public getTimeZoneOffset(): number {
        return this.get('timeZoneOffset');
    }

    public setTimeZoneOffset(timeZoneOffset: number): void {
        this.set('timeZoneOffset', timeZoneOffset);
    }

    public getUsbConnected(): number {
        return this.get('usbConnected');
    }

    public setUsbConnected(usbConnected: number): void {
        this.set('usbConnected', usbConnected);
    }

    public getAppActive(): boolean {
        return this.get('appActive');
    }

    public setAppActive(appActive: boolean): void {
        this.set('appActive', appActive);
    }

    public getAppUptime(): number {
        return this.get('appUptime');
    }

    public setAppUptime(appUptime: number): void {
        this.set('appUptime', appUptime);
    }

    public getAppStartTime(): number {
        return this.get('appStartTime');
    }

    public setAppStartTime(appStartTime: number): void {
        this.set('appStartTime', appStartTime);
    }

    public getRooted(): number {
        return this.get('rooted');
    }

    public setRooted(rooted: number): void {
        this.set('rooted', rooted);
    }

    public getEventTimestamp(): number {
        return this.get('eventTimestamp');
    }

    public setEventTimestamp(eventTimestamp: number): void {
        this.set('eventTimestamp', eventTimestamp);
    }

    public getApkHash(): string {
        return this.get('apkHash');
    }

    public setApkHash(apkHash: string): void {
        this.set('apkHash', apkHash);
    }

    public getApkDeveloperSigningCertificateHash(): string {
        return this.get('apkDeveloperSigningCertificateHash');
    }

    public setApkDeveloperSigningCertificateHash(apkDeveloperSigningCertificateHash: string): void {
        this.set('apkDeveloperSigningCertificateHash', apkDeveloperSigningCertificateHash);
    }

    public getAppVersionName(): string {
        return this.get('appVersionName');
    }

    public setAppVersionName(appVersionName: string): void {
        this.set('appVersionName', appVersionName);
    }

    public getAppVersionCode(): number {
        return this.get('appVersionCode');
    }

    public setAppVersionCode(appVersionCode: number): void {
        this.set('appVersionCode', appVersionCode);
    }

    public getAppIdName(): string {
        return this.get('appIdName');
    }

    public setAppIdName(appIdName: string): void {
        this.set('appIdName', appIdName);
    }

    public getAppInstaller(): string {
        return this.get('appInstaller');
    }

    public setAppInstaller(appInstaller: string): void {
        this.set('appInstaller', appInstaller);
    }

    public getDeviceUptime(): number {
        return this.get('deviceUptime');
    }

    public setDeviceUptime(deviceUptime: number): void {
        this.set('deviceUptime', deviceUptime);
    }

    public getDeviceElapsedRealtime(): number {
        return this.get('deviceElapsedRealtime');
    }

    public setDeviceElapsedRealtime(deviceElapsedRealtime: number): void {
        this.set('deviceElapsedRealtime', deviceElapsedRealtime);
    }

    public getAdbEnabled(): number {
        return this.get('adbEnabled');
    }

    public setAdbEnabled(adbEnabled: number): void {
        this.set('adbEnabled', adbEnabled);
    }

    public getTimeOnScreen(): number {
        return this.get('timeOnScreen');
    }

    public setTimeOnScreen(timeOnScreen: number): void {
        this.set('timeOnScreen', timeOnScreen);
    }

    public getMinimumAlpha(): number {
        return this.get('minimumAlpha');
    }

    public setMinimumAlpha(minimumAlpha: number): void {
        this.set('minimumAlpha', minimumAlpha);
    }

    public getAdViewWidth(): number {
        return this.get('adViewWidth');
    }

    public setAdViewWidth(adViewWidth: number): void {
        this.set('adViewWidth', adViewWidth);
    }

    public getAdViewHeight(): number {
        return this.get('adViewHeight');
    }

    public setAdViewHeight(adViewHeight: number): void {
        this.set('adViewHeight', adViewHeight);
    }

    public getAndroidTouchObscured(): boolean {
        return this.get('androidTouchObscured');
    }

    public setAndroidTouchObscured(androidTouchObscured: boolean): void {
        this.set('androidTouchObscured', androidTouchObscured);
    }

    public getTouchToolType(): number {
        return this.get('touchToolType');
    }

    public setTouchToolType(touchToolType: number): void {
        this.set('touchToolType', touchToolType);
    }

    public getTouchSource(): number {
        return this.get('touchSource');
    }

    public setTouchSource(touchSource: number): void {
        this.set('touchSource', touchSource);
    }

    public getTouchDeviceId(): number {
        return this.get('touchDeviceId');
    }

    public setTouchDeviceId(touchDeviceId: number): void {
        this.set('touchDeviceId', touchDeviceId);
    }

    public getTouchDistance(): number {
        return this.get('touchDistance');
    }

    public setTouchDistance(touchDistance: number): void {
        this.set('touchDistance', touchDistance);
    }

    public getAdViewX(): number {
        return this.get('adViewX');
    }

    public setAdViewX(adViewX: number): void {
        this.set('adViewX', adViewX);
    }

    public getAdViewY(): number {
        return this.get('adViewY');
    }

    public setAdViewY(adViewY: number): void {
        this.set('adViewY', adViewY);
    }

    public getScreenWidth(): number {
        return this.get('screenWidth');
    }

    public setScreenWidth(screenWidth: number): void {
        this.set('screenWidth', screenWidth);
    }

    public getScreenHeight(): number {
        return this.get('screenHeight');
    }

    public setScreenHeight(screenHeight: number): void {
        this.set('screenHeight', screenHeight);
    }

    public getBase64ProtoBuf(): string {
        const signalObject: unity_proto.IUnityInfo = {
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

        const protocolObject: unity_proto.IUnityProto = {
            encryptedBlobs: [signalBuffer],
            encryptionMethod: unity_proto.UnityProto.EncryptionMethod.UNENCRYPTED,
            protoName: unity_proto.UnityProto.ProtoName.UNITY_INFO
        };
        const protocolBuffer = unity_proto.UnityProto.encode(protocolObject).finish();

        return protobuf.util.base64.encode(protocolBuffer, 0, protocolBuffer.byteLength);
    }

    public getBase64ProtoBufNonEncoded(): string {
        let str = this.getBase64ProtoBuf();
        str = str.replace('/', '_');
        str = str.replace('+', '-');
        str = str.replace('=', '');
        return str;
    }

    public getDTO(): { [key: string]: any } {
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
