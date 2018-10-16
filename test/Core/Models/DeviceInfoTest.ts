import { assert } from 'chai';
import { StreamType } from 'Core/Constants/Android/StreamType';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { DeviceInfoEvent } from 'Core/Native/DeviceInfoEvent';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from '../../TestHelpers/TestFixtures';
import { ICoreApi } from '../../../src/ts/Core/ICore';
import { Backend } from '../../../src/ts/Backend/Backend';

describe('DeviceInfoTest', () => {

    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let deviceInfo: AndroidDeviceInfo;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            Android: {
                ... TestFixtures.getFakeNativeAndroidDeviceInfo()
           }
        };
        deviceInfo = new AndroidDeviceInfo(core);
        return deviceInfo.fetch();

    });

    it('should represent float values for screenWidth or screenHeight as integers from flooring actual values', (done) => {
        core.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            getScreenHeight: sinon.stub().returns(Promise.resolve(1200.123)),
            getScreenWidth: sinon.stub().returns(Promise.resolve(800.123)),

            Android: {
                ... TestFixtures.getFakeNativeAndroidDeviceInfo()
            }
        };

        deviceInfo = new AndroidDeviceInfo(core);

        Promise.all<any>([
            deviceInfo.getScreenHeight(),
            deviceInfo.getScreenWidth()
        ]).then(([
            adjustedHeight,
            adjustedWidth
        ]) => {
            assert.equal(adjustedHeight, 1200);
            assert.equal(adjustedWidth, 800);
            done();
        });
    });

    it('Get DeviceInfo DTO', () => {
        return deviceInfo.getDTO().then(dto => {
            assert.equal(dto.connectionType, 'wifi');
            assert.equal(dto.networkType, 0);
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
        });
    });
});

describe('DeviceInfoTest Android', () => {

    let deviceInfo: AndroidDeviceInfo;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    it('Get DeviceInfo DTO Android with GAID', () => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        backend.Api.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            ... TestFixtures.getFakeNativeAndroidDeviceInfo()
        };
        deviceInfo = new AndroidDeviceInfo(core);

        return deviceInfo.fetch().then(() => deviceInfo.getDTO()).then((dto: any) => {
            assert.equal(dto.androidId, undefined);
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
        });
    });

    it('Get DeviceInfo DTO Android without GAID', () => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        backend.Api.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            ... TestFixtures.getFakeNativeAndroidDeviceInfo()
        };
        backend.Api.DeviceInfo.getAdvertisingTrackingId = sinon.stub().returns(Promise.resolve(undefined));
        deviceInfo = new AndroidDeviceInfo(core);

        return deviceInfo.fetch().then(() => deviceInfo.getDTO()).then((dto: any) => {
            assert.equal(dto.androidId, '17');
        });
    });

    it ('Volume change', (done) => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        backend.Api.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            Android: {
                ... TestFixtures.getFakeNativeAndroidDeviceInfo()
            }
        };
        deviceInfo = new AndroidDeviceInfo(core);

        let receivedStreamType = -1;
        let triggered = false;
        let receivedVolume = 0;
        let receivedMaxVolume = 0;

        core.DeviceInfo.Android!.onVolumeChanged.subscribe((streamType, volume, maxVolume) => {
            triggered = true;
            receivedStreamType = streamType;
            receivedVolume = volume;
            receivedMaxVolume = maxVolume;

            assert.equal(triggered, true);
            assert.equal(receivedStreamType, StreamType.STREAM_MUSIC);
            assert.equal(receivedVolume, 0.5);
            assert.equal(receivedMaxVolume, 1);

            done();
        });

        nativeBridge.handleEvent([EventCategory[EventCategory.DEVICEINFO], DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED], StreamType.STREAM_MUSIC, 0.5, 1]);
    });
});

describe('DeviceInfoTest iOS', () => {

    let deviceInfo: IosDeviceInfo;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.IOS);
        nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        backend.Api.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            ... TestFixtures.getFakeNativeIosDeviceInfo()
        };
        deviceInfo = new IosDeviceInfo(core);
        return deviceInfo.fetch();
    });

    it('Get DeviceInfo DTO iOS', () => {
        return deviceInfo.getDTO().then(dto => {
            assert.equal(dto.userInterfaceIdiom, 1);
            assert.equal(dto.screenScale, 2);
            assert.equal(dto.simulator, true);
            assert.equal(dto.freeSpaceInternal, 16);
            assert.equal(dto.networkOperatorName, 'operatorName');
            assert.equal(dto.networkOperator, 'operator');
            assert.equal(dto.deviceVolume, 0.5);
            assert.equal(dto.totalSpaceInternal, 1024);
        });
    });

    it ('Volume change', (done) => {
        let triggered = false;
        let receivedVolume = 0;
        let receivedMaxVolume = 0;

        core.DeviceInfo.Ios!.onVolumeChanged.subscribe((volume, maxVolume) => {
            triggered = true;
            receivedVolume = volume;
            receivedMaxVolume = maxVolume;

            assert.equal(triggered, true);
            assert.equal(receivedVolume, 0.5);
            assert.equal(receivedMaxVolume, 1);

            done();
        });

        nativeBridge.handleEvent([EventCategory[EventCategory.DEVICEINFO], DeviceInfoEvent[DeviceInfoEvent.VOLUME_CHANGED], 0.5, 1]);
    });
});

describe('DeviceInfoTest catch random reject', () => {

    let deviceInfo: AndroidDeviceInfo;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.DeviceInfo = {
            ... TestFixtures.getFakeNativeDeviceInfo(),
            getAdvertisingTrackingId: sinon.stub().returns(Promise.reject(new Error('advertisingIdError'))),
            isRooted: sinon.stub().returns(Promise.reject(new Error('testError'))),
            Android: {
                ... TestFixtures.getFakeNativeAndroidDeviceInfo()
            }
        };

        deviceInfo = new AndroidDeviceInfo(core);
        return deviceInfo.fetch();

    });

    it('Get DeviceInfo DTO', () => {
        return deviceInfo.getDTO().then(dto => {
            assert.equal(dto.connectionType, 'wifi');
            assert.equal(dto.networkType, 0);
            assert.equal(dto.trackingEnabled, undefined);
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
        });
    });
});
