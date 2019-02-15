import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { StorageType } from 'Core/Native/Storage';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { BuildVerionCode } from 'Core/Constants/Android/BuildVerionCode';
import { IChinaApi } from 'China/IChina';

export enum DeviceIdMessage {
    PERMISSION_ERROR = 'Permission error',
    PERMISSION_DENIED = 'Permission denied'
}

export enum DeviceIdStorageKeys {
    DEVICE_ID1 = 'deviceId1',
    DEVICE_ID2 = 'deviceId2'
}

export class DeviceIdManager {
    private _core : ICoreApi;
    private _china : IChinaApi;
    private _deviceInfo: DeviceInfo;

    constructor(core: ICoreApi, china: IChinaApi, deviceInfo: DeviceInfo) {
        this._core = core;
        this._china = china;
        this._deviceInfo = deviceInfo;
    }

    public fetchDeviceIds(): Promise<void> {
        return new Promise<[string, string]>((resolve, reject) => {
            if ((<AndroidDeviceInfo>this._deviceInfo).getApiLevel() <= BuildVerionCode.M) {
                return this._china.Android.DeviceInfo.getDeviceId().then((deviceId) => {
                    resolve([deviceId, deviceId]);
                }).catch(reject);
            } else {
                const getDeviceId1 = this._china.Android.DeviceInfo.getDeviceIdWithSlot(0);
                const getDeviceId2 = this._china.Android.DeviceInfo.getDeviceIdWithSlot(1);
                return Promise.all([getDeviceId1, getDeviceId2]).then(resolve).catch(reject);
            }
        }).then(([deviceId1, deviceId2]) => {
            if (deviceId1 && deviceId2) {
                (<AndroidDeviceInfo>this._deviceInfo).setDeviceIds(deviceId1, deviceId2);
            } else {
                this._core.Sdk.logInfo('Device ids fetched were invalid');
            }
        }).catch((error) => {
            this._core.Sdk.logWarning(JSON.stringify(error));
        });
    }

    public getDeviceIds(): Promise<void> {
        return PermissionsUtil.checkPermissions(Platform.ANDROID, this._core, PermissionTypes.READ_PHONE_STATE).then((result) => {
            if (result === CurrentPermission.ACCEPTED) {
                return this.readAndStoreDeviceIds();
            } else {
                return Promise.reject(new Error(DeviceIdMessage.PERMISSION_ERROR));
            }
        });
    }

    public getDeviceIdsWithPermissionRequest(): Promise<void> {
        const deviceIdPromise = new Promise<void>((resolve, reject) => {
            this.getDeviceIds().then(resolve).catch((error) => {
                if (error.message === DeviceIdMessage.PERMISSION_ERROR && (<AndroidDeviceInfo>this._deviceInfo).getApiLevel() >= BuildVerionCode.M) {
                    Diagnostics.trigger('device_id_permission', 'Permission requested');
                    this.handlePermissionRequest(PermissionTypes.READ_PHONE_STATE).then(() => {
                        Diagnostics.trigger('device_id_permission', 'Permission granted upon request');
                        return this.readAndStoreDeviceIds().then(resolve);
                    }).catch(reject);
                } else {
                    reject(error);
                }
            });
        });

        return deviceIdPromise
            .catch((error) => {
                Diagnostics.trigger('device_id_error', error);
            });
    }

    public loadStoredDeviceIds(): Promise<void> {
        return this.fetchStoredDeviceIds().then(([deviceId1, deviceId2]) => {
            if (deviceId1 && deviceId2) {
                (<AndroidDeviceInfo>this._deviceInfo).setDeviceIds(deviceId1, deviceId2);
                return Promise.resolve();
            } else {
                return Promise.reject(new Error('Device ids not found in cache'));
            }
        });
    }

    private readAndStoreDeviceIds(): Promise<void> {
        return this.fetchDeviceIds().then(() => {
            this.storeDeviceIds().catch(() => {
                // not sending diagnostics because this event is spammy
            });
            return Promise.resolve();
        });
    }

    private fetchValue(key: string): Promise<string | undefined> {
        return this._core.Storage.get<string>(StorageType.PRIVATE, key).catch(() => undefined);
    }

    private storeValue(key: string, value: string): Promise<void[]> {
        return Promise.all([
            this._core.Storage.set(StorageType.PRIVATE, key, value),
            this._core.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private fetchStoredDeviceIds(): Promise<[string | undefined, string | undefined]> {
        return Promise.all([
            this.fetchValue(DeviceIdStorageKeys.DEVICE_ID1),
            this.fetchValue(DeviceIdStorageKeys.DEVICE_ID2)
        ]);
    }

    private storeDeviceIds(): Promise<(void[])[]> {
        const deviceId1 = (<AndroidDeviceInfo>this._deviceInfo).getDeviceId1();
        const deviceId2 = (<AndroidDeviceInfo>this._deviceInfo).getDeviceId2();
        if (deviceId1 && deviceId2) {
            return Promise.all([
                this.storeValue(DeviceIdStorageKeys.DEVICE_ID1, deviceId1),
                this.storeValue(DeviceIdStorageKeys.DEVICE_ID2, deviceId2)
            ]);
        } else {
            return Promise.reject('Attempt to store invalid device ids');
        }
    }

    private handlePermissionRequest(requestedPermission: PermissionTypes): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const onPermissionResultObserver = this._core.Permissions.onPermissionsResult.subscribe((permission, granted) => {
                if (permission === requestedPermission && granted) {
                    resolve();
                    this._core.Permissions.onPermissionsResult.unsubscribe(onPermissionResultObserver);
                }  else {
                    reject(new Error(DeviceIdMessage.PERMISSION_DENIED));
                }
            });
            PermissionsUtil.requestPermission(Platform.ANDROID, this._core, requestedPermission).catch(reject);
        });
    }
}
