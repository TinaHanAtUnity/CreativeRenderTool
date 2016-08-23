import 'mocha';
import * as Sinon from 'Sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Platform } from 'Constants/Platform';
import { RingerMode } from 'Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from 'Constants/iOS/UIUserInterfaceIdiom';

describe('DeviceInfoTest', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.TEST;
            },
            DeviceInfo: {
                getConnectionType: Sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: Sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: Sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: Sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: Sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: Sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: Sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: Sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: Sinon.stub().returns(Promise.resolve('fi')),
                isRooted: Sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: Sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: Sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: Sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: Sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: Sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: Sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: Sinon.stub().returns(Promise.resolve(1024)),
            },

        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();

    });

    it('Get DeviceInfo DTO', (done) => {
        deviceInfo.getDTO().then(dto => {
            assert.equal(dto.connectionType, 'wifi');
            assert.equal(dto.networkType, 0);
            assert.equal(dto.trackingEnabled, true);
            assert.equal(dto.advertisingId, 12345);
            assert.equal(dto.osVersion, 'testVersion');
            assert.equal(dto.deviceModel, 'testModel');
            assert.equal(dto.screenHeight, '1200');
            assert.equal(dto.screenWidth, '800');
            assert.equal(dto.language, 'fi');
            assert.equal(dto.rooted, true);
            assert.equal(dto.timeZone, '+0100');
            assert.equal(dto.totalMemory, '1024');
            assert.equal(dto.headset, true);
            assert.equal(dto.screenBrightness, 0.7);
            assert.equal(dto.batteryLevel, 0.3);
            assert.equal(dto.batteryStatus, 1);
            assert.equal(dto.freeMemory, 1024);

            done();
        });
    });
});

describe('DeviceInfoTest Android', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.ANDROID;
            },
            DeviceInfo: {
                getConnectionType: Sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: Sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: Sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: Sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: Sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: Sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: Sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: Sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: Sinon.stub().returns(Promise.resolve('fi')),
                isRooted: Sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: Sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: Sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: Sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: Sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: Sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: Sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: Sinon.stub().returns(Promise.resolve(1024)),
                getNetworkOperatorName: Sinon.stub().returns(Promise.resolve('operatorName')),
                getNetworkOperator: Sinon.stub().returns(Promise.resolve('operator')),

                Android: {
                    getAndroidId: Sinon.stub().returns(Promise.resolve('17')),
                    getApiLevel: Sinon.stub().returns(Promise.resolve(16)),
                    getManufacturer: Sinon.stub().returns(Promise.resolve('N')),
                    getScreenDensity: Sinon.stub().returns(Promise.resolve(2)),
                    getScreenLayout: Sinon.stub().returns(Promise.resolve(1)),
                    getTotalSpace: Sinon.stub().returns(Promise.resolve(2048)),
                    getRingerMode: Sinon.stub().returns(Promise.resolve(RingerMode.RINGER_MODE_NORMAL)),
                    getDeviceVolume: Sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: Sinon.stub().returns(Promise.resolve(16)),
                }
            },

        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();

    });

    it('Get DeviceInfo DTO Android', (done) => {
        deviceInfo.getDTO().then(dto => {
            assert.equal(dto.androidId, 17);
            assert.equal(dto.apiLevel, 16);
            assert.equal(dto.deviceMake, 'N');
            assert.equal(dto.screenDensity, 2);
            assert.equal(dto.screenLayout, 1);
            assert.equal(dto.freeSpaceInternal, 16);
            assert.equal(dto.networkOperatorName, 'operatorName');
            assert.equal(dto.networkOperator, 'operator');
            assert.equal(dto.ringerMode, 2);
            assert.equal(dto.deviceVolume, 0.5);
            assert.equal(dto.totalSpaceExternal, 2048);
            assert.equal(dto.totalSpaceInternal, 2048);

            done();
        });
    });
});

