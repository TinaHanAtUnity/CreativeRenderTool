import 'Workarounds';

import { NativeBridge } from 'NativeBridge';
import WebView from 'WebView';

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
let nativeBridge: NativeBridge = new NativeBridge(window.webviewbridge);
window['nativebridge'] = nativeBridge;

let webView: WebView = new WebView(nativeBridge);
window['webview'] = webView;

async function printDelayed(elements: string[]) {
    for (const element of elements) {
        await delay(200);
        console.log(element);
    }
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

printDelayed(["Hello", "beautiful", "asynchronous", "world"]).then(() => {
    console.log();
    console.log("Printed every element!");
});
