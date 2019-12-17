import { Placement } from 'Ads/Models/Placement';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { IBannerNativeApi, IBannerModule } from 'Banners/IBannerModule';
import { BannerCampaignManager, NoFillError } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { FocusManager } from 'Core/Managers/FocusManager';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerWebPlayerContainer } from 'Ads/Utilities/WebPlayer/BannerWebPlayerContainer';
import { BannerSizeUtil, IBannerDimensions } from 'Banners/Utilities/BannerSizeUtil';
import { ProgrammaticTrackingService, ProgrammaticTrackingError, BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { IObserver0, IObserver1 } from 'Core/Utilities/IObserver';
import { BannerViewType } from 'Banners/Native/BannerApi';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';

export enum BannerLoadState {
    Unloaded,
    Loading,
    Loaded
}

export const StandardBannerWidth = 320;
export const StandardBannerHeight = 50;

export class BannerAdContext {
    private readonly _bannerAdViewId: string;
    private readonly _placement: Placement;
    private readonly _size: IBannerDimensions;
    private _bannerNativeApi: IBannerNativeApi;
    private _adUnit: IBannerAdUnit;
    private _adUnitOnShowHasBeenCalled: boolean;
    private _campaign: BannerCampaign;
    private _deviceInfo: DeviceInfo;
    private _campaignManager: BannerCampaignManager;
    private _placementManager: BannerPlacementManager;
    private _adUnitParametersFactory: BannerAdUnitParametersFactory;
    private _bannerAdUnitFactory: BannerAdUnitFactory;
    private _focusManager: FocusManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    public _webPlayerContainer: WebPlayerContainer;
    private _clientInfo: ClientInfo;
    private _bannerAttached: boolean;

    private _loadState: BannerLoadState = BannerLoadState.Unloaded;

    private _onAppBackground: IObserver0;
    private _onAppForeground: IObserver0;
    private _onActivityPaused: IObserver1<string>;
    private _onActivityResumed: IObserver1<string>;

    private _onBannerOpened: IObserver1<string>;
    private _onBannerClosed: IObserver1<string>;
    private _onBannerDestroyed: IObserver1<string>;

    constructor(placement: Placement, bannerAdViewId: string, size: IBannerDimensions, banner: IBannerModule, ads: IAds, core: ICore) {
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
        this._programmaticTrackingService = core.ProgrammaticTrackingService;
        this._bannerAttached = false;
        this._adUnitOnShowHasBeenCalled = false;
        this.subscribeListeners();
    }

    public subscribeListeners() {
        this._onAppBackground = this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._onAppForeground = this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._onActivityPaused = this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
        this._onActivityResumed = this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));

        this._onBannerOpened = this._bannerNativeApi.BannerApi.onBannerAttached.subscribe((bannerAdViewId: string) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                this.onBannerAttached();
            }
        });
        this._onBannerClosed = this._bannerNativeApi.BannerApi.onBannerDetached.subscribe((bannerAdViewId: string) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                this.onBannerDetached();
            }
        });
        this._onBannerDestroyed = this._bannerNativeApi.BannerApi.onBannerDestroyed.subscribe((bannerAdViewId: string) => {
            if (bannerAdViewId === this._bannerAdViewId) {
                // We probably want to clean up some stuff.
                // TODO
            }
        });
    }

    public unsubscribeListeners() {
        this._focusManager.onAppBackground.unsubscribe(this._onAppBackground);
        this._focusManager.onAppForeground.unsubscribe(this._onAppForeground);
        this._focusManager.onActivityPaused.unsubscribe(this._onActivityPaused);
        this._focusManager.onActivityResumed.unsubscribe(this._onActivityResumed);

        this._bannerNativeApi.BannerApi.onBannerAttached.unsubscribe(this._onBannerOpened);
        this._bannerNativeApi.BannerApi.onBannerDetached.unsubscribe(this._onBannerClosed);
        this._bannerNativeApi.BannerApi.onBannerDestroyed.unsubscribe(this._onBannerDestroyed);
    }

    public load(): Promise<void> {
        this._programmaticTrackingService.reportMetricEventWithTags(BannerMetric.BannerAdLoad, [
            this._programmaticTrackingService.createAdsSdkTag('bls', BannerLoadState[this._loadState]) // banner load state
        ]);
        switch (this._loadState) {
            case BannerLoadState.Unloaded:
            case BannerLoadState.Loaded:
                return this.getCampaign();
            case BannerLoadState.Loading:
            default:
                // Do nothing while loading a separate banner
                return Promise.resolve();
        }
    }

    public getCampaign(): Promise<void> {
        this._loadState = BannerLoadState.Loading;
        this._programmaticTrackingService.reportMetricEvent(BannerMetric.BannerAdRequest);
        return this._campaignManager.request(this._placement, this._size).then((campaign) => {
                this._campaign = <BannerCampaign>campaign;
                this._programmaticTrackingService.reportMetricEvent(BannerMetric.BannerAdFill);
                return this.createAdUnit().then((adUnit) => {
                    return this.loadBanner().then(() => {
                        return adUnit.onLoad().then(() => {
                            this.setAdUnit(adUnit);
                            this.tryToShowAdUnit();
                        });
                    });
                }).then(() => {
                    this._loadState = BannerLoadState.Loaded;
                    this._programmaticTrackingService.reportMetricEvent(BannerMetric.BannerAdUnitLoaded);
                    return this._bannerNativeApi.BannerListenerApi.sendLoadEvent(this._bannerAdViewId);
                });
            }).catch((e) => {
                this._loadState = BannerLoadState.Unloaded;
                if (e instanceof NoFillError) {
                    this._programmaticTrackingService.reportMetricEvent(BannerMetric.BannerAdNoFill);
                    return this.onBannerNoFill();
                } else {
                    this._programmaticTrackingService.reportErrorEvent(ProgrammaticTrackingError.BannerRequestError, 'banner');
                    return this.sendBannerError(new Error(`Banner failed to load : ${e.message}`));
                }
            });
    }

    public destroy(): Promise<void> {
        if (this._adUnit) {
            return this._adUnit.onDestroy().then(() => {
                delete this._adUnit;
            });
        } else {
            return Promise.resolve();
        }
    }

    private onBannerAttached() {
        this._bannerAttached = true;
        this.tryToShowAdUnit();
    }

    private onBannerDetached() {
        this._bannerAttached = false;
        if (this._adUnit) {
            this._adUnit.onHide();
        }
    }

    private setAdUnit(adUnit: IBannerAdUnit) {
        this._adUnit = adUnit;
        this._adUnitOnShowHasBeenCalled = false;
    }

    private sendBannerError(e: Error): Promise<void> {
        return this._bannerNativeApi.BannerListenerApi.sendErrorEvent(this._bannerAdViewId, BannerErrorCode.WebViewError, e.message);
    }

    private onBannerNoFill(): Promise<void> {
        return this._bannerNativeApi.BannerListenerApi.sendErrorEvent(this._bannerAdViewId, BannerErrorCode.NoFillError, `Placement ${this._placement.getId()} failed to fill!`);
    }

    private tryToShowAdUnit() {
        if (this._adUnit && this._bannerAttached) {
            if (!this._adUnitOnShowHasBeenCalled) {
                this._adUnit.onShow();
                this._adUnitOnShowHasBeenCalled = true;
            }
        }
    }

    private onAppForeground() {
        // nothing
    }

    private onAppBackground() {
        // nothing
    }

    private onActivityResumed(activity: string) {
        // nothing
    }

    private onActivityPaused(activity: string) {
        // nothing
    }

    private createAdUnit() {
        return this._adUnitParametersFactory.create(this._bannerAdViewId, this._campaign, this._placement, this._webPlayerContainer)
            .then((parameters) => {
                return this._bannerAdUnitFactory.createAdUnit(parameters);
            });
    }

    private loadBanner(): Promise<void> {
        const bannerDimensions: IBannerDimensions = this._size;

        return new Promise<void>((resolve, reject) => {
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
