import { PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
export class BannerPlacementManager {
    constructor(adsApi, configuration, bannerNativeApi) {
        this._adsApi = adsApi;
        this._bannerNativeApi = bannerNativeApi;
        this._placements = this.getPlacements(configuration);
        configuration.removePlacements(Object.keys(this._placements));
        Object.keys(this._placements).forEach((placementId) => {
            const placement = this._placements[placementId];
            // 30s is the default banner refresh rate
            const maybeBannerRefreshRate = placement.getBannerRefreshRate();
            const refreshRate = maybeBannerRefreshRate ? maybeBannerRefreshRate : BannerPlacementManager.defaultRefreshRate;
            this._bannerNativeApi.BannerApi.setRefreshRate(placementId, refreshRate);
        });
    }
    sendBannersReady() {
        Object.keys(this._placements).forEach((placementId) => {
            this.setPlacementState(placementId, PlacementState.READY);
        });
    }
    getPlacement(placementId) {
        return this._placements[placementId];
    }
    setPlacementState(placementId, newState) {
        const placement = this._placements[placementId];
        if (placement) {
            const oldState = placement.getState();
            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }
    sendPlacementStateChange(placementId, oldState, newState) {
        if (oldState !== newState) {
            this._adsApi.Placement.setPlacementState(placementId, newState);
            this._adsApi.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[newState]);
            if (newState === PlacementState.READY) {
                this._adsApi.Listener.sendReadyEvent(placementId);
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
            }
        }
    }
    getPlacements(configuration) {
        const placements = configuration.getPlacements();
        const banners = {};
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (placement.isBannerPlacement()) {
                banners[placementId] = placement;
            }
        });
        return banners;
    }
}
// 30s is the default banner refresh rate
BannerPlacementManager.defaultRefreshRate = 30;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyUGxhY2VtZW50TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYW5uZXJzL01hbmFnZXJzL0Jhbm5lclBsYWNlbWVudE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFhLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQU9sRCxNQUFNLE9BQU8sc0JBQXNCO0lBUy9CLFlBQVksTUFBZSxFQUFFLGFBQStCLEVBQUUsZUFBaUM7UUFDM0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckQsYUFBYSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDOUQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDbEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNoRCx5Q0FBeUM7WUFDekMsTUFBTSxzQkFBc0IsR0FBRyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUNoRSxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLGtCQUFrQixDQUFDO1lBQ2hILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDbEQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sWUFBWSxDQUFDLFdBQW1CO1FBQ25DLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRU0saUJBQWlCLENBQUMsV0FBbUIsRUFBRSxRQUF3QjtRQUNsRSxNQUFNLFNBQVMsR0FBYyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzNELElBQUksU0FBUyxFQUFFO1lBQ1gsTUFBTSxRQUFRLEdBQW1CLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUV0RCxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQ2xFO0lBQ0wsQ0FBQztJQUVPLHdCQUF3QixDQUFDLFdBQW1CLEVBQUUsUUFBd0IsRUFBRSxRQUF3QjtRQUNwRyxJQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLDhCQUE4QixDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFFdEgsSUFBSSxRQUFRLEtBQUssY0FBYyxDQUFDLEtBQUssRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUNsRCxRQUFRLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzdDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDeEM7U0FDSjtJQUNMLENBQUM7SUFFTyxhQUFhLENBQUMsYUFBK0I7UUFDakQsTUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ2pELE1BQU0sT0FBTyxHQUFrQixFQUFFLENBQUM7UUFDbEMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUM1QyxNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDMUMsSUFBSSxTQUFTLENBQUMsaUJBQWlCLEVBQUUsRUFBRTtnQkFDL0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFNBQVMsQ0FBQzthQUNwQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQzs7QUFoRUQseUNBQXlDO0FBQzFCLHlDQUFrQixHQUFXLEVBQUUsQ0FBQyJ9