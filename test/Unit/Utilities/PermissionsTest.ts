import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PermissionsApi } from 'Core/Native/Permissions';
import { AndroidPreferencesApi } from 'Core/Native/Android/AndroidPreferences';
import { AndroidPermissionsApi } from 'Core/Native/Android/AndroidPermissions';
import { IosPermissionsApi } from 'Core/Native/iOS/IosPermissions';
import { PermissionsUtil, PermissionTypes, CurrentPermission } from 'Core/Utilities/Permissions';

describe('PermissionsUtil Test', () => {
    const ANDROID_PERMISSIONS_ASKED_KEY = 'unity-ads-permissions-asked';
    const ANDROID_PERMISSION_CAMERA = 'android.permission.CAMERA';
    const IOS_PERMISSION_CAMERA = 'vide';
    const PERMISSION_TYPE = PermissionTypes.CAMERA;

    let nativeBridge: any;

    describe('Platform: Android', () => {
        beforeEach(() => {
            nativeBridge = sinon.createStubInstance(NativeBridge);
            nativeBridge.getPlatform.returns(Platform.ANDROID);
            nativeBridge.Permissions = new PermissionsApi(nativeBridge);
            nativeBridge.AndroidPreferences = sinon.createStubInstance(AndroidPreferencesApi);
            nativeBridge.Permissions.Android = sinon.createStubInstance(AndroidPermissionsApi);
        });

        it('checkPermission must reject check for invalid permission', () => {
            return PermissionsUtil.checkPermissions(nativeBridge, PermissionTypes.INVALID).then(() => {
                assert.fail('checkPermissions resolved', 'checkPermissions rejects');
                return Promise.resolve();
            }).catch(() => {
                assert(true);
                return Promise.resolve();
            });
        });

        it('requestPermission must reject for invalid permission', () => {
            const req = PermissionsUtil.requestPermission(nativeBridge, PermissionTypes.INVALID);
            return req.then(() => {
                assert.fail('requestPermission resolved', 'requestPermission rejects');
                return Promise.resolve();
            }).catch((error) => {
                assert.equal(error, PermissionTypes.INVALID);
                assert(true);
                return Promise.resolve();
            });
        });

        it('checkPermission must return unknown if permission is not asked before', () => {
            nativeBridge.AndroidPreferences.hasKey.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).resolves(false);
            nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).resolves(-1);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.UNKNOWN);
            });
        });

        it('checkPermission must return denied if permission was asked before', () => {
            nativeBridge.AndroidPreferences.hasKey.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).resolves(true);
            nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).resolves(-1);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return accepted', () => {
            nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).resolves(0);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.ACCEPTED);
            });
        });

        it('requestPermission sets flag on android and increases request code', () => {
            const reqCode = 1000;
            nativeBridge.Permissions.permissionRequestCode = reqCode;
            nativeBridge.Permissions.Android.requestPermissions.withArgs([ANDROID_PERMISSION_CAMERA], reqCode).resolves();
            nativeBridge.AndroidPreferences.setBoolean.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PERMISSION_TYPE.toString(), true).resolves();

            return PermissionsUtil.requestPermission(nativeBridge, PERMISSION_TYPE).then(() => {
                assert.equal(nativeBridge.Permissions.permissionRequestCode, reqCode + 1);
                sinon.assert.calledWith(nativeBridge.AndroidPreferences.setBoolean, ANDROID_PERMISSIONS_ASKED_KEY, PERMISSION_TYPE.toString(), true);
                return Promise.resolve();
            });
        });
    });

    describe('Platform: iOS', () => {
        const IOS_PERMISSION_CODE_UNKNOWN = 0;
        const IOS_PERMISSION_CODE_RESTRICTED = 1;
        const IOS_PERMISSION_CODE_DENIED = 2;
        const IOS_PERMISSION_CODE_AUTHORIZED = 3;

        beforeEach(() => {
            nativeBridge = sinon.createStubInstance(NativeBridge);
            nativeBridge.getPlatform.returns(Platform.IOS);
            nativeBridge.Permissions = new PermissionsApi(nativeBridge);
            nativeBridge.Permissions.Ios = sinon.createStubInstance(IosPermissionsApi);
        });

        it('checkPermission must reject check for invalid permission', () => {
            return PermissionsUtil.checkPermissions(nativeBridge, PermissionTypes.INVALID).then(() => {
                assert.fail('checkPermissions resolved', 'checkPermissions rejects');
                return Promise.resolve();
            }).catch(() => {
                assert(true);
                return Promise.resolve();
            });
        });

        it('requestPermission must reject for invalid permission', () => {
            const req = PermissionsUtil.requestPermission(nativeBridge, PermissionTypes.INVALID);
            return req.then(() => {
                assert.fail('requestPermission resolved', 'requestPermission rejects');
                return Promise.resolve();
            }).catch((error) => {
                assert.equal(error, PermissionTypes.INVALID);
                assert(true);
                return Promise.resolve();
            });
        });

        it('checkPermission must return unknown', () => {
            nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_UNKNOWN);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.UNKNOWN);
            });
        });

        it('checkPermission must return denied(restricted)', () => {
            nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_RESTRICTED);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return denied(denied)', () => {
            nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).resolves(Promise.resolve(IOS_PERMISSION_CODE_DENIED));

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return accepted(authorized)', () => {
            nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_AUTHORIZED);

            return PermissionsUtil.checkPermissions(nativeBridge, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.ACCEPTED);
            });
        });
    });
});
