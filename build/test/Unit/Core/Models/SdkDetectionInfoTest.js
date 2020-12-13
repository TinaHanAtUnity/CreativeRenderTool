import 'mocha';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { SdkDetectionInfo } from 'Core/Models/SdkDetectionInfo';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`MediationDetectionInfoTest - ${Platform[platform]}`, () => {
        let backend;
        let nativeBridge;
        let core;
        let sdkDetectionInfo;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            sdkDetectionInfo = new SdkDetectionInfo(platform, core);
            backend.Api.ClassDetection.setPlatform(platform);
        });
        it('should return false when detected class is not present', () => {
            return sdkDetectionInfo.detectSdks().then(() => {
                const result = sdkDetectionInfo.getSdkDetectionJSON();
                assert(result === '{"UnityEngine":false}');
            });
        });
        it('should return true when detected class is present', () => {
            backend.Api.ClassDetection.setClassesArePresent(true);
            return sdkDetectionInfo.detectSdks().then(() => {
                const result = sdkDetectionInfo.getSdkDetectionJSON();
                assert(result === '{"UnityEngine":true}');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2RrRGV0ZWN0aW9uSW5mb1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9Nb2RlbHMvU2RrRGV0ZWN0aW9uSW5mb1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBSTlCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFaEUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLGdDQUFnQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUU7UUFFaEUsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLElBQWMsQ0FBQztRQUNuQixJQUFJLGdCQUFrQyxDQUFDO1FBRXZDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0QsSUFBSSxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDN0MsZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHdEQUF3RCxFQUFFLEdBQUcsRUFBRTtZQUM5RCxPQUFPLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxNQUFNLEtBQUssdUJBQXVCLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtZQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN0RCxPQUFPLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxNQUFNLEtBQUssc0JBQXNCLENBQUMsQ0FBQztZQUM5QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9