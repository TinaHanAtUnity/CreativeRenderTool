import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UIWebViewBridge } from 'Core/Native/Bridge/UIWebViewBridge';
import { WKWebViewBridge } from 'Core/Native/Bridge/WKWebViewBridge';
import { Url } from 'Core/Utilities/Url';
import { WebView } from 'WebView';
import 'Workarounds';

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
}

let platform: string | null = null;
if (typeof location !== 'undefined') {
    platform = Url.getQueryParameter(location.search, 'platform');
}

let isIOS7: RegExpMatchArray | null = null;
if (typeof navigator !== 'undefined') {
    isIOS7 = navigator.userAgent.match(/(iPad|iPhone|iPod);.*CPU.*OS 7_\d/i);
}

const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let runningResizeEvent = false;

const changeOrientation = () => {

    // Calculate orientation based on width and height by default
    let orientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';

    if (typeof window.orientation !== 'undefined' && platform === 'ios' && !isIOS7) {
        orientation = (Math.abs(<number>window.orientation) === 90) ? 'landscape' : 'portrait';
    }

    document.body.classList.remove('landscape');
    document.body.classList.remove('portrait');
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

document.addEventListener('DOMContentLoaded', resizeHandler, false);
window.addEventListener('resize', resizeHandler, false);

// 'resize' event doesn't work when switching directly from one landscape orientation to another
// so we need to utilize 'orientationchange' event.
const onChangeOrientation = () => {
    if (typeof window.orientation === 'undefined' || platform !== 'ios' || isIOS7) {
        return;
    }

    let iosOrientation = '';
    switch(window.orientation) {
        case 180:
            iosOrientation = 'ios-portrait-upside-down';
            break;
        case 90:
            iosOrientation  = 'ios-landscape-left';
            break;
        case -90:
            iosOrientation = 'ios-landscape-right';
            break;
        default:
            iosOrientation = 'ios-portrait';
    }

    document.body.classList.remove(...['ios-landscape-left', 'ios-landscape-right', 'ios-portrait-upside-down']);

    if(iosOrientation) {
        document.body.classList.add(iosOrientation);
    }
};

document.addEventListener('DOMContentLoaded', onChangeOrientation, false);
window.addEventListener('orientationchange', onChangeOrientation, false);

if(typeof location !== 'undefined') {
    let nativeBridge: NativeBridge;
    switch(platform) {
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

    // SafeDK garbage
    // tslint:disable-next-line
    (<any>extWindow.webview)._configuration = {
        getPlacement: () => { return { getCurrentCampaign: () => 'SafeDK violates Unity Ads SDK internals, please disable your SafeDK integration.' }; }
    };

    document.addEventListener('DOMContentLoaded', () => extWindow.webview.initialize(), false);
}
