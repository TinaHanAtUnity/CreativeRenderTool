import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/__mocks__/BannerAdUnitParametersFactory';
import { BannerCampaignManager } from 'Banners/Managers/__mocks__/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/__mocks__/BannerPlacementManager';
import { BannerAdUnitFactory } from 'Banners/AdUnits/__mocks__/BannerAdUnitFactory';
import { BannerAdContextManager } from 'Banners/Managers/__mocks__/BannerAdContextManager';
import { BannerApi } from 'Banners/Native/__mocks__/BannerApi';
import { BannerListenerApi } from 'Banners/Native/__mocks__/BannerListenerApi';
export const BannerModule = jest.fn(() => {
    return {
        Api: {
            BannerApi: BannerApi(),
            BannerListenerApi: BannerListenerApi()
        },
        AdUnitParametersFactory: BannerAdUnitParametersFactory(),
        CampaignManager: BannerCampaignManager(),
        PlacementManager: BannerPlacementManager(),
        AdUnitFactory: BannerAdUnitFactory(),
        BannerAdContextManager: BannerAdContextManager()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvX19tb2Nrc19fL0Jhbm5lck1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQXFDLDZCQUE2QixFQUFFLE1BQU0seURBQXlELENBQUM7QUFDM0ksT0FBTyxFQUE2QixxQkFBcUIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ3BILE9BQU8sRUFBOEIsc0JBQXNCLEVBQUUsTUFBTSxtREFBbUQsQ0FBQztBQUN2SCxPQUFPLEVBQTJCLG1CQUFtQixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDN0csT0FBTyxFQUE4QixzQkFBc0IsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBRXZILE9BQU8sRUFBRSxTQUFTLEVBQWlCLE1BQU0sb0NBQW9DLENBQUM7QUFDOUUsT0FBTyxFQUFFLGlCQUFpQixFQUF5QixNQUFNLDRDQUE0QyxDQUFDO0FBZ0J0RyxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDckMsT0FBeUI7UUFDckIsR0FBRyxFQUFFO1lBQ0QsU0FBUyxFQUFFLFNBQVMsRUFBRTtZQUN0QixpQkFBaUIsRUFBRSxpQkFBaUIsRUFBRTtTQUN6QztRQUNELHVCQUF1QixFQUFFLDZCQUE2QixFQUFFO1FBQ3hELGVBQWUsRUFBRSxxQkFBcUIsRUFBRTtRQUN4QyxnQkFBZ0IsRUFBRSxzQkFBc0IsRUFBRTtRQUMxQyxhQUFhLEVBQUUsbUJBQW1CLEVBQUU7UUFDcEMsc0JBQXNCLEVBQUUsc0JBQXNCLEVBQUU7S0FDbkQsQ0FBQztBQUNOLENBQUMsQ0FBQyxDQUFDIn0=