import 'Workarounds';
import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { WKWebViewBridge } from 'Native/WKWebViewBridge';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';
import { UIWebViewBridge } from 'Native/UIWebViewBridge';

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
}

const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let runningResizeEvent = false;

const changeOrientation = () => {

    let orientation: string = "";
    if (typeof window.orientation !== "undefined") {
        orientation = (Math.abs(<number>window.orientation) === 90) ? "landscape" : "portrait";
    } else {
        orientation = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
    }

    document.body.classList.remove("landscape");
    document.body.classList.remove("portrait");
    document.body.classList.add(orientation);

    runningResizeEvent = false;
};

const resizeHandler = (event?: Event) => {

    if (runningResizeEvent) {
        return;
    }

    runningResizeEvent = true;

    if (typeof animationFrame === 'function') {
        animationFrame(changeOrientation);
    } else {
        setTimeout(changeOrientation, 100);
    }
};

resizeHandler();
window.addEventListener('resize', resizeHandler, false);

if(typeof location !== 'undefined') {
    let nativeBridge: NativeBridge;
    switch(Url.getQueryParameter(location.search, 'platform')) {
        case 'android':
            nativeBridge = new NativeBridge(window.webviewbridge, Platform.ANDROID);
            break;

        case 'ios':
            if(window.webkit) {
                nativeBridge = new NativeBridge(new WKWebViewBridge(), Platform.IOS, false);
            } else {
                nativeBridge = new NativeBridge(new UIWebViewBridge(), Platform.IOS, false);
            }
            break;

        default:
            throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
    }

    const extWindow = <IExtendedWindow> window;
    extWindow.nativebridge = nativeBridge;
    extWindow.webview = new WebView(nativeBridge);

    extWindow.webview.initialize();
}
