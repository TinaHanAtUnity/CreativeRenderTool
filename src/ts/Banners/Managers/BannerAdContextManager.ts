
import { Placement } from 'Ads/Models/Placement';
import { ICore } from 'Core/ICore';
import { IBannerModule } from 'Banners/IBannerModule';
import { IAds } from 'Ads/IAds';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerSizeUtil, IBannerDimensions } from 'Banners/Utilities/BannerSizeUtil';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';

interface IBannerContextMap {
    [placementId: string]: BannerAdContext;
}

/**
 * Manages BannerAdContext for placements filled with
 * banner ads.
 */
export class BannerAdContextManager {
    private _contexts: IBannerContextMap = {};

    private _core: ICore;
    private _ads: IAds;
    private _bannerModule: IBannerModule;

    constructor(core: ICore, ads: IAds, banner: IBannerModule) {
        this._bannerModule = banner;
        this._core = core;
        this._ads = ads;
        this.setupObservables();
    }

    public removeContext(bannerAdViewId: string) {
        delete this._contexts[bannerAdViewId];
    }

    public getContext(bannerAdViewId: string): BannerAdContext | undefined {
        return this._contexts[bannerAdViewId];
    }

    public createContext(placement: Placement, bannerAdViewId: string, size: IBannerDimensions) {
        if (placement.isBannerPlacement()) {
            const newContext = new BannerAdContext(placement, bannerAdViewId, size, this._bannerModule, this._ads, this._core);
            this._contexts[bannerAdViewId] = newContext;
            return newContext;
        } else {
            throw new Error(`Placement ${placement.getId()} is not a banner placement`);
        }
    }

    private setupObservables() {
        this._bannerModule.Api.BannerApi.onBannerDestroyBanner.subscribe((bannerAdViewId: string) => {
            const context = this.getContext(bannerAdViewId);
            if (context) {
                context.destroy().then(() => {
                    context.unsubscribeListeners();
                    this.removeContext(bannerAdViewId);
                }).catch(() => {
                    context.unsubscribeListeners();
                    this.removeContext(bannerAdViewId);
                });
            } else {
                this.removeContext(bannerAdViewId);
            }
        });
        this._bannerModule.Api.BannerApi.onBannerLoadPlacement.subscribe((placementId: string, bannerAdViewId: string, width: number, height: number) => {
            const placement = this._bannerModule.PlacementManager.getPlacement(placementId);
            if (placement) {
                try {
                    const context = this.createContext(placement, bannerAdViewId, BannerSizeUtil.getBannerSizeFromWidthAndHeight(width, height, this._core.Api.Sdk));
                    context.load();
                } catch (error) {
                    return this._bannerModule.Api.BannerListenerApi.sendErrorEvent(bannerAdViewId, BannerErrorCode.WebViewError, error.message);
                }
            } else {
                this._bannerModule.Api.BannerListenerApi.sendErrorEvent(bannerAdViewId, BannerErrorCode.WebViewError, `Placement ${placementId} could not be found`);
            }
        });
    }
}
