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
describe('IosIntegrationTest V4', () => {
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
        UnityAds.initialize(Platform.IOS, '456', listener, true);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zSW50ZWdyYXRpb25UZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9JbnRlZ3JhdGlvbi9pT1MvSW9zSW50ZWdyYXRpb25UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxnREFBZ0QsQ0FBQztBQUNuRyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUUvRSxRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO0lBQ25DLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV0QyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osY0FBYyxDQUFDLHNCQUFzQixDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ1gsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3RCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLFVBQTJDLElBQWU7UUFDNUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsTUFBTSxRQUFRLEdBQXNCO1lBQ2hDLGVBQWUsRUFBRSxDQUFDLFNBQWlCLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxFQUFFLFVBQVUsS0FBSyxDQUFDLEVBQUU7b0JBQ3BCLElBQUksRUFBRSxDQUFDO2lCQUNWO1lBQ0wsQ0FBQztZQUNELGVBQWUsRUFBRSxDQUFDLFNBQWlCLEVBQUUsRUFBRTtnQkFDbkMsT0FBTztZQUNYLENBQUM7WUFDRCxnQkFBZ0IsRUFBRSxDQUFDLFNBQWlCLEVBQUUsS0FBYSxFQUFFLEVBQUU7Z0JBQ25ELE9BQU87WUFDWCxDQUFDO1lBQ0QsZUFBZSxFQUFFLENBQUMsS0FBYSxFQUFFLE9BQWUsRUFBRSxFQUFFO2dCQUNoRCxPQUFPO1lBQ1gsQ0FBQztZQUNELGVBQWUsRUFBRSxDQUFDLFNBQWlCLEVBQUUsRUFBRTtnQkFDbkMsT0FBTztZQUNYLENBQUM7WUFDRCwrQkFBK0IsRUFBRSxDQUFDLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxRQUFnQixFQUFFLEVBQUU7Z0JBQ3ZGLE9BQU87WUFDWCxDQUFDO1NBQ0osQ0FBQztRQUVGLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLHNDQUFzQyxDQUFDLENBQUM7UUFDdEcsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMzRCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUQsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFMUQsYUFBYSxDQUFDLGNBQWMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1FBQzlFLGVBQWUsQ0FBQyxVQUFVLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUM1RSxpQ0FBaUMsQ0FBQyxjQUFjLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUVsRyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=