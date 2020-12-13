import { NoFillError } from 'Banners/Managers/BannerCampaignManager';
import { BannerWebPlayerContainer } from 'Ads/Utilities/WebPlayer/BannerWebPlayerContainer';
import { SDKMetrics, ErrorMetric, BannerMetric } from 'Ads/Utilities/SDKMetrics';
import { BannerViewType } from 'Banners/Native/BannerApi';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';
export var BannerLoadState;
(function (BannerLoadState) {
    BannerLoadState[BannerLoadState["Unloaded"] = 0] = "Unloaded";
    BannerLoadState[BannerLoadState["Loading"] = 1] = "Loading";
    BannerLoadState[BannerLoadState["Loaded"] = 2] = "Loaded";
})(BannerLoadState || (BannerLoadState = {}));
export const StandardBannerWidth = 320;
export const StandardBannerHeight = 50;
export class BannerAdContext {
    constructor(placement, bannerAdViewId, size, banner, ads, core) {
        this._loadState = BannerLoadState.Unloaded;
        this._placement = placement;
        this._bannerAdViewId = bannerAdViewId;
        this._size = size;
        this._bannerNativeApi = banner.Api;
        this._focusManager = core.FocusManager;
        this._campaignManager = banner.CampaignManager;
        this._placementManager = banner.PlacementManager;
        this._bannerAdUnitFactory = banner.AdUnitFactory;
        this._adUnitParametersFactory = banner.AdUnitParametersFactory;
        this._deviceInfo = core.DeviceInfo;
        this._webPlayerContainer = new BannerWebPlayerContainer(core.NativeBridge.getPlatform(), ads.Api, bannerAdViewId);
        this._clientInfo = core.ClientInfo;
        this._bannerAttached = false;
        this._adUnitOnShowHasBeenCalled = false;
        this.subscribeListeners();
    }
    subscribeListeners() {
        this._onAppBackground = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._onAppForeground = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._onActivityPaused = this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
        this._onActivityResumed = this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        this._onBannerOpened = this._bannerNativeApi.BannerApi.onBannerAttached.subscribe((bannerAdViewId) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                this.onBannerAttached();
            }
        });
        this._onBannerClosed = this._bannerNativeApi.BannerApi.onBannerDetached.subscribe((bannerAdViewId) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                this.onBannerDetached();
            }
        });
        this._onBannerDestroyed = this._bannerNativeApi.BannerApi.onBannerDestroyed.subscribe((bannerAdViewId) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                // We probably want to clean up some stuff.
                // TODO
            }
        });
    }
    unsubscribeListeners() {
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackground);
        this._focusManager.onAppForeground.unsubscribe(this._onAppForeground);
        this._focusManager.onActivityPaused.unsubscribe(this._onActivityPaused);
        this._focusManager.onActivityResumed.unsubscribe(this._onActivityResumed);
        this._bannerNativeApi.BannerApi.onBannerAttached.unsubscribe(this._onBannerOpened);
        this._bannerNativeApi.BannerApi.onBannerDetached.unsubscribe(this._onBannerClosed);
        this._bannerNativeApi.BannerApi.onBannerDestroyed.unsubscribe(this._onBannerDestroyed);
    }
    load() {
        SDKMetrics.reportMetricEventWithTags(BannerMetric.BannerAdLoad, {
            'bls': BannerLoadState[this._loadState]
        });
        switch (this._loadState) {
            case BannerLoadState.Unloaded:
            case BannerLoadState.Loaded:
                return this.getCampaign().then(() => {
                    // Flush batched messages
                    SDKMetrics.sendBatchedEvents();
                });
            case BannerLoadState.Loading:
            default:
                // Do nothing while loading a separate banner
                return Promise.resolve();
        }
    }
    getCampaign() {
        this._loadState = BannerLoadState.Loading;
        SDKMetrics.reportMetricEvent(BannerMetric.BannerAdRequest);
        return this._campaignManager.request(this._placement, this._size).then((campaign) => {
            this._campaign = campaign;
            SDKMetrics.reportMetricEvent(BannerMetric.BannerAdFill);
            return this.createAdUnit().then((adUnit) => {
                return this.loadBanner().then(() => {
                    return adUnit.onLoad().then(() => {
                        this.setAdUnit(adUnit);
                        this.tryToShowAdUnit();
                    });
                });
            }).then(() => {
                this._loadState = BannerLoadState.Loaded;
                SDKMetrics.reportMetricEvent(BannerMetric.BannerAdUnitLoaded);
                return this._bannerNativeApi.BannerListenerApi.sendLoadEvent(this._bannerAdViewId);
            });
        }).catch((e) => {
            this._loadState = BannerLoadState.Unloaded;
            if (e instanceof NoFillError) {
                SDKMetrics.reportMetricEvent(BannerMetric.BannerAdNoFill);
                return this.onBannerNoFill();
            }
            else {
                SDKMetrics.reportMetricEvent(ErrorMetric.BannerRequestError);
                return this.sendBannerError(new Error(`Banner failed to load : ${e.message}`));
            }
        });
    }
    destroy() {
        if (this._adUnit) {
            return this._adUnit.onDestroy().then(() => {
                delete this._adUnit;
            });
        }
        else {
            return Promise.resolve();
        }
    }
    onBannerAttached() {
        this._bannerAttached = true;
        this.tryToShowAdUnit();
    }
    onBannerDetached() {
        this._bannerAttached = false;
        if (this._adUnit) {
            this._adUnit.onHide();
        }
    }
    setAdUnit(adUnit) {
        this._adUnit = adUnit;
        this._adUnitOnShowHasBeenCalled = false;
    }
    sendBannerError(e) {
        return this._bannerNativeApi.BannerListenerApi.sendErrorEvent(this._bannerAdViewId, BannerErrorCode.WebViewError, e.message);
    }
    onBannerNoFill() {
        return this._bannerNativeApi.BannerListenerApi.sendErrorEvent(this._bannerAdViewId, BannerErrorCode.NoFillError, `Placement ${this._placement.getId()} failed to fill!`);
    }
    tryToShowAdUnit() {
        if (this._adUnit && this._bannerAttached) {
            if (!this._adUnitOnShowHasBeenCalled) {
                this._adUnit.onShow();
                this._adUnitOnShowHasBeenCalled = true;
            }
        }
    }
    onAppForeground() {
        // nothing
    }
    onAppBackground() {
        // nothing
    }
    onActivityResumed(activity) {
        // nothing
    }
    onActivityPaused(activity) {
        // nothing
    }
    createAdUnit() {
        return this._adUnitParametersFactory.create(this._bannerAdViewId, this._campaign, this._placement, this._webPlayerContainer)
            .then((parameters) => {
            return this._bannerAdUnitFactory.createAdUnit(parameters);
        });
    }
    loadBanner() {
        const bannerDimensions = this._size;
        return new Promise((resolve, reject) => {
            const observer = this._bannerNativeApi.BannerApi.onBannerLoaded.subscribe(() => {
                this._bannerNativeApi.BannerApi.onBannerLoaded.unsubscribe(observer);
                resolve();
            });
            this._bannerNativeApi.BannerApi.load(BannerViewType.WEB_PLAYER, bannerDimensions.w, bannerDimensions.h, this._bannerAdViewId).catch(() => {
                reject();
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRDb250ZXh0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvQ29udGV4dC9CYW5uZXJBZENvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUF5QixXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQVM1RixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUU1RixPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUdqRixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRWpFLE1BQU0sQ0FBTixJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDdkIsNkRBQVEsQ0FBQTtJQUNSLDJEQUFPLENBQUE7SUFDUCx5REFBTSxDQUFBO0FBQ1YsQ0FBQyxFQUpXLGVBQWUsS0FBZixlQUFlLFFBSTFCO0FBRUQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsR0FBRyxDQUFDO0FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUV2QyxNQUFNLE9BQU8sZUFBZTtJQTZCeEIsWUFBWSxTQUFvQixFQUFFLGNBQXNCLEVBQUUsSUFBdUIsRUFBRSxNQUFxQixFQUFFLEdBQVMsRUFBRSxJQUFXO1FBWHhILGVBQVUsR0FBb0IsZUFBZSxDQUFDLFFBQVEsQ0FBQztRQVkzRCxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM1QixJQUFJLENBQUMsZUFBZSxHQUFHLGNBQWMsQ0FBQztRQUN0QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNuQyxJQUFJLENBQUMs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