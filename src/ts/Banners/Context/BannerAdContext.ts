import { Placement } from 'Ads/Models/Placement';
import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { IBannersApi, IBanners } from 'Banners/IBanners';
import { BannerCampaignManager, NoFillError } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { AdUnitActivities, FocusManager } from 'Core/Managers/FocusManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { IAds } from 'Ads/IAds';
import { ICore } from 'Core/ICore';
import { ProgrammaticTrackingService, ProgrammaticTrackingError, BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ClientInfo } from 'Core/Models/ClientInfo';

const StandardRefreshDelay = 30;

export enum BannerLoadState {
    Unloaded,
    Loading,
    Loaded
}

export const StandardBannerWidth = 320;
export const StandardBannerHeight = 50;

export class BannerAdContext {
    private _banner: IBannersApi;
    private _adUnit: IBannerAdUnit;
    private _placement: Placement;
    private _campaign: BannerCampaign;
    private _deviceInfo: DeviceInfo;
    private _campaignManager: BannerCampaignManager;
    private _placementManager: BannerPlacementManager;
    private _adUnitParametersFactory: BannerAdUnitParametersFactory;
    private _bannerAdUnitFactory: BannerAdUnitFactory;
    private _focusManager: FocusManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _clientInfo: ClientInfo;

    private _state = BannerLoadState.Unloaded;
    private _isShowing = false;
    private _shouldRefresh = true;
    private _refreshTimeoutID = 0;

