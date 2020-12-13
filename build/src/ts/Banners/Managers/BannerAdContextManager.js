import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerSizeUtil } from 'Banners/Utilities/BannerSizeUtil';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';
/**
 * Manages BannerAdContext for placements filled with
 * banner ads.
 */
export class BannerAdContextManager {
    constructor(core, ads, banner) {
        this._contexts = {};
        this._bannerModule = banner;
        this._core = core;
        this._ads = ads;
        this.setupObservables();
    }
    removeContext(bannerAdViewId) {
        delete this._contexts[bannerAdViewId];
    }
    getContext(bannerAdViewId) {
        return this._contexts[bannerAdViewId];
    }
    createContext(placement, bannerAdViewId, size) {
        if (placement.isBannerPlacement()) {
            const existingContext = this.getContext(bannerAdViewId);
            if (existingContext) {
                return existingContext;
            }
            else {
                const newContext = new BannerAdContext(placement, bannerAdViewId, size, this._bannerModule, this._ads, this._core);
                this._contexts[bannerAdViewId] = newContext;
                return newContext;
            }
        }
        else {
            throw new Error(`Placement ${placement.getId()} is not a banner placement`);
        }
    }
    setupObservables() {
        this._bannerModule.Api.BannerApi.onBannerDestroyBanner.subscribe((bannerAdViewId) => {
            const context = this.getContext(bannerAdViewId);
            if (context) {
                context.destroy().then(() => {
                    context.unsubscribeListeners();
                    this.removeContext(bannerAdViewId);
                }).catch(() => {
                    context.unsubscribeListeners();
                    this.removeContext(bannerAdViewId);
                });
            }
            else {
                this.removeContext(bannerAdViewId);
            }
        });
        this._bannerModule.Api.BannerApi.onBannerLoadPlacement.subscribe((placementId, bannerAdViewId, width, height) => {
            const placement = this._bannerModule.PlacementManager.getPlacement(placementId);
            if (placement) {
                try {
                    const bannerSize = BannerSizeUtil.getBannerSizeFromWidthAndHeight(width, height, this._core.Api.Sdk);
                    if (bannerSize) {
                        const context = this.createContext(placement, bannerAdViewId, bannerSize);
                        context.load();
                    }
                    else {
                        this._bannerModule.Api.BannerListenerApi.sendErrorEvent(bannerAdViewId, BannerErrorCode.NoFillError, 'No fill for banner size less than 320 * 50');
                    }
                }
                catch (error) {
                    return this._bannerModule.Api.BannerListenerApi.sendErrorEvent(bannerAdViewId, BannerErrorCode.WebViewError, error.message);
                }
            }
            else {
                this._bannerModule.Api.BannerListenerApi.sendErrorEvent(bannerAdViewId, BannerErrorCode.WebViewError, `Placement ${placementId} could not be found`);
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRDb250ZXh0TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYW5uZXJzL01hbmFnZXJzL0Jhbm5lckFkQ29udGV4dE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBS0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ2xFLE9BQU8sRUFBRSxjQUFjLEVBQXFCLE1BQU0sa0NBQWtDLENBQUM7QUFDckYsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBTWpFOzs7R0FHRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFPL0IsWUFBWSxJQUFXLEVBQUUsR0FBUyxFQUFFLE1BQXFCO1FBTmpELGNBQVMsR0FBc0IsRUFBRSxDQUFDO1FBT3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFTSxhQUFhLENBQUMsY0FBc0I7UUFDdkMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxVQUFVLENBQUMsY0FBc0I7UUFDcEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFTSxhQUFhLENBQUMsU0FBb0IsRUFBRSxjQUFzQixFQUFFLElBQXVCO1FBQ3RGLElBQUksU0FBUyxDQUFDLGlCQUFpQixFQUFFLEVBQUU7WUFDL0IsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN4RCxJQUFJLGVBQWUsRUFBRTtnQkFDakIsT0FBTyxlQUFlLENBQUM7YUFDMUI7aUJBQU07Z0JBQ0gs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