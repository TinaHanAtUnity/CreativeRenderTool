import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PermissionsApi } from 'Core/Native/Permissions';
import { IosPermission } from 'Core/Native/iOS/IosPermissions';
import { AndroidPermission } from 'Core/Native/Android/AndroidPermissions';
import { PermissionTypes } from 'Core/Utilities/Permissions';
import { IObserver2 } from 'Core/Utilities/IObserver';

describe('PermissionsApi Test', () => {
    const eventNamePermissionsResult = 'PERMISSIONS_RESULT';
    const eventNamePermissionsError = 'PERMISSIONS_ERROR';
    const IOS_STATUS_AUTHORIZED = 3;
    const ANDROID_REQUEST_CODE = 1;
    const ANDROID_STATUS_GRANTED = [0];

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    const eventHandlerSpy = sinon.spy();
    let nativeBridge: NativeBridge;
    let eventHandlerObserver: IObserver2<string, boolean>;

    describe('Platform: Android', () => {
        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.ANDROID, false);
            nativeBridge.Permissions = new PermissionsApi(nativeBridge);
            eventHandlerSpy.resetHistory();
            eventHandlerObserver = nativeBridge.Permissions.onPermissionsResult.subscribe(eventHandlerSpy);
        });

        afterEach(() => {
            nativeBridge.Permissions.onPermissionsResult.unsubscribe(eventHandlerObserver);
        });

        it('should handle PERMISSION_RESULT', () => {
            const permissions = [AndroidPermission.CAMERA];
            const requestCode = 0;
            nativeBridge.Permissions.permissionRequestCode = requestCode;
            nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [requestCode, permissions, ANDROID_STATUS_GRANTED]);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], PermissionTypes.CAMERA);
            assert.equal(call.args[1], true);
        });

        it('should not handle PERMISSION_RESULT for different request code', () => {
            const permissions = [AndroidPermission.CAMERA];
            nativeBridge.Permissions.permissionRequestCode = 0;
            nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [ANDROID_REQUEST_CODE, permissions, ANDROID_STATUS_GRANTED]);
            sinon.assert.notCalled(eventHandlerSpy);
        });

        it('should handle PERMISSIONS_ERROR', () => {
            nativeBridge.Permissions.handleEvent(eventNamePermissionsError, []);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], 'ERROR');
            assert.equal(call.args[1], false);
        });
    });

    describe('Platform: iOS', () => {
        beforeEach(() => {
            nativeBridge = new NativeBridge({
                handleInvocation,
                handleCallback
            }, Platform.IOS, false);
            nativeBridge.Permissions = new PermissionsApi(nativeBridge);
            eventHandlerSpy.resetHistory();
            eventHandlerObserver = nativeBridge.Permissions.onPermissionsResult.subscribe(eventHandlerSpy);
        });

        afterEach(() => {
            nativeBridge.Permissions.onPermissionsResult.unsubscribe(eventHandlerObserver);
        });

        it('should handle PERMISSION_RESULT', () => {
            const perm = IosPermission.AVMediaTypeVideo;
            nativeBridge.Permissions.handleEvent(eventNamePermissionsResult, [perm, IOS_STATUS_AUTHORIZED]);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], PermissionTypes.CAMERA);
            assert.equal(call.args[1], IOS_STATUS_AUTHORIZED);
        });
    });
});
