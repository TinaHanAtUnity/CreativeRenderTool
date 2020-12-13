import 'mocha';
import { assert } from 'chai';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { UnityInfo } from 'Core/Models/UnityInfo';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('UnityInfoTest - ' + Platform[platform], () => {
        const appId = 'test.app';
        const userId = '123456acbdef';
        const sessionId = '12345';
        let backend;
        let nativeBridge;
        let core;
        let unityInfo;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            unityInfo = new UnityInfo(platform, core);
        });
        it('should return undefined identifiers when Unity engine is not running', () => {
            backend.Api.Preferences.setUnityEngineRunning(false);
            return unityInfo.fetch(appId).then(() => {
                assert.isUndefined(unityInfo.getAnalyticsUserId(), 'analytics user id was defined when engine is not running');
                assert.isUndefined(unityInfo.getAnalyticsSessionId(), 'analytics session id was defined when engine is not running');
            });
        });
        it('should return Unity Analytics identifiers when Unity engine is running', () => {
            backend.Api.Preferences.setUnityEngineRunning(true);
            return unityInfo.fetch(appId).then(() => {
                assert.equal(unityInfo.getAnalyticsUserId(), userId, 'analytics user id was not successfully fetched');
                assert.equal(unityInfo.getAnalyticsSessionId(), sessionId, 'analytics session id was not successfully fetched');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pdHlJbmZvVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL01vZGVscy9Vbml0eUluZm9UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUk5QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUVsRCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRTtRQUNuRCxNQUFNLEtBQUssR0FBVyxVQUFVLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQVcsY0FBYyxDQUFDO1FBQ3RDLE1BQU0sU0FBUyxHQUFXLE9BQU8sQ0FBQztRQUVsQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksU0FBb0IsQ0FBQztRQUV6QixVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLFNBQVMsR0FBRyxJQUFJLFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsc0VBQXNFLEVBQUUsR0FBRyxFQUFFO1lBQzVFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JELE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLDBEQUEwRCxDQUFDLENBQUM7Z0JBQy9HLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsNkRBQTZELENBQUMsQ0FBQztZQUN6SCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHdFQUF3RSxFQUFFLEdBQUcsRUFBRTtZQUM5RSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxPQUFPLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxNQUFNLEVBQUUsZ0RBQWdELENBQUMsQ0FBQztnQkFDdkcsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMscUJBQXFCLEVBQUUsRUFBRSxTQUFTLEVBQUUsbURBQW1ELENBQUMsQ0FBQztZQUNwSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9