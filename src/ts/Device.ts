import 'Workarounds';
import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { IosWebViewBridge } from 'Native/IosWebViewBridge';
import { Platform } from 'Constants/Platform';
import { Url } from 'Utilities/Url';

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
}

const resizeHandler = (event?: Event) => {
    const currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
    const newOrientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
    if(currentOrientation) {
        if(currentOrientation !== newOrientation) {
            document.body.classList.remove(currentOrientation);
            document.body.classList.add(newOrientation);
        }
    } else {
        document.body.classList.add(newOrientation);
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
            nativeBridge = new NativeBridge(new IosWebViewBridge(), Platform.IOS, false);
            break;

        default:
            throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
    }

    const extWindow = <IExtendedWindow> window;
    extWindow.nativebridge = nativeBridge;
    extWindow.webview = new WebView(nativeBridge);

    extWindow.webview.initialize();
}
