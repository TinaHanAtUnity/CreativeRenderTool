import 'Workarounds';
import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { WKWebViewBridge } from 'Native/WKWebViewBridge';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';
import { UIWebViewBridge } from 'Native/UIWebViewBridge';

/* This should be gone, once new TypeScript version is released that supports screen API*/
interface IExtendedScreen extends Screen {
    orientation?: {
        type?: string;
    };
}

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
    screen: IExtendedScreen;
}

const isIOS7: RegExpMatchArray | null = navigator.userAgent.match(/(iPad|iPhone|iPod);.*CPU.*OS 7_\d/i);

const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let runningResizeEvent = false;

const changeOrientation = () => {

    const screen = <IExtendedScreen>window.screen;

    /* Calculate orientation based on width and height by default */
    let orientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';

    if (typeof window.orientation !== "undefined") {
        /* Use window.orientation if available, works better for ios devices, exclude ios 7 */
        if (!isIOS7) {
            orientation = (Math.abs(<number>window.orientation) === 90) ? "landscape" : "portrait";
        }

        /* Use screen API if available */
        if (screen && screen.orientation && screen.orientation.type) {
            orientation = /landscape/g.test(screen.orientation.type) ? "landscape" : "portrait";
        }
    }

    document.body.classList.remove("landscape");
    document.body.classList.remove("portrait");
    document.body.classList.add(orientation);

    runningResizeEvent = false;
};

const resizeHandler = () => {

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
