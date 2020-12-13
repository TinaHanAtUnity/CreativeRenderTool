import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil } from 'Core/Utilities/Permissions';
export function fakeARUtils(sandbox) {
    sandbox.stub(ARUtil, 'isARSupported').callsFake(() => {
        return Promise.resolve(false);
    });
    sandbox.stub(PermissionsUtil, 'checkPermissionInManifest').callsFake(() => {
        return Promise.resolve(false);
    });
    sandbox.stub(PermissionsUtil, 'checkPermissions').callsFake(() => {
        return Promise.resolve(false);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFrZUFSVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L1Rlc3RIZWxwZXJzL0Zha2VBUlV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUM3QyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFN0QsTUFBTSxVQUFVLFdBQVcsQ0FBQyxPQUEyQjtJQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2pELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBVSxLQUFLLENBQUMsQ0FBQztJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUNKLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLDJCQUEyQixDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUN0RSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQVUsS0FBSyxDQUFDLENBQUM7SUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDSixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDN0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFVLEtBQUssQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9