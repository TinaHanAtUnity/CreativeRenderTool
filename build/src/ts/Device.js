import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UIWebViewBridge } from 'Core/Native/Bridge/UIWebViewBridge';
import { WKWebViewBridge } from 'Core/Native/Bridge/WKWebViewBridge';
import { Url } from 'Core/Utilities/Url';
import { WebView } from 'WebView';
import 'Workarounds';
import 'styl/main.styl';
window.initTimestamp = Date.now();
let platform = null;
if (typeof location !== 'undefined') {
    platform = Url.getQueryParameter(location.search, 'platform');
}
let isIOS7 = null;
if (typeof navigator !== 'undefined') {
    isIOS7 = navigator.userAgent.match(/(iPad|iPhone|iPod);.*CPU.*OS 7_\d/i);
}
const animationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
let runningResizeEvent = false;
const changeOrientation = () => {
    // Calculate orientation based on width and height.
    let orientation = 'portrait';
    if (document.documentElement.clientHeight !== 0) {
        orientation = document.documentElement.clientWidth / document.documentElement.clientHeight >= 1 ? 'landscape' : 'portrait';
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
    }
    else {
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
            iosOrientation = 'ios-landscape-left';
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
    let nativeBridge;
    switch (platform) {
        case 'android':
            nativeBridge = new NativeBridge(window.webviewbridge, Platform.ANDROID);
            break;
        case 'ios':
            if (window.webkit) {
                nativeBridge = new NativeBridge(new WKWebViewBridge(), Platform.IOS);
            }
            else {
                nativeBridge = new NativeBridge(new UIWebViewBridge(), Platform.IOS);
            }
            break;
        default:
            throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
    }
    const extWindow = window;
    extWindow.nativebridge = nativeBridge;
    extWindow.webview = new WebView(nativeBridge);
    document.addEventListener('DOMContentLoaded', () => extWindow.webview.initialize(), false);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGV2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RzL0RldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDckUsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDbEMsT0FBTyxhQUFhLENBQUM7QUFDckIsT0FBTyxnQkFBZ0IsQ0FBQztBQVFOLE1BQU8sQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRXJELElBQUksUUFBUSxHQUFrQixJQUFJLENBQUM7QUFDbkMsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7SUFDakMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0NBQ2pFO0FBRUQsSUFBSSxNQUFNLEdBQTRCLElBQUksQ0FBQztBQUMzQyxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRTtJQUNsQyxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztDQUM1RTtBQUVELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsSUFBSSxNQUFNLENBQUMsMkJBQTJCLENBQUM7QUFDMUYsSUFBSSxrQkFBa0IsR0FBRyxLQUFLLENBQUM7QUFFL0IsTUFBTSxpQkFBaUIsR0FBRyxHQUFHLEVBQUU7SUFDM0IsbURBQW1EO0lBRW5ELElBQUksV0FB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