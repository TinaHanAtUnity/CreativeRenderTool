import { NativeBridge } from 'Common/Native/NativeBridge';
import {
    IWebPlayerEventSettings,
    IWebPlayerPlayerSettingsAndroid,
    IWebPlayerWebSettingsAndroid,
    IWebPlayerWebSettingsIos,
    WebPlayerViewId
} from 'Common/Native/Api/WebPlayer';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';

/**
 * The WebPlayerContainer wraps the WebPlayerApi in a way that can be used without needing
 * to pass in the ViewID specifically into each method.
 */
export abstract class WebPlayerContainer {

    public readonly onPageStarted = new Observable1<string>();
    public readonly onPageFinished = new Observable1<string>();
    public readonly onWebPlayerEvent = new Observable1<string>();
    public readonly onCreateWindow = new Observable1<string>();
    public readonly shouldOverrideUrlLoading = new Observable2<string, string>();
    public readonly onCreateWebView = new Observable1<string>();

    private _nativeBridge: NativeBridge;
    private _viewId: WebPlayerViewId;

    constructor(nativeBridge: NativeBridge, viewId: WebPlayerViewId) {
        this._nativeBridge = nativeBridge;
        this._viewId = viewId;

        this._nativeBridge.WebPlayer.onPageStarted.subscribe((view, url) => this.handleOnPageStarted(view, url));
        this._nativeBridge.WebPlayer.onPageFinished.subscribe((view, url) => this.handleOnPageFinished(view, url));
        this._nativeBridge.WebPlayer.onWebPlayerEvent.subscribe((view, event) => this.handleOnWebPlayerEvent(view, event));
        this._nativeBridge.WebPlayer.shouldOverrideUrlLoading.subscribe((view, url, method) => this.handleShouldOverrideUrlLoading(view, url, method));
        this._nativeBridge.WebPlayer.onCreateWebView.subscribe((view, url) => this.handleOnCreateWebView(view, url));
    }

    public setUrl(url: string): Promise<void> {
        return this._nativeBridge.WebPlayer.setUrl(url, this._viewId);
    }

    public setData(data: string, mimeType: string, encoding: string): Promise<void>  {
        return this._nativeBridge.WebPlayer.setData(data, mimeType, encoding, this._viewId);
    }

    public setDataWithUrl(baseUrl: string, data: string, mimeType: string, encoding: string): Promise<void>  {
        return this._nativeBridge.WebPlayer.setDataWithUrl(baseUrl, data, mimeType, encoding, this._viewId);
    }

    public setSettings(webSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos, webPlayerSettings: IWebPlayerPlayerSettingsAndroid): Promise<void>  {
        return this._nativeBridge.WebPlayer.setSettings(webSettings, webPlayerSettings, this._viewId);
    }

    public clearSettings(): Promise<void> {
        return this._nativeBridge.WebPlayer.clearSettings(this._viewId);
    }

    public setEventSettings(eventSettings: IWebPlayerEventSettings): Promise<void> {
        return this._nativeBridge.WebPlayer.setEventSettings(eventSettings, this._viewId);
    }

    public sendEvent(args: any[]): Promise<void> {
        return this._nativeBridge.WebPlayer.sendEvent(args, this._viewId);
    }

    private handleOnPageStarted(viewId: string, url: string) {
        if (this._viewId === viewId) {
            this.onPageStarted.trigger(url);
        }
    }
    private handleOnPageFinished(viewId: string, url: string) {
        if (this._viewId === viewId) {
            this.onPageFinished.trigger(url);
        }
    }
    private handleOnWebPlayerEvent(viewId: string, event: string) {
        if (this._viewId === viewId) {
            this.onWebPlayerEvent.trigger(event);
        }
    }
    private handleShouldOverrideUrlLoading(viewId: string, url: string, method: string) {
        if (this._viewId === viewId) {
            this.shouldOverrideUrlLoading.trigger(url, method);
        }
    }
    private handleOnCreateWebView(viewId: string, url: string) {
        if (this._viewId === viewId) {
            this.onCreateWebView.trigger(url);
        }
    }
}
