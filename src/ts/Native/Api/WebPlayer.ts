import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';
import { Observable1, Observable0, Observable2 } from "Utilities/Observable";

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
    GEOLOCATION_PERMISSIONS_SHOW,
    WEBPLAYER_EVENT,
    DOWNLOAD_START,
    SHOULD_OVERRIDE_URL_LOADING,
    SHOULD_OVERRIDE_KEY_EVENT,
    PAGE_COMMIT_VISIBLE,
    FORM_RESUBMISSION,
    UNHANDLED_KEY_EVENT,
    SHOULD_INTERCEPT_REQUEST
}

export interface IWebPlayerEventSettings {
    onPageStarted?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onPageFinished?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedError?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onLoadResource?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedSslError?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedClientCertRequest?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedHttpAuthRequest?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onScaleChanged?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedLoginRequest?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedHttpError?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onGeolocationPermissionsShowPrompt?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onPermissionRequest?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onProgressChanged?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedTitle?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedIcon?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onReceivedTouchIconUrl?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onShowCustomView?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onHideCustomView?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onCreateWindow?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onRequestFocus?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onCloseWindow?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onJsAlert?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onJsConfirm?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onJsPrompt?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onConsoleMessage?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onShowFileChooser?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onDownloadStart?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    shouldOverrideUrlLoading?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onPageCommitVisible?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    shouldInterceptRequest?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    onFormResubmission?: { sendEvent?: boolean, shouldCallSuper?: boolean };
    shouldOverrideKeyEvent?: { sendEvent?: boolean, shouldCallSuper?: boolean, getReturnValue?: boolean };
    onUnhandledKeyEvent?: { sendEvent?: boolean, shouldCallSuper?: boolean };
}

export interface IWebPlayerWebSettingsAndroid {
    setAllowContentAccess?: [ boolean ];
    setAllowFileAccess?: [ boolean ];
    setAllowFileAccessFromFileURLs?: [ boolean ];
    setAllowUniversalAccessFromFileURLs?: [ boolean ];
    setAppCacheEnabled?: [ boolean ];
    setAppCacheMaxSize?: [ number ];
    setAppCachePath?: [ string ];
    setBlockNetworkImage?: [ boolean ];
    setBlockNetworkLoads?: [ boolean ];
    setBuiltInZoomControls?: [ boolean ];
    setCacheMode?: [ number ];
    setCursiveFontFamily?: [ string ];
    setDatabaseEnabled?: [ boolean ];
    setDatabasePath?: [ string ];
    setDefaultFixedFontSize?: [ number ];
    setDefaultFontSize?: [ number ];
    setDefaultTextEncodingName?: [ string ];
    setDisabledActionModeMenuItems?: [ number ];
    setDisplayZoomControls?: [ boolean ];
    setDomStorageEnabled?: [ boolean ];
    setEnableSmoothTransition?: [ boolean ];
    setFantasyFontFamily?: [ string ];
    setFixedFontFamily?: [ string ];
    setGeolocationDatabasePath?: [ string ];
    setGeolocationEnabled?: [ boolean ];
    setJavaScriptCanOpenWindowsAutomatically?: [ boolean ];
    setJavaScriptEnabled?: [ boolean ];
    setLightTouchEnabled?: [ boolean ];
    setLoadWithOverviewMode?: [ boolean ];
    setLoadsImagesAutomatically?: [ boolean ];
    setMediaPlaybackRequiresUserGesture?: [ boolean ];
    setMinimumFontSize?: [ number ];
    setMinimumLogicalFontSize?: [ number ];
    setMixedContentMode?: [ number ];
    setNeedInitialFocus?: [ boolean ];
    setOffscreenPreRaster?: [ boolean ];
    setSafeBrowsingEnabled?: [ boolean ];
    setSansSerifFontFamily?: [ string ];
    setSaveFormData?: [ boolean ];
    setSavePassword?: [ boolean ];
    setSerifFontFamily?: [ string ];
    setStandardFontFamily?: [ string ];
    setSupportMultipleWindows?: [ boolean ];
    setSupportZoom?: [ boolean ];
    setTextZoom?: [ number ];
    setUseWideViewPort?: [ boolean ];
    setLayoutAlgorithm?: [ { type: "Enum", className: "android.webkit.WebSettings$LayoutAlgorithm",
        value: "NARROW_COLUMNS" | "NORMAL" | "SINGLE_COLUMN" | "TEXT_AUTOSIZING" } ];
}

export interface IWebPlayerPlayerSettingsAndroid {
    setBackgroundColor?: [ number ];
    setInitialScale?: [ number ];
    setHorizontalScrollbarOverlay?: [ boolean ];
    setMapTrackballToArrowKeys?: [ boolean ];
    setNetworkAvailable?: [ boolean ];
    setOverScrollMode?: [ number ];
    setScrollBarStyle?: [ number ];
    setVerticalScrollbarOverlay?: [ boolean ];
    setHttpAuthUsernamePassword?: [string, string, string, string];
    setRendererPriorityPolicy?: [number, boolean];
}

export interface IWebPlayerWebSettingsIos {
    allowsPlayback?: boolean;
    playbackRequiresAction?: boolean;
    typesRequiringAction?: WKAudiovisualMediaTypes;
    scalesPagesToFit?: boolean; // UIWebView only
    javaScriptCanOpenWindowsAutomatically?: boolean; // WKWebView only
    javaScriptEnabled?: boolean; // WKWebView only
    mediaPlaybackAllowsAirPlay?: boolean;
    suppressesIncrementalRendering?: boolean;
    keyboardDisplayRequiresUserAction?: boolean; // UIWebView only
    ignoresViewportScaleLimits?: boolean; // WKWebView iOS10+ only
    dataDetectorTypes?: number; // WKWebView iOS10+ only (bitfield) & UIWebView (enum)
}

export enum WKAudiovisualMediaTypes {
    NONE    = 0,
    AUDIO   = 1 << 0,
    VIDEO   = 1 << 1,
    ALL     = WKAudiovisualMediaTypes.AUDIO | WKAudiovisualMediaTypes.VIDEO,
}

export class WebPlayerApi extends NativeApi {

    public readonly onPageStarted = new Observable1<string>();
    public readonly onPageFinished = new Observable1<string>();
    public readonly onWebPlayerEvent = new Observable1<string>();
    public readonly onCreateWindow = new Observable1<string>();
    public readonly shouldOverrideUrlLoading = new Observable2<string, string>();

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

    public setSettings(webSettings: IWebPlayerWebSettingsAndroid | IWebPlayerWebSettingsIos, webPlayerSettings: IWebPlayerPlayerSettingsAndroid): Promise<void>  {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setSettings', [webSettings, webPlayerSettings]);
    }

    public clearSettings(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'clearSettings');
    }

    public setEventSettings(eventSettings: IWebPlayerEventSettings): Promise<void> {
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

            case WebplayerEvent[WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING]:
                this.shouldOverrideUrlLoading.trigger(parameters[0], parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }
}
