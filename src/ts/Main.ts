/// <reference path="../../typings/main.d.ts" />

import 'Workarounds';

import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { IosWebViewBridge } from 'Native/IosWebViewBridge';

let resizeHandler: EventListener = (event: Event) => {
    let currentOrientation: string = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
    let newOrientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
    if (currentOrientation) {
        if (currentOrientation !== newOrientation) {
            document.body.classList.remove(currentOrientation);
            document.body.classList.add(newOrientation);
        }
    } else {
        document.body.classList.add(newOrientation);
    }
};
resizeHandler(null);
window.addEventListener('resize', resizeHandler, false);

/* tslint:disable:no-string-literal */
let nativeBridge: NativeBridge = null;
if(window && window.webviewbridge) {
    nativeBridge = new NativeBridge(window.webviewbridge);
} else {
    nativeBridge = new NativeBridge(new IosWebViewBridge());
}
window['nativebridge'] = nativeBridge;

let webView: WebView = new WebView(nativeBridge);
window['webview'] = webView;
webView.initialize();