    constructor(banner: IBanners, ads: IAds, core: ICore) {
        this._banner = banner.Api;
        this._focusManager = core.FocusManager;
        this._campaignManager = banner.CampaignManager;
        this._placementManager = banner.PlacementManager;
        this._bannerAdUnitFactory = banner.AdUnitFactory;
        this._adUnitParametersFactory = banner.AdUnitParametersFactory;
        this._deviceInfo = core.DeviceInfo;
        this._clientInfo = core.ClientInfo;
        this._programmaticTrackingService = core.ProgrammaticTrackingService;

        this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));

        this._banner.Banner.onBannerOpened.subscribe(() => {
            this._banner.Listener.sendShowEvent(this._placement.getId());
            this.onBannerShow();
        });
        this._banner.Banner.onBannerClosed.subscribe(() => {
            this._banner.Listener.sendHideEvent(this._placement.getId());
            this.onBannerHide();
        });
        this._banner.Banner.onBannerDestroyed.subscribe(() => {
            this._banner.Listener.sendUnloadEvent(this._placement.getId());
        });
    }

    public disableRefresh() {
        this._shouldRefresh = false;
    }

    public load(placementId: string): Promise<void> {
        if (this.isState(BannerLoadState.Loaded)) {
            return this._banner.Listener.sendLoadEvent(placementId);
        } else if (this.isState(BannerLoadState.Loading)) {
            return Promise.resolve();
        } else {
            const placement = this._placementManager.getPlacement(placementId);
            if (!(placement && placement.isBannerPlacement())) {
                return this.sendBannerError(new Error(`Placement ${placementId} is not a banner placement`));
            }
            this._placement = placement;
            this.setState(BannerLoadState.Loading);
            return this.loadBannerAdUnit().catch((e) => {
                if (e instanceof NoFillError) {
                    this.sendBannerError(new Error(`Banner placement ${placementId} returned no fill`));
                    if (CustomFeatures.shouldDisableBannerRefresh(this._clientInfo.getGameId())) {
                        // Do not refresh
                    } else {
                        this.setUpBannerRefresh();
                    }
                }
                throw e;
            });
        }
    }

    public hide() {
        window.clearTimeout(this._refreshTimeoutID);
        this.setState(BannerLoadState.Unloaded);
        this._placementManager.sendBannersReady();
        if (this._adUnit) {
            return this._adUnit.onDestroy().then(() => {
                delete this._adUnit;
                return this._banner.Banner.destroy();
            });
        }
        return Promise.resolve();
    }

    private loadBannerAdUnit(): Promise<void> {
        this._programmaticTrackingService.reportMetric(BannerMetric.BannerAdRequest);
        return this._campaignManager.request(this._placement).then((campaign) => {
                this._campaign = <BannerCampaign>campaign;
                return this.createAdUnit().then((adUnit) => {
                    if (this._adUnit) {
                        this._adUnit.onDestroy();
                    }
                    this._adUnit = adUnit;
                    return this.loadBanner().then(() => this._adUnit.onLoad());
                }).then(() => {
                    if (this.isState(BannerLoadState.Loading)) {
                        this.setState(BannerLoadState.Loaded);
                        return this._banner.Listener.sendLoadEvent(this._placement.getId());
                    }
                    return Promise.resolve();
                }).then(() => {
                    if (this._isShowing) {
                        return this._adUnit.onShow();
                    }
                });
            }).catch((e) => {
                return this.handleBannerRequestError(e);
            });
    }

    private handleBannerRequestError(e: Error): Promise<void> {
        this._programmaticTrackingService.reportError(ProgrammaticTrackingError.BannerRequestError, 'banner');
        return Promise.reject(e);
    }

    private sendBannerError(e: Error): Promise<void> {
        this._banner.Listener.sendErrorEvent(e.message);
        return Promise.reject(e);
    }

    private onBannerShow() {
        if (this.isState(BannerLoadState.Loaded)) {
            this._isShowing = true;
            if (this._campaign.isExpired()) {
                this.loadBannerAdUnit();
            } else {
                if (this._adUnit) {
                    this._adUnit.onShow();
                }
                if (CustomFeatures.shouldDisableBannerRefresh(this._clientInfo.getGameId())) {
                    // Do not refresh
                } else {
                    this.setUpBannerRefresh();
                }
            }
        }
    }

    private onBannerHide() {
        this._isShowing = false;
        window.clearTimeout(this._refreshTimeoutID);
        if (this._adUnit) {
            this._adUnit.onHide();
        }
    }

    private setUpBannerRefresh(delay?: number) {
        window.clearTimeout(this._refreshTimeoutID);
        if (this._shouldRefresh) {
            this._refreshTimeoutID = window.setTimeout(() => this.onRefreshBanner(), delay || this.getBannerRefreshDelay());
        }
    }

    private onRefreshBanner() {
        if (!this._isShowing && this.isState(BannerLoadState.Loaded)) {
            this.setUpBannerRefresh();
        } else {
            this.loadBannerAdUnit()
                .then(() => this.setUpBannerRefresh())
                .catch(() => this.setUpBannerRefresh());
        }
    }

    private getBannerRefreshDelay(): number {
        return (this._placement.getBannerRefreshRate() || StandardRefreshDelay) * 1000;
    }

    private onAppForeground() {
        if (this.isState(BannerLoadState.Loaded)) {
            if (CustomFeatures.shouldDisableBannerRefresh(this._clientInfo.getGameId())) {
                // Do not refresh
            } else {
                this.setUpBannerRefresh();
            }
        }
    }

    private onAppBackground() {
        window.clearTimeout(this._refreshTimeoutID);
    }

    private onActivityResumed(activity: string) {
        if (AdUnitActivities.indexOf(activity) === -1) {
            this.onAppForeground();
        }
    }

    private onActivityPaused(activity: string) {
        if (AdUnitActivities.indexOf(activity) === -1) {
            this.onAppBackground();
        }
    }

    private createAdUnit() {
        return this._adUnitParametersFactory.create(this._campaign, this._placement)
            .then((parameters) => {
                return this._bannerAdUnitFactory.createAdUnit(parameters);
            });
    }

    private isState(state: BannerLoadState) {
        return this._state === state;
    }
    private setState(state: BannerLoadState) {
        this._state = state;
    }

    private loadBanner(): Promise<void> {
        const sizePromise = this.getBannerSize();
        if (this.isState(BannerLoadState.Loaded)) {
            return sizePromise.then(([width, height]) => {
                return this._banner.Banner.setBannerFrame(
                    this._placement.getBannerStyle() || 'bottomcenter',
                    width,
                    height
                ).then(() => this._banner.Banner.setViews(this._adUnit.getViews()));
            });
        } else {
            return new Promise<void>((resolve, reject) => {
                sizePromise.then(([width, height]) => {
                    const observer = this._banner.Banner.onBannerLoaded.subscribe(() => {
                        this._banner.Banner.onBannerLoaded.unsubscribe(observer);
                        resolve();
                    });
                    this._banner.Banner.load(this._adUnit.getViews(), this._placement.getBannerStyle() || 'bottomcenter', width, height).catch(reject);
                });
            });
        }
    }

    private getBannerSize(): Promise<[number, number]> {
        let width = this._campaign ? this._campaign.getWidth() : StandardBannerWidth;
        let height = this._campaign ? this._campaign.getHeight() : StandardBannerHeight;
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            const density = this._deviceInfo.getScreenDensity();
            width = Math.floor(width * (density / 160));
            height = Math.floor(height * (density / 160));
        } else if (this._deviceInfo instanceof IosDeviceInfo) {
            width = Math.floor(StandardBannerWidth);
            height = Math.floor(StandardBannerHeight);
        }
        const dimensions: [number, number] = [width, height];
        return Promise.resolve(dimensions);
    }
}
