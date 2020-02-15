import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UIWebViewBridge } from 'Core/Native/Bridge/UIWebViewBridge';
import { WKWebViewBridge } from 'Core/Native/Bridge/WKWebViewBridge';
import { Url } from 'Core/Utilities/Url';
import { WebView } from 'WebView';
import 'Workarounds';
import 'styl/main.styl';

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
    unityAdsWebviewInitTimestamp: number;
}

if (performance && performance.now) {
    (<IExtendedWindow>window).unityAdsWebviewInitTimestamp = performance.now();
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

const maxCallsToChangeOrientation = 5;

const changeOrientation = () => {
    // Since changeOrientation can be called by setTimeout or animationFrame,
    // which may or may not have arguments passed with them, internalChangeOrientation
    // is defined so it can take a single parameter representing the number of times
    // it has been called.
    const internalChangeOrientation = (callCount: number = 0) => {
        // Helper function to test if window.innerWidth/window.innerHeight have been set.
        const windowSizeReady = (): boolean => {
            if (callCount > maxCallsToChangeOrientation) {
                // We have waited too many times, allow to proceed to prevent a
                // infinite loop.
                return true;
            }

            if (window.innerWidth === 0 || window.innerHeight === 0) {
                // Some OSs will call changeOrientation with these set to 0 before
                // the window is shown.
                return false;
            }

            if (window.innerWidth === window.innerHeight) {
                // Some OSs will sometimes start with innerWidth && innerHeight equal,
                // in this case we can't determine the orientation.
                return false;
            }

            return true;
        };

        if (!windowSizeReady()) {
            // It is not yet know what orientation the window is.
            // Allow rendering engine to process before trying again.
            setTimeout(() => {
                internalChangeOrientation(callCount++);
            }, 0);
            return;
        }

        // Calculate orientation based on width and height.
        const orientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
        document.body.classList.remove('landscape');
        document.body.classList.remove('portrait');
        document.body.classList.add(orientation);
        runningResizeEvent = false;
    };
    internalChangeOrientation();
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
    switch (window.orientation) {
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

    document.body.classList.remove(...['ios-portrait', 'ios-landscape-left', 'ios-landscape-right', 'ios-portrait-upside-down']);

    if (iosOrientation) {
        document.body.classList.add(iosOrientation);
    }
};

document.addEventListener('DOMContentLoaded', onChangeOrientation, false);
window.addEventListener('orientationchange', onChangeOrientation, false);

if (typeof location !== 'undefined') {
    let nativeBridge: NativeBridge;
    switch (platform) {
        case 'android':
            nativeBridge = new NativeBridge(window.webviewbridge, Platform.ANDROID);
            break;

        case 'ios':
            if (window.webkit) {
                nativeBridge = new NativeBridge(new WKWebViewBridge(), Platform.IOS);
            } else {
                nativeBridge = new NativeBridge(new UIWebViewBridge(), Platform.IOS);
            }
            break;

        default:
            throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
    }

    const extWindow = <IExtendedWindow> window;
    extWindow.nativebridge = nativeBridge;
    extWindow.webview = new WebView(nativeBridge);
    document.addEventListener('DOMContentLoaded', () => extWindow.webview.initialize(), false);
}
