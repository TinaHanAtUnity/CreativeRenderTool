import * as sinon from 'sinon';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil } from 'Core/Utilities/Permissions';

let _isARSupportedStub: any;
let _checkPermissionsInManifestStub: any;
let _checkPermissionsStub: any;

export function fakeARUtils(): void {
    _isARSupportedStub = sinon.stub(ARUtil, 'isARSupported').callsFake(() => {
        return Promise.resolve<boolean>(false);
    });
    _checkPermissionsInManifestStub = sinon.stub(PermissionsUtil, 'checkPermissionInManifest').callsFake(() => {
        return Promise.resolve<boolean>(false);
    });
    _checkPermissionsStub = sinon.stub(PermissionsUtil, 'checkPermissions').callsFake(() => {
        return Promise.resolve<boolean>(false);
    });
}

export function unfakeARUtils(): void {
    _isARSupportedStub.restore();
    _checkPermissionsInManifestStub.restore();
    _checkPermissionsStub.restore();
}
