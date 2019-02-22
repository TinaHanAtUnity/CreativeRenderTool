import * as sinon from 'sinon';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil } from 'Core/Utilities/Permissions';

export function fakeARUtils(sandbox: sinon.SinonSandbox): void {
    sandbox.stub(ARUtil, 'isARSupported').callsFake(() => {
        return Promise.resolve<boolean>(false);
     });
    sandbox.stub(PermissionsUtil, 'checkPermissionInManifest').callsFake(() => {
        return Promise.resolve<boolean>(false);
     });
    sandbox.stub(PermissionsUtil, 'checkPermissions').callsFake(() => {
        return Promise.resolve<boolean>(false);
    });
}
