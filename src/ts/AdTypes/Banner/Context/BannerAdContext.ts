import { BannerAdUnitFactory } from 'AdTypes/Banner/AdUnits/BannerAdUnitFactory';
import { BannerCampaignManager } from 'AdTypes/Banner/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'AdTypes/Banner/Managers/BannerPlacementManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { AdUnitActivities, FocusManager } from 'Managers/FocusManager';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { BannerAdUnitParametersFactory } from 'AdTypes/Banner/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdUnit } from '../AdUnits/BannerAdUnit';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';

const StandardRefreshDelay = 30;

export enum BannerLoadState {
    Unloaded,
    Loading,
    Loaded
}

export const StandardBannerWidth = 320;
export const StandardBannerHeight = 50;

export class BannerAdContext {
    private _nativeBridge: NativeBridge;
    private _adUnit: BannerAdUnit;
    private _placement: Placement;
    private _campaign: Campaign;
    private _deviceInfo: DeviceInfo;
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

    constructor(nativeBridge: NativeBridge, adUnitParametersFactory: BannerAdUnitParametersFactory, campaignManager: BannerCampaignManager, placementManager: BannerPlacementManager, focusManager: FocusManager, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._campaignManager = campaignManager;
        this._focusManager = focusManager;
        this._placementManager = placementManager;
        this._adUnitParametersFactory = adUnitParametersFactory;
        this._deviceInfo = deviceInfo;

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
            this._placementManager.sendBannersWaiting();
            this.setState(BannerLoadState.Loading);
            return this.loadBannerAdUnit().catch((e) => {
                this._placementManager.sendBannersReady();
                throw e;
            });
        }
    }

    public hide() {
        window.clearTimeout(this._refreshTimeoutID);
        this.setState(BannerLoadState.Unloaded);
        this._placementManager.sendBannersReady();
        if (this._adUnit) {
            return this._adUnit.destroy().then(() => {
                delete this._adUnit;
                return this._nativeBridge.Banner.destroy();
            });
        }
        return Promise.resolve();
    }

    private loadBannerAdUnit() {
        return this._campaignManager.request(this._placement).then((campaign) => {
                this._campaign = campaign;
                return this.createAdUnit().then((adUnit) => {
                    this._showTimestamp = Date.now();
                    if (this._adUnit) {
                        this._adUnit.destroy();
                    }
                    this._adUnit = adUnit;
                    return this.loadBanner().then(() => this._adUnit.load());
                }).then(() => {
                    if (this.isState(BannerLoadState.Loading)) {
                        this.setState(BannerLoadState.Loaded);
                        return this._nativeBridge.BannerListener.sendLoadEvent(this._placement.getId());
                    }
                    return Promise.resolve();
                }).then(() => {
                    if (this._isShowing) {
                        return this._adUnit.show();
                    }
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
                this.loadBannerAdUnit();
            } else {
                if (this._adUnit) {
                    this._adUnit.show();
                }
                this.setUpBannerRefresh();
            }
        }
    }

    private onBannerHide() {
        this._isShowing = false;
        this._hideTimestamp = Date.now();
        window.clearTimeout(this._refreshTimeoutID);
        if (this._adUnit) {
            this._adUnit.hide();
        }
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
            this.loadBannerAdUnit()
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

    private loadBanner(): Promise<void> {
        if (this.isState(BannerLoadState.Loaded)) {
            return this._nativeBridge.Banner.setViews(this._adUnit.getViews());
        } else {
            return new Promise<void>((resolve, reject) => {
                this.getBannerSize().then(([width, height]) => {
                    const observer = this._nativeBridge.Banner.onBannerLoaded.subscribe(() => {
                        this._nativeBridge.Banner.onBannerLoaded.unsubscribe(observer);
                        resolve();
                    });
                    this._nativeBridge.Banner.load(this._adUnit.getViews(), this._placement.getBannerStyle() || 'bottomcenter', width, height).catch(reject);
                });
            });
        }
    }

    private getBannerSize(): Promise<[number, number]> {
        let width = StandardBannerWidth;
        let height = StandardBannerHeight;
        if (this._deviceInfo instanceof AndroidDeviceInfo) {
            const density = this._deviceInfo.getScreenDensity();
            width = Math.floor(width * (density / 160.0));
            height = Math.floor(height * (density / 160.0));
        } else if (this._deviceInfo instanceof IosDeviceInfo) {
            width = Math.floor(StandardBannerWidth);
            height = Math.floor(StandardBannerHeight);
        }
        const dimensions: [number, number] = [width, height];
        return Promise.resolve(dimensions);
    }
}
