import { BannerViewType } from 'Banners/Native/Banner';

/**
 * IBannerAdUnit defines the lifecycle for a BannerAdUnit.
 */
export interface IBannerAdUnit {
    /**
     * onLoad is called when the banner is requested to load or refresh. It is called once during
     * the banner's lifecycle.
     */
    onLoad(): Promise<void>;
    /**
     * onDestroy is called when the banner is requested to be destroyed or before the next banner is refreshed.
     * It is called once during the banner's lifecycle.
     */
    onDestroy(): Promise<void>;

    /**
     * onShow is called when the banner is attached to the window. It can be called multiple times during the
     * banners lifecycle.
     */
    onShow(): Promise<void>;

    /**
     * onHide is called when the banner is detached from the window. It can be called multiple times during the
     * banner's lifecycle.
     */
    onHide(): Promise<void>;

    /**
     * Returns a list of views that this banner will use.
     */
    getViews(): BannerViewType[];
}
