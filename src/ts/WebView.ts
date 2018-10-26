import { Core } from 'Core/Core';
import { INativeCallback, NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class WebView {

    private readonly _core: Core;

    constructor(nativeBridge: NativeBridge) {
        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(event), false);
        }

        this._core = new Core(nativeBridge);
    }

    public initialize() {
        this._core.initialize();
    }

    public show(placementId: string, options: any, callback: INativeCallback): void {
        this._core.Ads.show(placementId, options, callback);
    }

    public showBanner(placementId: string, callback: INativeCallback) {
        this._core.Ads.showBanner(placementId, callback);
    }

    public hideBanner(callback: INativeCallback) {
        this._core.Ads.hideBanner(callback);
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
