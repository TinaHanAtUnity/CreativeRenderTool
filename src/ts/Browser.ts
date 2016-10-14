import 'Workarounds';
import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { Platform } from 'Constants/Platform';
import { Backend } from 'Native/Backend/Backend';

interface IExtendedWindow extends Window {
    nativebridge: NativeBridge;
    webview: WebView;
}

let resizeHandler = (event?: Event) => {
    let currentOrientation = document.body.classList.contains('landscape') ? 'landscape' : document.body.classList.contains('portrait') ? 'portrait' : null;
    let newOrientation: string = window.innerWidth / window.innerHeight >= 1 ? 'landscape' : 'portrait';
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

let nativeBridge = new NativeBridge(new Backend(), Platform.ANDROID);

let extWindow = <IExtendedWindow> window;
extWindow.nativebridge = nativeBridge;
extWindow.webview = new WebView(nativeBridge);

let initializeButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById('initialize');
initializeButton.addEventListener('click', () => {
    initializeButton.disabled = true;
    extWindow.webview.initialize();
}, false);
