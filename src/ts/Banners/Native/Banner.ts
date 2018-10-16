import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable0, Observable1 } from 'Core/Utilities/Observable';
import { WebViewError } from 'Core/Errors/WebViewError';

enum BannerEvents {
    BannerEventResized          = 'BANNER_RESIZED',
    BannerEventVisibilityChange = 'BANNER_VISIBILITY_CHANGED',
    BannerOpenedEvent           = 'BANNER_ATTACHED',
    BannerClosedEvent           = 'BANNER_DETACHED',
    BannerAttachedStateEvent    = 'BANNER_ATTACHED_STATE',
    BannerLoadedEvent           = 'BANNER_LOADED',
    BannerDestroyedEvent        = 'BANNER_DESTROYED'
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
    BannerPlayer = 'bannerplayer'
}

export class BannerApi extends NativeApi {

    public readonly onBannerResized = new Observable1<IBannerResizedEvent>();
    public readonly onBannerVisibilityChanged = new Observable1<Visibility>();
    // Only for Android
    public readonly onBannerAttachedState = new Observable1<boolean>();
    public readonly onBannerOpened = new Observable0();
    public readonly onBannerClosed = new Observable0();
    public readonly onBannerLoaded = new Observable0();
    public readonly onBannerDestroyed = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Banner', ApiPackage.BANNER);
    }

    public load(views: BannerViewType[], style: string, width: number, height: number): Promise<void> {
        return this._nativeBridge.invoke(this._apiClass, 'load', [views, style, width, height]);
    }

    public destroy(): Promise<void> {
        return this._nativeBridge.invoke(this._apiClass, 'destroy');
    }

    public setViewFrame(view: BannerViewType, x: number, y: number, width: number, height: number) {
        return this._nativeBridge.invoke(this._apiClass, 'setViewFrame', [view, x, y, width, height]);
    }

    public setBannerFrame(style: string, width: number, height: number) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setBannerFrame', [style, width, height]);
    }

    public setViews(views: BannerViewType[]) {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setViews', [views]);
    }

    public handleEvent(event: string, parameters: any[]) {
        switch (event) {
            case BannerEvents.BannerEventResized:
                this.handleBannerResized(parameters);
                break;
            case BannerEvents.BannerEventVisibilityChange:
                this.handleBannerVisibilityChanged(parameters);
                break;
            case BannerEvents.BannerAttachedStateEvent:
                this.handleBannerAttachedStateEvent(parameters);
                break;
            case BannerEvents.BannerOpenedEvent:
                this.handleBannerOpenedEvent();
                break;
            case BannerEvents.BannerClosedEvent:
                this.handleBannerClosedEvent();
                break;
            case BannerEvents.BannerLoadedEvent:
                this.handleBannerLoadedEvent();
                break;
            case BannerEvents.BannerDestroyedEvent:
                this.handleBannerDestroyedEvent();
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }

    private handleBannerResized(parameters: any[]) {
        const x = parameters[0],
            y = parameters[1],
            width = parameters[2],
            height = parameters[3],
            alpha = parameters[4];
        this.onBannerResized.trigger({x, y, width, height, alpha});
    }

    private handleBannerVisibilityChanged(parameters: any[]) {
        const visibilityAsNumber = parameters[0];
        const visibility = this.getVisibilityForNumber(visibilityAsNumber);
        this.onBannerVisibilityChanged.trigger(visibility);
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

    private handleBannerAttachedStateEvent(parameters: any[]) {
        if (parameters.length !== 1) {
            throw new WebViewError('Banner attached state event with no attached state parameter');
        } else {
            const attached = parameters[0];
            this.onBannerAttachedState.trigger(attached);
        }
    }

    private handleBannerOpenedEvent() {
        this.onBannerOpened.trigger();
    }

    private handleBannerClosedEvent() {
        this.onBannerClosed.trigger();
    }
    private handleBannerLoadedEvent() {
        this.onBannerLoaded.trigger();
    }
    private handleBannerDestroyedEvent() {
        this.onBannerDestroyed.trigger();
    }
}
