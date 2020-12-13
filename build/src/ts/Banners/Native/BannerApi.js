import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1, Observable2, Observable4 } from 'Core/Utilities/Observable';
var BannerEvents;
(function (BannerEvents) {
    BannerEvents["BannerEventResized"] = "BANNER_RESIZED";
    BannerEvents["BannerEventVisibilityChange"] = "BANNER_VISIBILITY_CHANGED";
    BannerEvents["BannerOpenedEvent"] = "BANNER_ATTACHED";
    BannerEvents["BannerClosedEvent"] = "BANNER_DETACHED";
    BannerEvents["BannerLoadedEvent"] = "BANNER_LOADED";
    BannerEvents["BannerDestroyedEvent"] = "BANNER_DESTROYED";
    BannerEvents["BannerLoadPlacement"] = "BANNER_LOAD_PLACEMENT";
    BannerEvents["BannerDestroyBanner"] = "BANNER_DESTROY_BANNER";
})(BannerEvents || (BannerEvents = {}));
export var Visibility;
(function (Visibility) {
    Visibility[Visibility["Visible"] = 0] = "Visible";
    Visibility[Visibility["Hidden"] = 1] = "Hidden";
    Visibility[Visibility["Gone"] = 2] = "Gone";
})(Visibility || (Visibility = {}));
// These numbers are taken from Android's View.Visibility
const VisibilityVisible = 0x0000000;
const VisibilityHidden = 0x00000004;
const VisibilityGone = 0x00000008;
export var BannerViewType;
(function (BannerViewType) {
    BannerViewType[BannerViewType["WEB_PLAYER"] = 0] = "WEB_PLAYER";
})(BannerViewType || (BannerViewType = {}));
export class BannerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Banner', ApiPackage.BANNER, EventCategory.BANNER);
        this.onBannerResized = new Observable2();
        this.onBannerVisibilityChanged = new Observable2();
        this.onBannerAttached = new Observable1();
        this.onBannerDetached = new Observable1();
        this.onBannerLoaded = new Observable1();
        this.onBannerDestroyed = new Observable1();
        this.onBannerLoadPlacement = new Observable4();
        this.onBannerDestroyBanner = new Observable1();
    }
    setRefreshRate(placementId, refreshRate) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setRefreshRate', [placementId, refreshRate]);
    }
    load(bannerViewType, width, height, bannerAdViewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'load', [BannerViewType[bannerViewType], width, height, bannerAdViewId]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case BannerEvents.BannerEventResized:
                this.handleBannerResized(parameters);
                break;
            case BannerEvents.BannerEventVisibilityChange:
                this.handleBannerVisibilityChanged(parameters);
                break;
            case BannerEvents.BannerOpenedEvent:
                this.handleBannerOpenedEvent(parameters[0]);
                break;
            case BannerEvents.BannerClosedEvent:
                this.handleBannerClosedEvent(parameters[0]);
                break;
            case BannerEvents.BannerLoadedEvent:
                this.handleBannerLoadedEvent(parameters[0]);
                break;
            case BannerEvents.BannerDestroyedEvent:
                this.handleBannerDestroyedEvent(parameters[0]);
                break;
            case BannerEvents.BannerLoadPlacement:
                this.handleBannerLoadPlacementEvent(parameters);
                break;
            case BannerEvents.BannerDestroyBanner:
                this.handleBannerDestroyBannerEvent(parameters);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
    handleBannerLoadPlacementEvent(parameters) {
        if (parameters.length >= 3) {
            const placementId = parameters[0];
            const bannerAdViewId = parameters[1];
            const width = parameters[2];
            const height = parameters[3];
            this.onBannerLoadPlacement.trigger(placementId, bannerAdViewId, width, height);
        }
    }
    handleBannerDestroyBannerEvent(parameters) {
        if (parameters.length >= 1) {
            const bannerAdViewId = parameters[0];
            this.onBannerDestroyBanner.trigger(bannerAdViewId);
        }
    }
    handleBannerResized(parameters) {
        const bannerAdViewId = parameters[0];
        const x = parameters[1];
        const y = parameters[2];
        const width = parameters[3];
        const height = parameters[4];
        const alpha = parameters[5];
        this.onBannerResized.trigger(bannerAdViewId, { x, y, width, height, alpha });
    }
    handleBannerVisibilityChanged(parameters) {
        const visibilityAsNumber = parameters[0];
        const bannerAdViewId = parameters[1];
        const visibility = this.getVisibilityForNumber(visibilityAsNumber);
        this.onBannerVisibilityChanged.trigger(bannerAdViewId, visibility);
    }
    getVisibilityForNumber(visibility) {
        switch (visibility) {
            case VisibilityVisible:
                return Visibility.Visible;
            case VisibilityHidden:
                return Visibility.Hidden;
            case VisibilityGone:
                return Visibility.Gone;
            default:
                throw new Error(`Unknown visibility value ${visibility}`);
        }
    }
    handleBannerOpenedEvent(bannerAdViewId) {
        this.onBannerAttached.trigger(bannerAdViewId);
    }
    handleBannerClosedEvent(bannerAdViewId) {
        this.onBannerDetached.trigger(bannerAdViewId);
    }
    handleBannerLoadedEvent(bannerAdViewId) {
        this.onBannerLoaded.trigger(bannerAdViewId);
    }
    handleBannerDestroyedEvent(bannerAdViewId) {
        this.onBannerDestroyed.trigger(bannerAdViewId);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvTmF0aXZlL0Jhbm5lckFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRixJQUFLLFlBU0o7QUFURCxXQUFLLFlBQVk7SUFDYixxREFBcUMsQ0FBQTtJQUNyQyx5RUFBeUQsQ0FBQTtJQUN6RCxxREFBcUMsQ0FBQTtJQUNyQyxxREFBcUMsQ0FBQTtJQUNyQyxtREFBbUMsQ0FBQTtJQUNuQyx5REFBeUMsQ0FBQTtJQUN6Qyw2REFBNkMsQ0FBQTtJQUM3Qyw2REFBNkMsQ0FBQTtBQUNqRCxDQUFDLEVBVEksWUFBWSxLQUFaLFlBQVksUUFTaEI7QUFFRCxNQUFNLENBQU4sSUFBWSxVQUlYO0FBSkQsV0FBWSxVQUFVO0lBQ2xCLGlEQUFPLENBQUE7SUFDUCwrQ0FBTSxDQUFBO0lBQ04sMkNBQUksQ0FBQTtBQUNSLENBQUMsRUFKVyxVQUFVLEtBQVYsVUFBVSxRQUlyQjtBQUVELHlEQUF5RDtBQUN6RCxNQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUNwQyxNQUFNLGdCQUFnQixHQUFHLFVBQVUsQ0FBQztBQUNwQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUM7QUFVbEMsTUFBTSxDQUFOLElBQVksY0FFWDtBQUZELFdBQVksY0FBYztJQUN0QiwrREFBVSxDQUFBO0FBQ2QsQ0FBQyxFQUZXLGNBQWMsS0FBZCxjQUFjLFFBRXpCO0FBZ0JELE1BQU0sT0FBTyxTQUFVLFNBQVEsU0FBUztJQVdwQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZ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