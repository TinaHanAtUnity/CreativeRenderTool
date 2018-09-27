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

    const platforms = [Platform.ANDROID, Platform.IOS];
    const platformNames = ['Android', 'iOS'];

    let nativeBridge: any;

    platforms.forEach(platform => {
        describe('Platform: ' + platformNames[platform], () => {
            beforeEach(() => {
                nativeBridge = sinon.createStubInstance(NativeBridge);
                nativeBridge.getPlatform.returns(platform);
                nativeBridge.Permissions = new PermissionsApi(nativeBridge);

                switch (platform) {
                    case Platform.ANDROID:
                        nativeBridge.AndroidPreferences = sinon.createStubInstance(AndroidPreferencesApi);
                        nativeBridge.Permissions.Android = sinon.createStubInstance(AndroidPermissionsApi);
                        break;
                    case Platform.IOS:
                        nativeBridge.Permissions.Ios = sinon.createStubInstance(IosPermissionsApi);
                        break;
                    default:
                }
            });

            const permission = PermissionTypes.CAMERA;

            it('checkPermission must reject check for invalid permission', (done) => {
                PermissionsUtil.checkPermissions(nativeBridge, PermissionTypes.INVALID).then(() => {
                    assert(false);
                    done();
                }).catch(() => {
                    assert(true);
                    done();
                });
            });

            it('requestPermission must reject for invalid permission', (done) => {
                const req = PermissionsUtil.requestPermission(nativeBridge, PermissionTypes.INVALID);
                req.then(() => {
                    assert(false);
                    done();
                }).catch((error) => {
                    assert.equal(error, PermissionTypes.INVALID);
                    assert(true);
                    done();
                });
            });

            if (platform === Platform.ANDROID) {
                it('checkPermission must return unknown if permission is not asked before', () => {
                    nativeBridge.AndroidPreferences.hasKey.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).returns(Promise.resolve(false));
                    nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).returns(Promise.resolve(-1));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.UNKNOWN);
                    });
                });

                it('checkPermission must return denied if permission was asked before', () => {
                    nativeBridge.AndroidPreferences.hasKey.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).returns(Promise.resolve(true));
                    nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).returns(Promise.resolve(-1));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.DENIED);
                    });
                });

                it('checkPermission must return accepted', () => {
                    nativeBridge.Permissions.Android.checkPermission.withArgs(ANDROID_PERMISSION_CAMERA).returns(Promise.resolve(0));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.ACCEPTED);
                    });
                });

                it('requestPermission sets flag on android and increases request code', (done) => {
                    const reqCode = 1000;
                    nativeBridge.Permissions.permissionRequestCode = reqCode;
                    nativeBridge.Permissions.Android.requestPermissions.withArgs([ANDROID_PERMISSION_CAMERA], reqCode).returns(Promise.resolve());
                    nativeBridge.AndroidPreferences.setBoolean.withArgs(ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true).returns(Promise.resolve());

                    PermissionsUtil.requestPermission(nativeBridge, permission).then(() => {
                        assert.equal(nativeBridge.Permissions.permissionRequestCode, reqCode + 1);
                        assert(nativeBridge.AndroidPreferences.setBoolean.calledWith(ANDROID_PERMISSIONS_ASKED_KEY, permission.toString(), true));
                        done();
                    });
                });
            }

            if (platform === Platform.IOS) {
                it('checkPermission must return unknown', () => {
                    nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).returns(Promise.resolve(0));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.UNKNOWN);
                    });
                });

                it('checkPermission must return denied(restricted)', () => {
                    nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).returns(Promise.resolve(1));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.DENIED);
                    });
                });

                it('checkPermission must return denied(denied)', () => {
                    nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).returns(Promise.resolve(2));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.DENIED);
                    });
                });

                it('checkPermission must return accepted(authorized)', () => {
                    nativeBridge.Permissions.Ios.checkPermission.withArgs(IOS_PERMISSION_CAMERA).returns(Promise.resolve(3));

                    return PermissionsUtil.checkPermissions(nativeBridge, permission).then((currentPermission) => {
                        assert.equal(currentPermission, CurrentPermission.ACCEPTED);
                    });
                });
            }
        });
    });
});
