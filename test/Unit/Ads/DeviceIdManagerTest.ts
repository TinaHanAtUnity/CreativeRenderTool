import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AndroidPermission, AndroidPermissionsResult } from 'Core/Native/Android/Permissions';
import { DeviceIdStorageKeys, DeviceIdManager } from 'China/Managers/DeviceIdManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageType } from 'Core/Native/Storage';
import { PermissionsUtil, CurrentPermission, PermissionTypes } from 'Core/Utilities/Permissions';
import { ICoreApi} from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';
import { IChinaApi } from 'China/IChina';

describe('DeviceIdManagerTest', () => {
    const sandbox = sinon.sandbox.create();
    let nativeBridge: NativeBridge;
    let deviceInfo: AndroidDeviceInfo;
    let core: ICoreApi;
    let china: IChinaApi;
    let deviceIdManager: DeviceIdManager;

    beforeEach(() => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        china = TestFixtures.getChinaApi(nativeBridge);
        deviceInfo = new AndroidDeviceInfo(core);
        deviceIdManager = new DeviceIdManager(core, china, deviceInfo);

        sandbox.stub(Diagnostics, 'trigger');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('when loading device id from cache', () => {
        it('should read deviceId1 from cache with native storage API', () => {
            sandbox.stub(core.Storage, 'get').resolves();
            return deviceIdManager.loadStoredDeviceIds().catch(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.get, StorageType.PRIVATE, DeviceIdStorageKeys.DEVICE_ID1);
            });
        });

        it('should read deviceId2 from cache with native storage API', () => {
            sandbox.stub(core.Storage, 'get').resolves();
            return deviceIdManager.loadStoredDeviceIds().catch(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Storage.get, StorageType.PRIVATE, DeviceIdStorageKeys.DEVICE_ID2);
            });
        });

        describe('and device ids exist in cache', () => {
            const fakeDeviceId1 = '11111';
            const fakeDeviceId2 = '11112';

            beforeEach(() => {
                sandbox.stub(core.Storage, 'get')
                    .withArgs(StorageType.PRIVATE, DeviceIdStorageKeys.DEVICE_ID1).resolves(fakeDeviceId1)
                    .withArgs(StorageType.PRIVATE, DeviceIdStorageKeys.DEVICE_ID2).resolves(fakeDeviceId2);
                sandbox.stub(deviceInfo, 'setDeviceIds').resolves();
            });

            it('should resolve and set device ids in device info', () => {
                return deviceIdManager.loadStoredDeviceIds().then(() => {
                    sinon.assert.calledWith(<sinon.SinonSpy>deviceInfo.setDeviceIds, fakeDeviceId1, fakeDeviceId2);
                });
            });
        });

        describe('and device ids do not exist in cache', () => {
            beforeEach(() => {
                sandbox.stub(core.Storage, 'get').resolves(undefined);
                sandbox.stub(deviceInfo, 'setDeviceIds').resolves();
            });

            it('should not resolve', () => {
                return deviceIdManager.loadStoredDeviceIds().then(() => {
                    throw new Error('should not resolve');
                }).catch(() => {
                    // do nothing
                });
            });

            it('should not update device info', () => {
                return deviceIdManager.loadStoredDeviceIds().catch(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>deviceInfo.setDeviceIds);
                });
            });
        });
    });

    describe('when reading device id', () => {
        beforeEach(() => {
            sandbox.stub(core.Storage, 'get').resolves();
        });

        it('should check for read phone state permissions', () => {
            sandbox.stub(core.Permissions.Android!, 'checkPermission').resolves();

            return deviceIdManager.getDeviceIdsWithPermissionRequest().catch(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Permissions.Android!.checkPermission, AndroidPermission.READ_PHONE_STATE);
            });
        });

        describe('and read phone state permission is already granted', () => {
            beforeEach(() => {
                sandbox.stub(core.Permissions.Android!, 'checkPermission').resolves(AndroidPermissionsResult.PERMISSION_GRANTED);
                sandbox.stub(PermissionsUtil, 'checkPermissions').resolves(CurrentPermission.ACCEPTED);
            });

            describe(' and API level larger than or equal to 23', () => {
                beforeEach(() => {
                    sandbox.stub(deviceInfo, 'getApiLevel').returns(BuildVerionCode.N);
                });

                it('should call get device with slot twice', () => {
                    sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledTwice(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot);
                    });
                });

                it('should call get device with slot with slots 0 and 1', () => {
                    sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledWithExactly(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot, 0);
                        sinon.assert.calledWithExactly(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot, 1);
                    });
                });

                it('should update imei and meids in device info', () => {
                    const deviceId1 = '11111';
                    const deviceId2 = '11112';
                    sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot')
                        .withArgs(0).returns(deviceId1)
                        .withArgs(1).returns(deviceId2);

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        assert.equal(deviceInfo.getDeviceId1(), deviceId1);
                        assert.equal(deviceInfo.getDeviceId2(), deviceId2);
                    });
                });
            });

            describe(' and API level less than 23', () => {
                beforeEach(() => {
                    sandbox.stub(deviceInfo, 'getApiLevel').returns(BuildVerionCode.LOLLIPOP);
                });
                afterEach(() => {
                    sandbox.restore();
                });

                it('should call get device id once', () => {
                    sandbox.stub(china.Android.DeviceInfo, 'getDeviceId').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceId);
                    });
                });

                it('should update imei and meids in device info', () => {
                    const deviceId = '11111';
                    sandbox.stub(china.Android.DeviceInfo, 'getDeviceId').resolves(deviceId);

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        assert.equal(deviceInfo.getDeviceId1(), deviceId);
                        assert.equal(deviceInfo.getDeviceId2(), deviceId);
                    });
                });
            });
        });

        describe('and read phone state permission is not granted', () => {
            beforeEach(() => {
                sandbox.stub(core.Permissions.Android!, 'checkPermission').resolves(-1);
                sandbox.stub(core.Permissions.Android!, 'requestPermissions');
            });

            describe('and Android API is greater than or equal to 23', () => {
                const permissionsArray = [AndroidPermission.READ_PHONE_STATE];

                beforeEach(() => {
                    sandbox.stub(deviceInfo, 'getApiLevel').returns(BuildVerionCode.N);
                });

                it('should request read phone state permission', () => {
                    sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                        .callsFake((callback: any) => {
                            callback();
                        });

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().catch(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Permissions.Android!.requestPermissions, permissionsArray, sinon.match.number);
                    });
                });

                describe('and read phone state permission is granted upon request', () => {
                    beforeEach(() => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                callback(PermissionTypes.READ_PHONE_STATE, true);
                            });
                    });

                    it('should call get device with slot with slots 0 and 1', () => {
                        sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot').resolves();

                        return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                            sinon.assert.calledWithExactly(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot, 0);
                            sinon.assert.calledWithExactly(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot, 1);
                        });
                    });

                    it('should update imeis in device info', () => {
                        const deviceId1 = '11111';
                        const deviceId2 = '11112';
                        sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot')
                            .withArgs(0).returns(deviceId1)
                            .withArgs(1).returns(deviceId2);

                        return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                            assert.equal(deviceInfo.getDeviceId1(), deviceId1);
                            assert.equal(deviceInfo.getDeviceId2(), deviceId2);
                        });
                    });
                });

                describe('and read phone state permission is denied upon request', () => {
                    beforeEach(() => {
                        sandbox.stub(core.Permissions.onPermissionsResult, 'subscribe')
                            .callsFake((callback: any) => {
                                callback(PermissionTypes.READ_PHONE_STATE, false);
                            });
                    });

                    it ('should not call get device id with slot', () => {
                        sandbox.stub(china.Android.DeviceInfo, 'getDeviceIdWithSlot').resolves();
                        return deviceIdManager.getDeviceIdsWithPermissionRequest().catch(() => {
                            sinon.assert.notCalled(<sinon.SinonSpy>china.Android.DeviceInfo.getDeviceIdWithSlot);
                        });
                    });
                });
            });
        });
    });
});
