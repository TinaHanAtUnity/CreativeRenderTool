import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerApi } from 'Banners/Native/BannerApi';
import { BannerListenerApi } from 'Banners/Native/BannerListenerApi';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerAdContextManager } from 'Banners/Managers/BannerAdContextManager';
export class BannerModule {
    constructor(core, ads) {
        this.Api = {
            BannerApi: new BannerApi(core.NativeBridge),
            BannerListenerApi: new BannerListenerApi(core.NativeBridge)
        };
        this.PlacementManager = new BannerPlacementManager(ads.Api, ads.Config, this.Api);
        this.PlacementManager.sendBannersReady();
        this.AdUnitFactory = new BannerAdUnitFactory();
        this.CampaignManager = new BannerCampaignManager(core.NativeBridge.getPlatform(), core.Api, core.Config, ads.Config, ads.SessionManager, ads.AdMobSignalFactory, core.RequestManager, core.ClientInfo, core.DeviceInfo, core.MetaDataManager, ads.PrivacySDK, ads.PrivacyManager);
        this.AdUnitParametersFactory = new BannerAdUnitParametersFactory(this, ads, core);
        this.BannerAdContextManager = new BannerAdContextManager(core, ads, this);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyTW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvQmFubmVyTW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQzlGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQy9FLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUdyRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUMxRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUVqRixNQUFNLE9BQU8sWUFBWTtJQVNyQixZQUFZLElBQVcsRUFBRSxHQUFTO1FBQzlCLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFDUCxTQUFTLEVBQUUsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUMzQyxpQkFBaUIsRUFBRSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDOUQsQ0FBQztRQUVGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNsUixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUUsQ0FBQztDQUNKIn0=