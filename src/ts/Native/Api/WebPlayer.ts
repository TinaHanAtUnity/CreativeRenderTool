import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable1 } from "Utilities/Observable";

// Platform specific, first three are available on both Android & iOS. The rest are Android only.
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
    GEOLOCATION_PERMISSIONS_SHOW
}

export interface IWebPlayerEventSettings {
    onPageStarted?: { sendEvent: boolean };
    onPageFinished?: { sendEvent: boolean };
    onReceivedError?: { sendEvent: boolean };
    onLoadResource?: { sendEvent: boolean };
    onReceivedSslError?: { sendEvent: boolean };
    onReceivedClientCertRequest?: { sendEvent: boolean };
    onReceivedHttpAuthRequest?: { sendEvent: boolean };
    onScaleChanged?: { sendEvent: boolean };
    onReceivedLoginRequest?: { sendEvent: boolean };
    onReceivedHttpError?: { sendEvent: boolean };
    onGeolocationPermissionsShowPrompt?: { sendEvent: boolean };
    onPermissionRequest?: { sendEvent: boolean };
    onProgressChanged?: { sendEvent: boolean };
    onReceivedTitle?: { sendEvent: boolean };
    onReceivedIcon?: { sendEvent: boolean };
    onReceivedTouchIconUrl?: { sendEvent: boolean };
    onShowCustomView?: { sendEvent: boolean };
    onHideCustomView?: { sendEvent: boolean };
    onCreateWindow?: { sendEvent: boolean };
    onRequestFocus?: { sendEvent: boolean };
    onCloseWindow?: { sendEvent: boolean };
    onJsAlert?: { sendEvent: boolean };
    onJsConfirm?: { sendEvent: boolean };
    onJsPrompt?: { sendEvent: boolean };
    onConsoleMessage?: { sendEvent: boolean };
    onShowFileChooser?: { sendEvent: boolean };
}

export class WebPlayerApi extends NativeApi {

    public readonly onPageStarted = new Observable1<string>();
    public readonly onPageFinished = new Observable1<string>();

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

    public setSettings(webSettings: {[key: string]: any}, webPlayerSettings: {[key: string]: any}): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setSettings', [webSettings, webPlayerSettings]);
    }

    public clearSettings(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'clearSettings');
    }

    public setEventSettings(eventSettings: IWebPlayerEventSettings): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setEventSettings', [eventSettings]);
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

            default:
                super.handleEvent(event, parameters);
        }
    }
}
