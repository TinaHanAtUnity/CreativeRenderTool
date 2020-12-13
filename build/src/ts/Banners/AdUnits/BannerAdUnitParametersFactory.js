import { ThirdPartyEventMacro } from 'Ads/Managers/ThirdPartyEventManager';
export class BannerAdUnitParametersFactory {
    constructor(bannerModule, ads, core) {
        this._platform = core.NativeBridge.getPlatform();
        this._core = core.Api;
        this._clientInfo = core.ClientInfo;
        this._thirdPartyEventManagerFactory = ads.ThirdPartyEventManagerFactory;
        this._bannerNativeApi = bannerModule.Api;
    }
    create(bannerAdViewId, campaign, placement, webPlayerContainer) {
        return Promise.resolve({
            platform: this._platform,
            core: this._core,
            campaign: campaign,
            clientInfo: this._clientInfo,
            thirdPartyEventManager: this._thirdPartyEventManagerFactory.create({
                [ThirdPartyEventMacro.ZONE]: placement.getId(),
                [ThirdPartyEventMacro.SDK_VERSION]: this._clientInfo.getSdkVersion().toString()
            }),
            webPlayerContainer: webPlayerContainer,
            bannerNativeApi: this._bannerNativeApi,
            placementId: placement.getId(),
            bannerAdViewId: bannerAdViewId
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRVbml0UGFyYW1ldGVyc0ZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9BZFVuaXRzL0Jhbm5lckFkVW5pdFBhcmFtZXRlcnNGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBWTNFLE1BQU0sT0FBTyw2QkFBNkI7SUFRdEMsWUFBWSxZQUEyQixFQUFFLEdBQVMsRUFBRSxJQUFXO1FBQzNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDdEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxHQUFHLENBQUMsNkJBQTZCLENBQUM7UUFDeEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUM7SUFDN0MsQ0FBQztJQUVNLE1BQU0sQ0FBQyxjQUFzQixFQUFFLFFBQXdCLEVBQUUsU0FBb0IsRUFBRSxrQkFBc0M7UUFDeEgsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ25CLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDaEIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO1lBQzVCLHNCQUFzQixFQUFFLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxNQUFNLENBQUM7Z0JBQy9ELENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLEtBQUssRUFBRTtnQkFDOUMsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsRUFBRTthQUNsRixDQUFDO1lBQ0Ysa0JBQWtCLEVBQUUsa0JBQWtCO1lBQ3RDLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCO1lBQ3RDLFdBQVcsRUFBRSxTQUFTLENBQUMsS0FBSyxFQUFFO1lBQzlCLGNBQWMsRUFBRSxjQUFjO1NBQ2pDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSiJ9