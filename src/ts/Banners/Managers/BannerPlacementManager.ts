import { IAdsApi } from 'Ads/IAds';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { IBannerNativeApi } from 'Banners/IBannerModule';

interface IPlacementMap {
    [id: string]: Placement;
}

export class BannerPlacementManager {

    // 30s is the default banner refresh rate
    private static defaultRefreshRate: number = 30;

    private _bannerNativeApi: IBannerNativeApi;
    private _adsApi: IAdsApi;
    private _placements: IPlacementMap;

    constructor(adsApi: IAdsApi, configuration: AdsConfiguration, bannerNativeApi: IBannerNativeApi) {
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

    public sendBannersReady() {
        Object.keys(this._placements).forEach((placementId) => {
            this.setPlacementState(placementId, PlacementState.READY);
        });
    }

    public getPlacement(placementId: string): Placement | undefined {
        return this._placements[placementId];
    }

    public setPlacementState(placementId: string, newState: PlacementState) {
        const placement: Placement = this._placements[placementId];
        if (placement) {
            const oldState: PlacementState = placement.getState();

            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }

    private sendPlacementStateChange(placementId: string, oldState: PlacementState, newState: PlacementState) {
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

    private getPlacements(configuration: AdsConfiguration) {
        const placements = configuration.getPlacements();
        const banners: IPlacementMap = {};
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (placement.isBannerPlacement()) {
                banners[placementId] = placement;
            }
        });
        return banners;
    }
}
