import { Core } from 'Core/Core';
import { INativeCallback, NativeBridge, CallbackStatus } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export class WebView {

    private readonly _core: Core;

    constructor(nativeBridge: NativeBridge) {
        if (window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(event), false);
        }

        this._core = new Core(nativeBridge);
    }

    public initialize(): Promise<void> {
        return this._core.initialize();
    }

    public show(placementId: string, options: unknown, callback: INativeCallback): void {
        this._core.Ads.show(placementId, options, callback);
    }

    private onError(event: ErrorEvent): boolean {
        if (event.lineno && typeof event.lineno === 'number' && event.lineno > 1) {
            Diagnostics.trigger('js_error', {
                'message': event.message,
                'url': event.filename,
                'line': event.lineno,
                'column': event.colno,
                'object': event.error
            });
        }
        return true; // returning true from window.onerror will suppress the error (in theory)
    }

}
