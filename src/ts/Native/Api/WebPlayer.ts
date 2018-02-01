import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable1 } from "Utilities/Observable";

// TODO: platform specifc
export enum WebplayerEvent {
    PAGE_STARTED,
    PAGE_FINISHED,
    ERROR,
    HTTP_ERROR,
    PERMISSION_REQUEST,
    LOAD_RESOUCE,
    SSL_ERROR,
    CLIENT_CERT_REQUEST,
    HTTP_AUTH_REQUEST,
    SCALE_CHANGED,
    LOGIN_REQUEST,
    PROGRESS_CHANGED,
    RECEIVED_TITLE,
    RECEIVED_ICON,
    RECEIVED_TOUCH_ICON_URL,
    SHOW_CUSTOM_VIEW,
    HIDE_CUSTOM_VIEW,
    CREATE_WINDOW,
    CLOSE_WINDOW,
    REQUEST_FOCUS,
    JS_ALERT,
    JS_CONFIRM,
    JS_PROMPT,
    CONSOLE_MESSAGE,
    SHOW_FILE_CHOOSER,
    GEOLOCATION_PERMISSIONS_SHOW,
    WEBPLAYER_EVENT
}

export class WebPlayerApi extends NativeApi {

    public readonly onPageStarted = new Observable1<string>();
    public readonly onPageFinished = new Observable1<string>();
    public readonly onWebPlayerEvent = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'WebPlayer');
    }

    public setUrl(url: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setUrl', [url]);
    }

    public setData(data: string, mimeType: string, encoding: string): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setData', [data, mimeType, encoding]);
    }

    public setDataWithUrl(baseUrl: string, data: string, mimeType: string, encoding: string): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDataWithUrl', [baseUrl, data, mimeType, encoding]);
    }

    public setSettings<T, V>(webSettings: T, webPlayerSettings: V): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setSettings', [webSettings, webPlayerSettings]);
    }

    public clearSettings(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'clearSettings');
    }

    public setEventSettings<T>(eventSettings: T): Promise<void> {
        this._nativeBridge.Sdk.logDebug("WebPlayerApi: setEventSettings()");
        return this._nativeBridge.invoke<void>(this._apiClass, 'setEventSettings', [eventSettings]);
    }

    public sendEvent(args: any[]): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'sendEvent', [args]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case WebplayerEvent[WebplayerEvent.PAGE_STARTED]:
                this.onPageStarted.trigger(parameters[0]);
                break;

            case WebplayerEvent[WebplayerEvent.PAGE_FINISHED]:
                this.onPageFinished.trigger(parameters[0]);
                break;

            case WebplayerEvent[WebplayerEvent.ERROR]:
                this.onPageFinished.trigger(parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.WEBPLAYER_EVENT]:
                this.onWebPlayerEvent.trigger(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
