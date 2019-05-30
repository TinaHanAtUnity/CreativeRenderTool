import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AndroidPermission, AndroidPermissionsResult } from 'Core/Native/Android/Permissions';
import { DeviceIdStorageKeys, DeviceIdManager } from 'Core/Managers/DeviceIdManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageType } from 'Core/Native/Storage';
import { PermissionsUtil, CurrentPermission, PermissionTypes } from 'Core/Utilities/Permissions';
import { ICoreApi} from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';

describe('DeviceIdManagerTest', () => {
    const sandbox = sinon.createSandbox();
    let nativeBridge: NativeBridge;
    let deviceInfo: AndroidDeviceInfo;
    let core: ICoreApi;
    let deviceIdManager: DeviceIdManager;

    beforeEach(() => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        deviceInfo = new AndroidDeviceInfo(core);
        deviceIdManager = new DeviceIdManager(core, deviceInfo);

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

    describe('when checking compliant', () => {
        it ('should return true if all conditions are satisfied', () => {
            const country = 'CN';
            const optOutRecorded = true;
            const optOutEnabled = false;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns(undefined);
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);

            assert.isTrue(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
        });

        it ('should return false if country is not China', () => {
            const country = 'FI';
            const optOutRecorded = true;
            const optOutEnabled = false;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns(undefined);
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);

            assert.isFalse(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
        });

        it ('should return false if opt out of unity ads', () => {
            const country = 'CN';
            const optOutRecorded = true;
            const optOutEnabled = true;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns(undefined);
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);

            assert.isFalse(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
        });

        it ('should return false if advertising ID is present', () => {
            const country = 'CN';
            const optOutRecorded = true;
            const optOutEnabled = false;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns('advertisingIdentifier');
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);

            assert.isFalse(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
        });

        it ('should return false if limit ad tracking is on', () => {
            const country = 'CN';
            const optOutRecorded = true;
            const optOutEnabled = false;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns(undefined);
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(true);

            assert.isFalse(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
        });

        it ('should return false if all conditions are not met', () => {
            const country = 'FI';
            const optOutRecorded = true;
            const optOutEnabled = true;
            sandbox.stub(deviceInfo, 'getAdvertisingIdentifier').returns('advertisingIdentifier');
            sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);

            assert.isFalse(deviceIdManager.isCompliant(country, optOutRecorded, optOutEnabled));
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
                    sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledTwice(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot);
                    });
                });

                it('should call get device with slot with slots 0 and 1', () => {
                    sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledWithExactly(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot, 0);
                        sinon.assert.calledWithExactly(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot, 1);
                    });
                });

                it('should update imei and meids in device info', () => {
                    const deviceId1 = '11111';
                    const deviceId2 = '11112';
                    sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot')
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
                    sandbox.stub(core.DeviceInfo.Android!, 'getDeviceId').resolves();

                    return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceId);
                    });
                });

                it('should update imei and meids in device info', () => {
                    const deviceId = '11111';
                    sandbox.stub(core.DeviceInfo.Android!, 'getDeviceId').resolves(deviceId);

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
                        sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot').resolves();

                        return deviceIdManager.getDeviceIdsWithPermissionRequest().then(() => {
                            sinon.assert.calledWithExactly(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot, 0);
                            sinon.assert.calledWithExactly(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot, 1);
                        });
                    });

                    it('should update imeis in device info', () => {
                        const deviceId1 = '11111';
                        const deviceId2 = '11112';
                        sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot')
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
                        sandbox.stub(core.DeviceInfo.Android!, 'getDeviceIdWithSlot').resolves();
                        return deviceIdManager.getDeviceIdsWithPermissionRequest().catch(() => {
                            sinon.assert.notCalled(<sinon.SinonSpy>core.DeviceInfo.Android!.getDeviceIdWithSlot);
                        });
                    });
                });
            });
        });
    });
});
