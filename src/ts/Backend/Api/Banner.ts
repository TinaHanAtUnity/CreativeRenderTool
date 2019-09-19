import { BackendApi } from 'Backend/BackendApi';
import { IBannerApi, BannerViewType, IBannerResizedEvent, Visibility } from 'Banners/Native/BannerApi';
import { Observable2, Observable1, Observable4 } from 'Core/Utilities/Observable';

export class BannerBackendApi extends BackendApi implements IBannerApi {

    public readonly onBannerResized = new Observable2<string, IBannerResizedEvent>();
    public readonly onBannerVisibilityChanged = new Observable2<string, Visibility>();
    public readonly onBannerAttached = new Observable1<string>();
    public readonly onBannerDetached = new Observable1<string>();
    public readonly onBannerLoaded = new Observable1<string>();
    public readonly onBannerDestroyed = new Observable1<string>();
    public readonly onBannerLoadPlacement = new Observable4<string, string, number, number>();
    public readonly onBannerDestroyBanner = new Observable1<string>();

    public setRefreshRate(placementId: string, refreshRate: number): Promise<void> {
        return Promise.resolve();
    }

    public load(bannerViewType: BannerViewType, width: number, height: number, bannerAdViewId: string): Promise<void> {
        this.onBannerLoaded.trigger(bannerAdViewId);
        return Promise.resolve();
    }

    public destroy(bannerAdViewId: string): Promise<void> {
        return Promise.resolve();
    }

}