describe('DeviceInfoTest iOS', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;


    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.IOS;
            },
            DeviceInfo: {
                getConnectionType: Sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: Sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: Sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: Sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: Sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: Sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: Sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: Sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: Sinon.stub().returns(Promise.resolve('fi')),
                isRooted: Sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: Sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: Sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: Sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: Sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: Sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: Sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: Sinon.stub().returns(Promise.resolve(1024)),
                getNetworkOperatorName: Sinon.stub().returns(Promise.resolve('operatorName')),
                getNetworkOperator: Sinon.stub().returns(Promise.resolve('operator')),

                Ios: {
                    getUserInterfaceIdiom: Sinon.stub().returns(Promise.resolve(UIUserInterfaceIdiom.UIUserInterfaceIdiomPad)),
                    getScreenScale: Sinon.stub().returns(Promise.resolve(2)),
                    isAppleWatchPaired: Sinon.stub().returns(Promise.resolve(true)),
                    isSimulator: Sinon.stub().returns(Promise.resolve(true)),
                    getTotalSpace: Sinon.stub().returns(Promise.resolve(1024)),
                    getDeviceVolume: Sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: Sinon.stub().returns(Promise.resolve(16)),
                }
            },
        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();
    });

    it('Get DeviceInfo DTO iOS', (done) => {
        deviceInfo.getDTO().then(dto => {
            assert.equal(dto.userInterfaceIdiom, 1);
            assert.equal(dto.screenScale, 2);
            assert.equal(dto.appleWatchPaired, true);
            assert.equal(dto.simulator, true);
            assert.equal(dto.freeSpaceInternal, 16);
            assert.equal(dto.networkOperatorName, 'operatorName');
            assert.equal(dto.networkOperator, 'operator');
            assert.equal(dto.deviceVolume, 0.5);
            assert.equal(dto.totalSpaceInternal, 1024);

            done();
        });
    });
});

describe('DeviceInfoTest catch random reject', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.TEST;
            },
            Sdk: {
                logWarning: (msg: string) => { return; },
            },
            DeviceInfo: {
                getConnectionType: Sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: Sinon.stub().returns(Promise.resolve(0)),
                // reject promise
                getAdvertisingTrackingId: Sinon.stub().returns(Promise.reject(new Error('advertisingIdError'))),
                getLimitAdTrackingFlag: Sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: Sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: Sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: Sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: Sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: Sinon.stub().returns(Promise.resolve('fi')),
                // reject promise
                isRooted: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTimeZone: Sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: Sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: Sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: Sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: Sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: Sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: Sinon.stub().returns(Promise.resolve(1024)),
            },

        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();

    });

    it('Get DeviceInfo DTO', (done) => {
        deviceInfo.getDTO().then(dto => {
            assert.equal(dto.connectionType, 'wifi');
            assert.equal(dto.networkType, 0);
            assert.equal(dto.trackingEnabled, true);
            assert.isUndefined(dto.advertisingId,  'Stub throws error, should be null');
            assert.equal(dto.osVersion, 'testVersion');
            assert.equal(dto.deviceModel, 'testModel');
            assert.equal(dto.screenHeight, '1200');
            assert.equal(dto.screenWidth, '800');
            assert.equal(dto.language, 'fi');
            assert.isUndefined(dto.rooted, 'Stub throws error, should be null');
            assert.equal(dto.timeZone, '+0100');
            assert.equal(dto.totalMemory, '1024');
            assert.equal(dto.headset, true);
            assert.equal(dto.screenBrightness, 0.7);
            assert.equal(dto.batteryLevel, 0.3);
            assert.equal(dto.batteryStatus, 1);
            assert.equal(dto.freeMemory, 1024);

            done();
        });
    });
});

describe('DeviceInfoTest reject promises', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.TEST;
            },
            Sdk: {
                logWarning: (msg: string) => { return; },
            },
            DeviceInfo: {
                getConnectionType: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getNetworkType: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getAdvertisingTrackingId: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getLimitAdTrackingFlag: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getOsVersion: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getModel: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenHeight: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenWidth: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getSystemLanguage: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                isRooted: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTimeZone: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTotalMemory: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getHeadset: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenBrightness: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getBatteryLevel: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getBatteryStatus: Sinon.stub().returns(Promise.reject(new Error('testError'))),
                getFreeMemory: Sinon.stub().returns(Promise.reject(new Error('testError'))),
            },

        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();

    });
});
