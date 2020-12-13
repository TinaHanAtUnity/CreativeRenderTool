import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { CampaignManager } from 'Ads/Managers/__mocks__/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { MissedImpressionManager } from 'Ads/Managers/__mocks__/MissedImpressionManager';
import { PlacementManager } from 'Ads/Managers/__mocks__/PlacementManager';
import { RefreshManager } from 'Ads/Managers/__mocks__/RefreshManager';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { ThirdPartyEventManagerFactory } from 'Ads/Managers/__mocks__/ThirdPartyEventManagerFactory';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AndroidAdUnitApi } from 'Ads/Native/Android/__mocks__/AndroidAdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/__mocks__/AndroidVideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/__mocks__/iOSAdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/__mocks__/iOSVideoPlayer';
import { AdsPropertiesApi } from 'Ads/Native/__mocks__/AdsProperties';
import { ListenerApi } from 'Ads/Native/__mocks__/Listener';
import { PlacementApi } from 'Ads/Native/__mocks__/PlacementApi';
import { VideoPlayerApi } from 'Ads/Native/__mocks__/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/__mocks__/WebPlayer';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/__mocks__/InterstitialWebPlayerContainer';
import { Analytics } from 'Analytics/__mocks__/Analytics';
import { LoadApi } from 'Core/Native/__mocks__/LoadApi';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Store } from 'Store/__mocks__/Store';
import { LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';
export const Ads = jest.fn(() => {
    return {
        Api: {
            AdsProperties: new AdsPropertiesApi(),
            Listener: new ListenerApi(),
            Placement: new PlacementApi(),
            VideoPlayer: new VideoPlayerApi(),
            WebPlayer: new WebPlayerApi(),
            Android: {
                AdUnit: new AndroidAdUnitApi(),
                VideoPlayer: new AndroidVideoPlayerApi()
            },
            iOS: {
                AdUnit: new IosAdUnitApi(),
                VideoPlayer: new IosVideoPlayerApi()
            },
            LoadApi: new LoadApi()
        },
        AdMobSignalFactory: new AdMobSignalFactory(),
        InterstitialWebPlayerContainer: new InterstitialWebPlayerContainer(),
        SessionManager: new SessionManager(),
        MissedImpressionManager: new MissedImpressionManager(),
        ContentTypeHandlerManager: new ContentTypeHandlerManager(),
        Config: new AdsConfiguration(),
        Container: new AdUnitContainer(),
        PrivacyManager: new UserPrivacyManager(),
        PlacementManager: new PlacementManager(),
        AssetManager: new AssetManager(),
        CampaignManager: new CampaignManager(),
        RefreshManager: new RefreshManager(),
        ThirdPartyEventManagerFactory: new ThirdPartyEventManagerFactory(),
        Analytics: new Analytics(),
        Store: new Store(),
        PrivacySDK: new PrivacySDK(),
        LoadAndFillEventManager: new LoadAndFillEventManager()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9fX21vY2tzX18vQWRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDbkUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3pFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN2RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDdkUsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDckcsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDL0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDekUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDOUUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0saURBQWlELENBQUM7QUFDeEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQzVFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQ3RFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUM1RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDakUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUM5RCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSx3REFBd0QsQ0FBQztBQUN4RyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFJekYsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQzVCLE9BQWE7UUFDVCxHQUFHLEVBQUU7WUFDRCxhQUFhLEVBQUUsSUFBSSxnQkFBZ0IsRUFBRTtZQUNyQyxRQUFRLEVBQUUsSUFBSSxXQUFXLEVBQUU7WUFDM0IsU0FBUyxFQUFFLElBQUksWUFBWSxFQUFFO1lBQzdCLFdBQVcsRUFBRSxJQUFJLGNBQWMsRUFBRTtZQUNqQyxTQUFTLEVBQUUsSUFBSSxZQUFZLEVBQUU7WUFDN0IsT0FBTyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxJQUFJLGdCQUFnQixFQUFFO2dCQUM5QixXQUFXLEVBQUUsSUFBSSxxQkFBcUIsRUFBRTthQUMzQztZQUNELEdBQUcsRUFBRTtnQkFDRCxNQUFNLEVBQUUsSUFBSSxZQUFZLEVBQUU7Z0JBQzFCLFdBQVcsRUFBRSxJQUFJLGlCQUFpQixFQUFFO2FBQ3ZDO1lBQ0QsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFO1NBQ3pCO1FBQ0Qsa0JBQWtCLEVBQUUsSUFBSSxrQkFBa0IsRUFBRTtRQUM1Qyw4QkFBOEIsRUFBRSxJQUFJLDhCQUE4QixFQUFFO1FBQ3BFLGNBQWMsRUFBRSxJQUFJLGNBQWMsRUFBRTtRQUNwQyx1QkFBdUIsRUFBRSxJQUFJLHVCQUF1QixFQUFFO1FBQ3RELHlCQUF5QixFQUFFLElBQUkseUJBQXlCLEVBQUU7UUFDMUQsTUFBTSxFQUFFLElBQUksZ0JBQWdCLEVBQUU7UUFDOUIsU0FBUyxFQUFFLElBQUksZUFBZSxFQUFFO1FBQ2hDLGNBQWMsRUFBRSxJQUFJLGtCQUFrQixFQUFFO1FBQ3hDLGdCQUFnQixFQUFFLElBQUksZ0JBQWdCLEVBQUU7UUFDeEMsWUFBWSxFQUFFLElBQUksWUFBWSxFQUFFO1FBQ2hDLGVBQWUsRUFBRSxJQUFJLGVBQWUsRUFBRTtRQUN0QyxjQUFjLEVBQUUsSUFBSSxjQUFjLEVBQUU7UUFDcEMsNkJBQTZCLEVBQUUsSUFBSSw2QkFBNkIsRUFBRTtRQUNsRSxTQUFTLEVBQUUsSUFBSSxTQUFTLEVBQUU7UUFDMUIsS0FBSyxFQUFFLElBQUksS0FBSyxFQUFFO1FBQ2xCLFVBQVUsRUFBRSxJQUFJLFVBQVUsRUFBRTtRQUM1Qix1QkFBdUIsRUFBRSxJQUFJLHVCQUF1QixFQUFFO0tBQ3pELENBQUM7QUFDTixDQUFDLENBQUMsQ0FBQyJ9