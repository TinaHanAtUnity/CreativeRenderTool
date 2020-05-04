import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable2, Observable4 } from 'Core/Utilities/Observable';

enum BannerEvents {
    BannerEventResized = 'BANNER_RESIZED',
    BannerEventVisibilityChange = 'BANNER_VISIBILITY_CHANGED',
    BannerOpenedEvent = 'BANNER_ATTACHED',
    BannerClosedEvent = 'BANNER_DETACHED',
    BannerLoadedEvent = 'BANNER_LOADED',
    BannerDestroyedEvent = 'BANNER_DESTROYED',
    BannerLoadPlacement = 'BANNER_LOAD_PLACEMENT',
    BannerDestroyBanner = 'BANNER_DESTROY_BANNER'
}

export enum Visibility {
    Visible,
    Hidden,
    Gone
}

// These numbers are taken from Android's View.Visibility
const VisibilityVisible = 0x0000000;
const VisibilityHidden = 0x00000004;
const VisibilityGone = 0x00000008;

export interface IBannerResizedEvent {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
}

export enum BannerViewType {
    WEB_PLAYER
}

export interface IBannerApi {
    onBannerResized: Observable2<string, IBannerResizedEvent>;
    onBannerVisibilityChanged: Observable2<string, Visibility>;
    onBannerAttached: Observable1<string>;
    onBannerDetached: Observable1<string>;
    onBannerLoaded: Observable1<string>;
    onBannerDestroyed: Observable1<string>;
    onBannerLoadPlacement: Observable4<string, string, number, number>;
    onBannerDestroyBanner: Observable1<string>;

    setRefreshRate(placementId: string, refreshRate: number): Promise<void>;
    load(bannerViewType: BannerViewType, width: number, height: number, bannerAdViewId: string): Promise<void>;
}

export class BannerApi extends NativeApi implements IBannerApi {

    public readonly onBannerResized = new Observable2<string, IBannerResizedEvent>();
    public readonly onBannerVisibilityChanged = new Observable2<string, Visibility>();
    public readonly onBannerAttached = new Observable1<string>();
    public readonly onBannerDetached = new Observable1<string>();
    public readonly onBannerLoaded = new Observable1<string>();
    public readonly onBannerDestroyed = new Observable1<string>();
    public readonly onBannerLoadPlacement = new Observable4<string, string, number, number>();
    public readonly onBannerDestroyBanner = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Banner', ApiPackage.BANNER, EventCategory.BANNER);
    }

    public setRefreshRate(placementId: string, refreshRate: number): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setRefreshRate', [placementId, refreshRate]);
    }

    public load(bannerViewType: BannerViewType, width: number, height: number, bannerAdViewId: string): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'load', [BannerViewType[bannerViewType], width, height, bannerAdViewId]);
    }

    public handleEvent(event: string, parameters: unknown[]) {
        switch (event) {
            case BannerEvents.BannerEventResized:
                this.handleBannerResized(parameters);
                break;
            case BannerEvents.BannerEventVisibilityChange:
                this.handleBannerVisibilityChanged(parameters);
                break;
            case BannerEvents.BannerOpenedEvent:
                this.handleBannerOpenedEvent(<string>parameters[0]);
                break;
            case BannerEvents.BannerClosedEvent:
                this.handleBannerClosedEvent(<string>parameters[0]);
                break;
            case BannerEvents.BannerLoadedEvent:
                this.handleBannerLoadedEvent(<string>parameters[0]);
                break;
            case BannerEvents.BannerDestroyedEvent:
                this.handleBannerDestroyedEvent(<string>parameters[0]);
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

    private handleBannerLoadPlacementEvent(parameters: unknown[]) {
        if (parameters.length >= 3) {
            const placementId: string = <string> parameters[0];
            const bannerAdViewId: string = <string> parameters[1];
            const width: number = <number> parameters[2];
            const height: number = <number> parameters[3];
            this.onBannerLoadPlacement.trigger(placementId, bannerAdViewId, width, height);
        }
    }

    private handleBannerDestroyBannerEvent(parameters: unknown[]) {
        if (parameters.length >= 1) {
            const bannerAdViewId: string = <string> parameters[0];
            this.onBannerDestroyBanner.trigger(bannerAdViewId);
        }
    }

    private handleBannerResized(parameters: unknown[]) {
        const bannerAdViewId = <string>parameters[0];
        const x = <number>parameters[1];
        const y = <number>parameters[2];
        const width = <number>parameters[3];
        const height = <number>parameters[4];
        const alpha = <number>parameters[5];
        this.onBannerResized.trigger(bannerAdViewId, { x, y, width, height, alpha });
    }

    private handleBannerVisibilityChanged(parameters: unknown[]) {
        const visibilityAsNumber = <number>parameters[0];
        const bannerAdViewId = <string>parameters[1];
        const visibility = this.getVisibilityForNumber(visibilityAsNumber);
        this.onBannerVisibilityChanged.trigger(bannerAdViewId, visibility);
    }

    private getVisibilityForNumber(visibility: number): Visibility {
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

    private handleBannerOpenedEvent(bannerAdViewId: string) {
        this.onBannerAttached.trigger(bannerAdViewId);
    }

    private handleBannerClosedEvent(bannerAdViewId: string) {
        this.onBannerDetached.trigger(bannerAdViewId);
    }
    private handleBannerLoadedEvent(bannerAdViewId: string) {
        this.onBannerLoaded.trigger(bannerAdViewId);
    }
    private handleBannerDestroyedEvent(bannerAdViewId: string) {
        this.onBannerDestroyed.trigger(bannerAdViewId);
    }
}
