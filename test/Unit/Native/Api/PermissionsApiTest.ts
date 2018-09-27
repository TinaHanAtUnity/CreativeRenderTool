import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PermissionsApi } from 'Core/Native/Permissions';
import { IosPermission } from 'Core/Native/iOS/IosPermissions';
import { AndroidPermission } from 'Core/Native/Android/AndroidPermissions';
import { PermissionsUtil } from 'Core/Utilities/Permissions';

describe('PermissionsApi Test', () => {
    const platforms = [Platform.ANDROID, Platform.IOS];
    const platformNames = ['Android', 'iOS'];
    const eventNamePermissionsResult = 'PERMISSIONS_RESULT';
    const eventNamePermissionsError = 'PERMISSIONS_ERROR';

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    platforms.forEach(platform => {
        describe('Platform: ' + platformNames[platform], () => {
            beforeEach(() => {
                nativeBridge = new NativeBridge({
                    handleInvocation,
                    handleCallback
                }, platform, false);
                nativeBridge.Permissions = new PermissionsApi(nativeBridge);
            });

            it('should handle PERMISSION_RESULT', () => {
                const spy = sinon.spy();
                nativeBridge.Permissions.onPermissionsResult.subscribe(spy);
                if (platform === Platform.IOS) {
                    const perm = IosPermission.AVMediaTypeVideo;
                    const status = 3;
                    nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [perm, status]);
                    sinon.assert.calledOnce(spy);
                    const call = spy.getCall(0);
                    assert.equal(call.args.length, 2);
                    assert.equal(call.args[0], PermissionsUtil.getCommonPermission(perm));
                    assert.equal(call.args[1], status);
                } else if (platform === Platform.ANDROID) {
                    const permissions = [AndroidPermission.CAMERA];
                    const granted = [0];
                    const requestCode = 0;
                    nativeBridge.Permissions.permissionRequestCode = requestCode;
                    nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [requestCode, permissions, granted]);
                    sinon.assert.calledOnce(spy);
                    const call = spy.getCall(0);
                    assert.equal(call.args.length, 2);
                    assert.equal(call.args[0], PermissionsUtil.getCommonPermission(permissions[0]));
                    assert.equal(call.args[1], granted[0] !== -1);
                }
            });

            if (platform === Platform.ANDROID) {
                it('should not handle PERMISSION_RESULT for different request code', () => {
                    const spy = sinon.spy();
                    nativeBridge.Permissions.onPermissionsResult.subscribe(spy);
                    const permissions = [AndroidPermission.CAMERA];
                    const granted = [0];
                    const requestCode = 1;
                    nativeBridge.Permissions.permissionRequestCode = 0;
                    nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [requestCode, permissions, granted]);
                    sinon.assert.notCalled(spy);
                });

                it('should handle PERMISSIONS_ERROR', () => {
                    const spy = sinon.spy();
                    nativeBridge.Permissions.onPermissionsResult.subscribe(spy);
                    nativeBridge.Permissions.handleEvent(eventNamePermissionsError, []);
                    sinon.assert.calledOnce(spy);
                    const call = spy.getCall(0);
                    assert.equal(call.args.length, 2);
                    assert.equal(call.args[0], 'ERROR');
                    assert.equal(call.args[1], false);
                });
            }
        });
    });
});
