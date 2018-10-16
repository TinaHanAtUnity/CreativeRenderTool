import { INativeCallback, NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Core } from 'Core/Core';
import { Analytics } from 'Analytics/Analytics';
import { Ads } from 'Ads/Ads';

export class WebView {

    private readonly _core: Core;
    private readonly _analytics: Analytics;
    private readonly _ads: Ads;

    constructor(nativeBridge: NativeBridge) {
        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(event), false);
        }

        this._core = new Core(nativeBridge);
        this._analytics = new Analytics(this._core);
        this._ads = new Ads(this._core, this._analytics);
    }

    public initialize() {
        this._core.initialize();
    }

    public show(placementId: string, options: any, callback: INativeCallback): void {
        this._ads.show(placementId, options, callback);
    }

    public showBanner(placementId: string, callback: INativeCallback) {
        this._ads.showBanner(placementId, callback);
    }

    public hideBanner(callback: INativeCallback) {
        this._ads.hideBanner(callback);
    }

    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger('js_error', {
            'message': event.message,
            'url': event.filename,
            'line': event.lineno,
            'column': event.colno,
            'object': event.error
        });
        return true; // returning true from window.onerror will suppress the error (in theory)
    }
}
