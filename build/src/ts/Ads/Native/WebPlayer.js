import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable2, Observable3, Observable6, Observable7 } from 'Core/Utilities/Observable';
import { JaegerUtilities } from 'Core/Jaeger/JaegerUtilities';
import { Platform } from 'Core/Constants/Platform';
import { Promises } from 'Core/Utilities/Promises';
// Platform specific, first three are available on both Android & iOS. The rest are Android only.
export var WebplayerEvent;
(function (WebplayerEvent) {
    WebplayerEvent[WebplayerEvent["PAGE_STARTED"] = 0] = "PAGE_STARTED";
    WebplayerEvent[WebplayerEvent["PAGE_FINISHED"] = 1] = "PAGE_FINISHED";
    WebplayerEvent[WebplayerEvent["ERROR"] = 2] = "ERROR";
    WebplayerEvent[WebplayerEvent["HTTP_ERROR"] = 3] = "HTTP_ERROR";
    WebplayerEvent[WebplayerEvent["PERMISSION_REQUEST"] = 4] = "PERMISSION_REQUEST";
    WebplayerEvent[WebplayerEvent["LOAD_RESOUCE"] = 5] = "LOAD_RESOUCE";
    WebplayerEvent[WebplayerEvent["SSL_ERROR"] = 6] = "SSL_ERROR";
    WebplayerEvent[WebplayerEvent["CLIENT_CERT_REQUEST"] = 7] = "CLIENT_CERT_REQUEST";
    WebplayerEvent[WebplayerEvent["HTTP_AUTH_REQUEST"] = 8] = "HTTP_AUTH_REQUEST";
    WebplayerEvent[WebplayerEvent["SCALE_CHANGED"] = 9] = "SCALE_CHANGED";
    WebplayerEvent[WebplayerEvent["LOGIN_REQUEST"] = 10] = "LOGIN_REQUEST";
    WebplayerEvent[WebplayerEvent["PROGRESS_CHANGED"] = 11] = "PROGRESS_CHANGED";
    WebplayerEvent[WebplayerEvent["RECEIVED_TITLE"] = 12] = "RECEIVED_TITLE";
    WebplayerEvent[WebplayerEvent["RECEIVED_ICON"] = 13] = "RECEIVED_ICON";
    WebplayerEvent[WebplayerEvent["RECEIVED_TOUCH_ICON_URL"] = 14] = "RECEIVED_TOUCH_ICON_URL";
    WebplayerEvent[WebplayerEvent["SHOW_CUSTOM_VIEW"] = 15] = "SHOW_CUSTOM_VIEW";
    WebplayerEvent[WebplayerEvent["HIDE_CUSTOM_VIEW"] = 16] = "HIDE_CUSTOM_VIEW";
    WebplayerEvent[WebplayerEvent["CREATE_WINDOW"] = 17] = "CREATE_WINDOW";
    WebplayerEvent[WebplayerEvent["CLOSE_WINDOW"] = 18] = "CLOSE_WINDOW";
    WebplayerEvent[WebplayerEvent["REQUEST_FOCUS"] = 19] = "REQUEST_FOCUS";
    WebplayerEvent[WebplayerEvent["JS_ALERT"] = 20] = "JS_ALERT";
    WebplayerEvent[WebplayerEvent["JS_CONFIRM"] = 21] = "JS_CONFIRM";
    WebplayerEvent[WebplayerEvent["JS_PROMPT"] = 22] = "JS_PROMPT";
    WebplayerEvent[WebplayerEvent["CONSOLE_MESSAGE"] = 23] = "CONSOLE_MESSAGE";
    WebplayerEvent[WebplayerEvent["SHOW_FILE_CHOOSER"] = 24] = "SHOW_FILE_CHOOSER";
    WebplayerEvent[WebplayerEvent["GEOLOCATION_PERMISSIONS_SHOW"] = 25] = "GEOLOCATION_PERMISSIONS_SHOW";
    WebplayerEvent[WebplayerEvent["WEBPLAYER_EVENT"] = 26] = "WEBPLAYER_EVENT";
    WebplayerEvent[WebplayerEvent["DOWNLOAD_START"] = 27] = "DOWNLOAD_START";
    WebplayerEvent[WebplayerEvent["SHOULD_OVERRIDE_URL_LOADING"] = 28] = "SHOULD_OVERRIDE_URL_LOADING";
    WebplayerEvent[WebplayerEvent["SHOULD_OVERRIDE_KEY_EVENT"] = 29] = "SHOULD_OVERRIDE_KEY_EVENT";
    WebplayerEvent[WebplayerEvent["PAGE_COMMIT_VISIBLE"] = 30] = "PAGE_COMMIT_VISIBLE";
    WebplayerEvent[WebplayerEvent["FORM_RESUBMISSION"] = 31] = "FORM_RESUBMISSION";
    WebplayerEvent[WebplayerEvent["UNHANDLED_KEY_EVENT"] = 32] = "UNHANDLED_KEY_EVENT";
    WebplayerEvent[WebplayerEvent["SHOULD_INTERCEPT_REQUEST"] = 33] = "SHOULD_INTERCEPT_REQUEST";
    WebplayerEvent[WebplayerEvent["CREATE_WEBVIEW"] = 34] = "CREATE_WEBVIEW";
    WebplayerEvent[WebplayerEvent["FRAME_UPDATE"] = 35] = "FRAME_UPDATE";
    WebplayerEvent[WebplayerEvent["GET_FRAME_RESPONSE"] = 36] = "GET_FRAME_RESPONSE";
})(WebplayerEvent || (WebplayerEvent = {}));
export var WKAudiovisualMediaTypes;
(function (WKAudiovisualMediaTypes) {
    WKAudiovisualMediaTypes[WKAudiovisualMediaTypes["NONE"] = 0] = "NONE";
    WKAudiovisualMediaTypes[WKAudiovisualMediaTypes["AUDIO"] = 1] = "AUDIO";
    WKAudiovisualMediaTypes[WKAudiovisualMediaTypes["VIDEO"] = 2] = "VIDEO";
    WKAudiovisualMediaTypes[WKAudiovisualMediaTypes["ALL"] = 3] = "ALL";
})(WKAudiovisualMediaTypes || (WKAudiovisualMediaTypes = {}));
export var WebPlayerViewId;
(function (WebPlayerViewId) {
    WebPlayerViewId["BannerPlayer"] = "bannerplayer";
    WebPlayerViewId["WebPlayer"] = "webplayer";
})(WebPlayerViewId || (WebPlayerViewId = {}));
export class WebPlayerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'WebPlayer', ApiPackage.ADS, EventCategory.WEBPLAYER);
        this.onPageStarted = new Observable2();
        this.onPageFinished = new Observable2();
        this.onWebPlayerEvent = new Observable2();
        this.onCreateWindow = new Observable2();
        this.shouldOverrideUrlLoading = new Observable3();
        this.onCreateWebView = new Observable2();
        this.onFrameUpdate = new Observable6();
        this.onGetFrameResponse = new Observable7();
    }
    setUrl(url, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setUrl', [url, viewId]);
    }
    setData(data, mimeType, encoding, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setData', [data, mimeType, encoding, viewId]);
    }
    setDataWithUrl(baseUrl, data, mimeType, encoding, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setDataWithUrl', [baseUrl, data, mimeType, encoding, viewId]);
    }
    setSettings(webSettings, webPlayerSettings, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setSettings', [webSettings, webPlayerSettings, viewId]).catch((e) => {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID && e === 'WEBPLAYER_NULL') {
                // Fix for Android WEBPLAYER_NULL errors:
                // In Ads SDK 3.3 & 3.4 setSettings is called before the container is opened.  In this case, the settings
                // are saved, but the error WEBPLAYER_NULL is returned.  This check prevents ad units from breaking
                // due to this error.
                return Promise.resolve();
            }
            else {
                return Promise.reject(e);
            }
        });
    }
    clearSettings(viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'clearSettings', [viewId]);
    }
    setEventSettings(eventSettings, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setEventSettings', [eventSettings, viewId]).catch((e) => {
            if (this._nativeBridge.getPlatform() === Platform.ANDROID && e === 'WEBPLAYER_NULL') {
                // Fix for Android WEBPLAYER_NULL errors:
                // In Ads SDK 3.3 & 3.4 setEventSettings is called before the container is opened.  In this case, the settings
                // are saved, but the error WEBPLAYER_NULL is returned.  This check prevents ad units from breaking
                // due to this error.
                return Promise.resolve();
            }
            else {
                return Promise.reject(e);
            }
        });
    }
    sendEvent(args, viewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendEvent', [args, viewId]);
    }
    getFrame(viewId) {
        const callId = JaegerUtilities.uuidv4();
        let observer;
        const promise = Promises.withTimeout(new Promise((resolve) => {
            observer = this.onGetFrameResponse.subscribe((callIdIncoming, frameViewId, x, y, width, height, alpha) => {
                if (callIdIncoming === callId) {
                    resolve([x, y, width, height]);
                    if (observer) {
                        this.onGetFrameResponse.unsubscribe(observer);
                    }
                }
            });
            this._nativeBridge.invoke(this._fullApiClassName, 'getFrame', [callId, viewId]);
        }), 500);
        return promise.catch((error) => {
            if (observer) {
                this.onGetFrameResponse.unsubscribe(observer);
            }
            return error;
        });
    }
    // parameters.pop is used here because the params length is variable and we want the last param
    handleEvent(event, parameters) {
        switch (event) {
            case WebplayerEvent[WebplayerEvent.PAGE_STARTED]:
                this.onPageStarted.trigger(parameters.pop(), parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.PAGE_FINISHED]:
                this.onPageFinished.trigger(parameters.pop(), parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.ERROR]:
                this.onPageFinished.trigger(parameters.pop(), parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.WEBPLAYER_EVENT]:
                this.onWebPlayerEvent.trigger(parameters.pop(), parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.SHOULD_OVERRIDE_URL_LOADING]:
                this.shouldOverrideUrlLoading.trigger(parameters.pop(), parameters[0], parameters[1]);
                break;
            case WebplayerEvent[WebplayerEvent.CREATE_WEBVIEW]:
                this.onCreateWebView.trigger(parameters.pop(), parameters[0]);
                break;
            case WebplayerEvent[WebplayerEvent.FRAME_UPDATE]:
                this.onFrameUpdate.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5]);
                break;
            case WebplayerEvent[WebplayerEvent.GET_FRAME_RESPONSE]:
                this.onGetFrameResponse.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5], parameters[6]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvV2ViUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFlLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUM1RyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxpR0FBaUc7QUFDakcsTUFBTSxDQUFOLElBQVksY0FzQ1g7QUF0Q0QsV0FBWSxjQUFjO0lBQ3RCLG1FQUFZLENBQUE7SUFDWixxRUFBYSxDQUFBO0lBQ2IscURBQUssQ0FBQTtJQUNMLCtEQUFVLENBQUE7SUFDViwrRUFBa0IsQ0FBQTtJQUNsQixtRUFBWSxDQUFBO0lBQ1osNkRBQVMsQ0FBQTtJQUNULGlGQUFtQixDQUFBO0lBQ25CLDZFQUFpQixDQUFBO0lBQ2pCLHFFQUFhLENBQUE7SUFDYixzRUFBYSxDQUFBO0lBQ2IsNEVBQWdCLENBQUE7SUFDaEIsd0VBQWMsQ0FBQTtJQUNkLHNFQUFhLENBQUE7SUFDYiwwRkFBdUIsQ0FBQTtJQUN2Qiw0RUFBZ0IsQ0FBQTtJQUNoQiw0RUFBZ0IsQ0FBQTtJQUNoQixzRUFBYSxDQUFBO0lBQ2Isb0VBQVksQ0FBQTtJQUNaLHNFQUFhLENBQUE7SUFDYiw0REFBUSxDQUFBO0lBQ1IsZ0VBQVUsQ0FBQTtJQUNWLDhEQUFTLENBQUE7SUFDVCwwRUFBZSxDQUFBO0lBQ2YsOEVBQWlCLENB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