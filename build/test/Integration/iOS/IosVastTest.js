import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { UnityAds } from 'Backend/UnityAds';
import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
describe('IosVastTest V4', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        fakeARUtils(sandbox);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should handle happy path on iOS', function (done) {
        this.timeout(10000);
        let readyCount = 0;
        const listener = {
            onUnityAdsReady: (placement) => {
                if (++readyCount === 1) {
                    done();
                }
            },
            onUnityAdsStart: (placement) => {
                return;
            },
            onUnityAdsFinish: (placement, state) => {
                return;
            },
            onUnityAdsError: (error, message) => {
                return;
            },
            onUnityAdsClick: (placement) => {
                return;
            },
            onUnityAdsPlacementStateChanged: (placement, oldState, newState) => {
                return;
            }
        };
        UnityAds.setBackend(new Backend(Platform.IOS));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('DA276DED-8DFE-4C57-A75E-9D7F7BBF2D21');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('Apple');
        UnityAds.getBackend().Api.DeviceInfo.setModel('iPhone7,2');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('10.1.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(357);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(647);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('+0200');
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        UnityAds.initialize(Platform.IOS, '333', listener, true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zVmFzdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L0ludGVncmF0aW9uL2lPUy9Jb3NWYXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzVELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3RELE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFL0UsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtJQUM1QixNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7SUFFdEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLGNBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUQsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxVQUEyQyxJQUFlO1FBQzVGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sUUFBUSxHQUFzQjtZQUNoQyxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLElBQUksRUFBRSxVQUFVLEtBQUssQ0FBQyxFQUFFO29CQUNwQixJQUFJLEVBQUUsQ0FBQztpQkFDVjtZQUNMLENBQUM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLE9BQU87WUFDWCxDQUFDO1lBQ0QsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEtBQWEsRUFBRSxFQUFFO2dCQUNuRCxPQUFPO1lBQ1gsQ0FBQztZQUNELGVBQWUsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsRUFBRTtnQkFDaEQsT0FBTztZQUNYLENBQUM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLE9BQU87WUFDWCxDQUFDO1lBQ0QsK0JBQStCLEVBQUUsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO2dCQUN2RixPQUFPO1lBQ1gsQ0FBQztTQUNKLENBQUM7UUFFRixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3RHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0QsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN6RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTFELGFBQWEsQ0FBQyxjQUFjLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUM5RSxlQUFlLENBQUMsVUFBVSxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDNUUsaUNBQWlDLENBQUMsY0FBYyxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFFbEcsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9