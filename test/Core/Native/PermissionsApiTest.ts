import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { PermissionsApi } from 'Core/Native/Permissions';
import { IosPermission } from 'Core/Native/iOS/Permissions';
import { AndroidPermission } from 'Core/Native/Android/Permissions';
import { PermissionTypes } from 'Core/Utilities/Permissions';
import { IObserver2 } from 'Core/Utilities/IObserver';
import { Backend } from '../../../src/ts/Backend/Backend';
import { ICoreApi } from '../../../src/ts/Core/Core';
import { TestFixtures } from '../../TestHelpers/TestFixtures';

describe('PermissionsApi Test', () => {
    const eventNamePermissionsResult = 'PERMISSIONS_RESULT';
    const eventNamePermissionsError = 'PERMISSIONS_ERROR';
    const IOS_STATUS_AUTHORIZED = 3;
    const ANDROID_REQUEST_CODE = 1;
    const ANDROID_STATUS_GRANTED = [0];

    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    const eventHandlerSpy = sinon.spy();
    let eventHandlerObserver: IObserver2<string, boolean>;

    describe('Platform: Android', () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(Platform.ANDROID);
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            core.Permissions = new PermissionsApi(nativeBridge);
            eventHandlerSpy.resetHistory();
            eventHandlerObserver = core.Permissions.onPermissionsResult.subscribe(eventHandlerSpy);
        });

        afterEach(() => {
            core.Permissions.onPermissionsResult.unsubscribe(eventHandlerObserver);
        });

        it('should handle PERMISSION_RESULT', () => {
            const permissions = [AndroidPermission.CAMERA];
            const requestCode = 0;
            core.Permissions.permissionRequestCode = requestCode;
            core.Permissions.handleEvent(eventNamePermissionsResult, [requestCode, permissions, ANDROID_STATUS_GRANTED]);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], PermissionTypes.CAMERA);
            assert.equal(call.args[1], true);
        });

        it('should not handle PERMISSION_RESULT for different request code', () => {
            const permissions = [AndroidPermission.CAMERA];
            core.Permissions.permissionRequestCode = 0;
            core.Permissions.handleEvent(eventNamePermissionsResult, [ANDROID_REQUEST_CODE, permissions, ANDROID_STATUS_GRANTED]);
            sinon.assert.notCalled(eventHandlerSpy);
        });

        it('should handle PERMISSIONS_ERROR', () => {
            core.Permissions.handleEvent(eventNamePermissionsError, []);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], 'ERROR');
            assert.equal(call.args[1], false);
        });
    });

    describe('Platform: iOS', () => {
        beforeEach(() => {
            backend = TestFixtures.getBackend(Platform.IOS);
            nativeBridge = TestFixtures.getNativeBridge(Platform.IOS, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            core.Permissions = new PermissionsApi(nativeBridge);
            eventHandlerSpy.resetHistory();
            eventHandlerObserver = core.Permissions.onPermissionsResult.subscribe(eventHandlerSpy);
        });

        afterEach(() => {
            core.Permissions.onPermissionsResult.unsubscribe(eventHandlerObserver);
        });

        it('should handle PERMISSION_RESULT', () => {
            const perm = IosPermission.AVMediaTypeVideo;
            core.Permissions.handleEvent(eventNamePermissionsResult, [perm, IOS_STATUS_AUTHORIZED]);
            sinon.assert.calledOnce(eventHandlerSpy);
            const call = eventHandlerSpy.getCall(0);
            assert.equal(call.args.length, 2);
            assert.equal(call.args[0], PermissionTypes.CAMERA);
            assert.equal(call.args[1], IOS_STATUS_AUTHORIZED);
        });
    });
});
