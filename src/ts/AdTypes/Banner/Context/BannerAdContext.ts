import { BannerAdUnitFactory } from 'AdTypes/Banner/AdUnits/BannerAdUnitFactory';
import { BannerCampaignManager } from 'AdTypes/Banner/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'AdTypes/Banner/Managers/BannerPlacementManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitActivities, FocusManager } from 'Managers/FocusManager';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { BannerAdUnitParametersFactory } from 'AdTypes/Banner/AdUnits/BannerAdUnitParametersFactory';

const StandardRefreshDelay = 30;

export enum BannerLoadState {
    Unloaded,
    Loading,
    Loaded
}

export class BannerAdContext {
    private _nativeBridge: NativeBridge;
    private _adUnit: AbstractAdUnit;
    private _placement: Placement;
    private _campaign: Campaign;
    private _campaignManager: BannerCampaignManager;
    private _placementManager: BannerPlacementManager;
    private _adUnitParametersFactory: BannerAdUnitParametersFactory;
    private _focusManager: FocusManager;

    private _state = BannerLoadState.Unloaded;
    private _isShowing = false;
    private _shouldRefresh = true;
    private _refreshTimeoutID = 0;
    private _hideTimestamp: number;
    private _showTimestamp: number;

    constructor(nativeBridge: NativeBridge, adUnitParametersFactory: BannerAdUnitParametersFactory, campaignManager: BannerCampaignManager, placementManager: BannerPlacementManager, focusManager: FocusManager) {
        this._nativeBridge = nativeBridge;
        this._campaignManager = campaignManager;
        this._focusManager = focusManager;
        this._placementManager = placementManager;
        this._adUnitParametersFactory = adUnitParametersFactory;

        this._focusManager.onAppBackground.subscribe(() => this.onAppBackground());
        this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        this._focusManager.onActivityPaused.subscribe((activity) => this.onActivityPaused(activity));
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));

        this._nativeBridge.Banner.onBannerOpened.subscribe(() => {
            this._nativeBridge.BannerListener.sendShowEvent(this._placement.getId());
            this.onBannerShow();
        });
        this._nativeBridge.Banner.onBannerClosed.subscribe(() => {
            this._nativeBridge.BannerListener.sendHideEvent(this._placement.getId());
            this.onBannerHide();
        });
        this._nativeBridge.Banner.onBannerDestroyed.subscribe(() => {
            this._nativeBridge.BannerListener.sendUnloadEvent(this._placement.getId());
        });
    }

    public disableRefresh() {
        this._shouldRefresh = false;
    }

    public load(placementId: string): Promise<void> {
        if (this.isState(BannerLoadState.Loaded)) {
            return this._nativeBridge.BannerListener.sendLoadEvent(placementId);
        } else if (this.isState(BannerLoadState.Loading)) {
            return Promise.resolve();
        } else {
            const placement = this._placementManager.getPlacement(placementId);
            if (!(placement && placement.isBannerPlacement())) {
                return this.sendBannerError(new Error(`Placement ${placementId} is not a banner placement`));
            }
            this._placement = placement;
            this._placementManager.setActivePlacementId(placement.getId());
            this.setState(BannerLoadState.Loading);
            return this.loadBanner();
        }
    }

    public hide() {
        window.clearTimeout(this._refreshTimeoutID);
        this.setState(BannerLoadState.Unloaded);
        if (this._adUnit) {
            return this._adUnit.hide().then(() => {
                delete this._adUnit;
                return this._nativeBridge.Banner.destroy();
            });
        }
        return Promise.resolve();
    }

    private loadBanner() {
        return this._campaignManager.request(this._placement).then((campaign) => {
                this._campaign = campaign;
                return this.createAdUnit().then((adUnit) => {
                    this._showTimestamp = Date.now();
                    if (this._adUnit) {
                        this._adUnit.hide();
                    }
                    this._adUnit = adUnit;
                    return this._adUnit.show();
                }).then(() => {
                    if (this.isState(BannerLoadState.Loading)) {
                        this.setState(BannerLoadState.Loaded);
                        return this._nativeBridge.BannerListener.sendLoadEvent(this._placement.getId());
                    }
                    return Promise.resolve();
                });
            }).catch((e) => {
                this.setState(BannerLoadState.Unloaded);
                return this.handleBannerRequestError(e);
            });
    }

    private handleBannerRequestError(e: Error) {
        return Promise.reject(e);
    }

    private sendBannerError(e: Error) {
        this._nativeBridge.BannerListener.sendErrorEvent(e.message);
        return Promise.reject(e);
    }

    private onBannerShow() {
        if (this.isState(BannerLoadState.Loaded)) {
            this._isShowing = true;
            this._showTimestamp = Date.now();
            if (this._campaign.isExpired()) {
                this.loadBanner();
            } else {
                this.setUpBannerRefresh();
            }
        }
    }

    private onBannerHide() {
        this._isShowing = false;
        this._hideTimestamp = Date.now();
        window.clearTimeout(this._refreshTimeoutID);
    }

    private setUpBannerRefresh(delay?: number) {
        window.clearTimeout(this._refreshTimeoutID);
        if (this._shouldRefresh) {
            this._refreshTimeoutID = window.setTimeout(() => this.onRefreshBanner(), delay || this.getBannerRefreshDelay());
        }
    }

    private onRefreshBanner() {
        if (!this._isShowing) {
            this.setUpBannerRefresh();
        } else {
            this.loadBanner()
                .then(() => this.setUpBannerRefresh());
        }
    }

    private getBannerRefreshDelay(): number {
        return (this._placement.getRefreshDelay() || StandardRefreshDelay) * 1000;
    }

    private onAppForeground() {
        this._isShowing = false;
    }

    private onAppBackground() {
        this._isShowing = true;
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
        return this._adUnitParametersFactory.create(this._campaign, this._placement, {})
            .then((parameters) => {
                return BannerAdUnitFactory.createAdUnit(this._nativeBridge, parameters);
            });
    }

    private isState(state: BannerLoadState) {
        return this._state === state;
    }
    private setState(state: BannerLoadState) {
        this._state = state;
    }
}

export class BannerNoFillError extends Error {
    constructor(message: string) {
        super(message);
    }
}
