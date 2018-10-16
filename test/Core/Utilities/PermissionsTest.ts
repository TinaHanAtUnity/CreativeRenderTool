import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CurrentPermission, PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/ICore';
import { TestFixtures } from '../../TestHelpers/TestFixtures';

describe('PermissionsUtil Test', () => {
    const ANDROID_PERMISSIONS_ASKED_KEY = 'unity-ads-permissions-asked';
    const ANDROID_PERMISSION_CAMERA = 'android.permission.CAMERA';
    const IOS_PERMISSION_CAMERA = 'vide';
    const PERMISSION_TYPE = PermissionTypes.CAMERA;

    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;

    describe('Platform: Android', () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(Platform.ANDROID);
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });

        it('checkPermission must reject check for invalid permission', () => {
            return PermissionsUtil.checkPermissions(Platform.ANDROID, core, PermissionTypes.INVALID).then(() => {
                assert.fail('checkPermissions resolved', 'checkPermissions rejects');
                return Promise.resolve();
            }).catch(() => {
                assert(true);
                return Promise.resolve();
            });
        });

        it('requestPermission must reject for invalid permission', () => {
            const req = PermissionsUtil.requestPermission(Platform.ANDROID, core, PermissionTypes.INVALID);
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
            sinon.stub(core.Android!.Preferences, 'hasKey').withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).resolves(false);
            sinon.stub(core.Permissions.Android!, 'checkPermission').withArgs(ANDROID_PERMISSION_CAMERA).resolves(-1);

            return PermissionsUtil.checkPermissions(Platform.ANDROID, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.UNKNOWN);
            });
        });

        it('checkPermission must return denied if permission was asked before', () => {
            sinon.stub(core.Android!.Preferences, 'hasKey').withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PermissionTypes.CAMERA).resolves(true);
            sinon.stub(core.Permissions.Android!, 'checkPermission').withArgs(ANDROID_PERMISSION_CAMERA).resolves(-1);

            return PermissionsUtil.checkPermissions(Platform.ANDROID, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return accepted', () => {
            sinon.stub(core.Permissions.Android!, 'checkPermission').withArgs(ANDROID_PERMISSION_CAMERA).resolves(0);

            return PermissionsUtil.checkPermissions(Platform.ANDROID, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.ACCEPTED);
            });
        });

        it('requestPermission sets flag on android and increases request code', () => {
            const reqCode = 1000;
            core.Permissions.permissionRequestCode = reqCode;
            sinon.stub(core.Permissions.Android!, 'requestPermissions').withArgs([ANDROID_PERMISSION_CAMERA], reqCode).resolves();
            sinon.stub(core.Android!.Preferences, 'setBoolean').withArgs(ANDROID_PERMISSIONS_ASKED_KEY, PERMISSION_TYPE.toString(), true).resolves();

            return PermissionsUtil.requestPermission(Platform.ANDROID, core, PERMISSION_TYPE).then(() => {
                assert.equal(core.Permissions.permissionRequestCode, reqCode + 1);
                sinon.assert.calledWith(<sinon.SinonStub>core.Android!.Preferences.setBoolean, ANDROID_PERMISSIONS_ASKED_KEY, PERMISSION_TYPE.toString(), true);
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
            backend = TestFixtures.getBackend(Platform.IOS);
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
        });

        it('checkPermission must reject check for invalid permission', () => {
            return PermissionsUtil.checkPermissions(Platform.IOS, core, PermissionTypes.INVALID).then(() => {
                assert.fail('checkPermissions resolved', 'checkPermissions rejects');
                return Promise.resolve();
            }).catch(() => {
                assert(true);
                return Promise.resolve();
            });
        });

        it('requestPermission must reject for invalid permission', () => {
            const req = PermissionsUtil.requestPermission(Platform.IOS, core, PermissionTypes.INVALID);
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
            sinon.stub(core.Permissions.Ios!, 'checkPermission').withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_UNKNOWN);

            return PermissionsUtil.checkPermissions(Platform.IOS, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.UNKNOWN);
            });
        });

        it('checkPermission must return denied(restricted)', () => {
            sinon.stub(core.Permissions.Ios!, 'checkPermission').withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_RESTRICTED);

            return PermissionsUtil.checkPermissions(Platform.IOS, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return denied(denied)', () => {
            sinon.stub(core.Permissions.Ios!, 'checkPermission').withArgs(IOS_PERMISSION_CAMERA).resolves(Promise.resolve(IOS_PERMISSION_CODE_DENIED));

            return PermissionsUtil.checkPermissions(Platform.IOS, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.DENIED);
            });
        });

        it('checkPermission must return accepted(authorized)', () => {
            sinon.stub(core.Permissions.Ios!, 'checkPermission').withArgs(IOS_PERMISSION_CAMERA).resolves(IOS_PERMISSION_CODE_AUTHORIZED);

            return PermissionsUtil.checkPermissions(Platform.IOS, core, PERMISSION_TYPE).then((currentPermission) => {
                assert.equal(currentPermission, CurrentPermission.ACCEPTED);
            });
        });
    });
});
