import 'mocha';
import * as sinon from 'sinon';

import { assert } from 'chai';
import { NativeBridge } from '../../src/ts/Native/NativeBridge';
import { DeviceInfo } from '../../src/ts/Models/DeviceInfo';
import { Platform } from '../../src/ts/Constants/Platform';
import { RingerMode } from '../../src/ts/Constants/Android/RingerMode';
import { UIUserInterfaceIdiom } from '../../src/ts/Constants/iOS/UIUserInterfaceIdiom';

describe('DeviceInfoTest', () => {

    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        nativeBridge = <NativeBridge><any>{
            getPlatform: () => {
                return Platform.TEST;
            },
            DeviceInfo: {
                getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
                isRooted: sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
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
                getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
                isRooted: sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
                getNetworkOperatorName: sinon.stub().returns(Promise.resolve('operatorName')),
                getNetworkOperator: sinon.stub().returns(Promise.resolve('operator')),

                Android: {
                    getAndroidId: sinon.stub().returns(Promise.resolve('17')),
                    getApiLevel: sinon.stub().returns(Promise.resolve(16)),
                    getManufacturer: sinon.stub().returns(Promise.resolve('N')),
                    getScreenDensity: sinon.stub().returns(Promise.resolve(2)),
                    getScreenLayout: sinon.stub().returns(Promise.resolve(1)),
                    getTotalSpace: sinon.stub().returns(Promise.resolve(2048)),
                    getRingerMode: sinon.stub().returns(Promise.resolve(RingerMode.RINGER_MODE_NORMAL)),
                    getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
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
                getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                getAdvertisingTrackingId: sinon.stub().returns(Promise.resolve('12345')),
                getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
                isRooted: sinon.stub().returns(Promise.resolve(true)),
                getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
                getNetworkOperatorName: sinon.stub().returns(Promise.resolve('operatorName')),
                getNetworkOperator: sinon.stub().returns(Promise.resolve('operator')),

                Ios: {
                    getUserInterfaceIdiom: sinon.stub().returns(Promise.resolve(UIUserInterfaceIdiom.UIUserInterfaceIdiomPad)),
                    getScreenScale: sinon.stub().returns(Promise.resolve(2)),
                    isSimulator: sinon.stub().returns(Promise.resolve(true)),
                    getTotalSpace: sinon.stub().returns(Promise.resolve(1024)),
                    getDeviceVolume: sinon.stub().returns(Promise.resolve(0.5)),
                    getFreeSpace: sinon.stub().returns(Promise.resolve(16)),
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
                logWarning: (msg) => { return; },
            },
            DeviceInfo: {
                getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                // reject promise
                getAdvertisingTrackingId: sinon.stub().returns(Promise.reject(new Error('advertisingIdError'))),
                getLimitAdTrackingFlag: sinon.stub().returns(Promise.resolve(true)),
                getOsVersion: sinon.stub().returns(Promise.resolve('testVersion')),
                getModel: sinon.stub().returns(Promise.resolve('testModel')),
                getScreenHeight: sinon.stub().returns(Promise.resolve(1200)),
                getScreenWidth: sinon.stub().returns(Promise.resolve(800)),
                getSystemLanguage: sinon.stub().returns(Promise.resolve('fi')),
                // reject promise
                isRooted: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTimeZone: sinon.stub().returns(Promise.resolve('+0100')),
                getTotalMemory: sinon.stub().returns(Promise.resolve('1024')),
                getHeadset: sinon.stub().returns(Promise.resolve(true)),
                getScreenBrightness: sinon.stub().returns(Promise.resolve(0.7)),
                getBatteryLevel: sinon.stub().returns(Promise.resolve(0.3)),
                getBatteryStatus: sinon.stub().returns(Promise.resolve(1)),
                getFreeMemory: sinon.stub().returns(Promise.resolve(1024)),
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
                logWarning: (msg) => { return; },
            },
            DeviceInfo: {
                getConnectionType: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getNetworkType: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getAdvertisingTrackingId: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getLimitAdTrackingFlag: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getOsVersion: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getModel: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenHeight: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenWidth: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getSystemLanguage: sinon.stub().returns(Promise.reject(new Error('testError'))),
                isRooted: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTimeZone: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getTotalMemory: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getHeadset: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getScreenBrightness: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getBatteryLevel: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getBatteryStatus: sinon.stub().returns(Promise.reject(new Error('testError'))),
                getFreeMemory: sinon.stub().returns(Promise.reject(new Error('testError'))),
            },

        };
        deviceInfo = new DeviceInfo(nativeBridge);
        return deviceInfo.fetch();

    });
});
