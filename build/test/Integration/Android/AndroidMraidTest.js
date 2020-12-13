import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { UnityAds } from 'Backend/UnityAds';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
describe('AndroidMraidTest', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        fakeARUtils(sandbox);
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('should handle happy path on Android', function (done) {
        this.timeout(10000);
        let readyCount = 0;
        const listener = {
            onUnityAdsReady: (placement) => {
                if (++readyCount === 2) {
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
        UnityAds.setBackend(new Backend(Platform.ANDROID));
        UnityAds.getBackend().Api.Request.setPassthrough(true);
        UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
        UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
        UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
        UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
        UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
        UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
        UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
        ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        UnityAds.initialize(Platform.ANDROID, '444', listener, true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZE1yYWlkVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvSW50ZWdyYXRpb24vQW5kcm9pZC9BbmRyb2lkTXJhaWRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM1RCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN0RCxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV0QyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxVQUEyQyxJQUFlO1FBQ2hHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLE1BQU0sUUFBUSxHQUFzQjtZQUNoQyxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLElBQUksRUFBRSxVQUFVLEtBQUssQ0FBQyxFQUFFO29CQUNwQixJQUFJLEVBQUUsQ0FBQztpQkFDVjtZQUNMLENBQUM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLE9BQU87WUFDWCxDQUFDO1lBQ0QsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEtBQWEsRUFBRSxFQUFFO2dCQUNuRCxPQUFPO1lBQ1gsQ0FBQztZQUNELGVBQWUsRUFBRSxDQUFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsRUFBRTtnQkFDaEQsT0FBTztZQUNYLENBQUM7WUFDRCxlQUFlLEVBQUUsQ0FBQyxTQUFpQixFQUFFLEVBQUU7Z0JBQ25DLE9BQU87WUFDWCxDQUFDO1lBQ0QsK0JBQStCLEVBQUUsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO2dCQUN2RixPQUFPO1lBQ1gsQ0FBQztTQUNKLENBQUM7UUFFRixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25ELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV2RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1FBQ3RHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekQsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0QsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRTlELGFBQWEsQ0FBQyxjQUFjLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUM5RSxlQUFlLENBQUMsVUFBVSxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDNUUsaUNBQWlDLENBQUMsY0FBYyxDQUFDLCtDQUErQyxDQUFDLENBQUM7UUFDbEcsY0FBYyxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUUxRCxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=