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

let initializeButton: HTMLButtonElement = <HTMLButtonElement>window.parent.document.getElementById('initialize');
initializeButton.addEventListener('click', (event: Event) => {
    event.preventDefault();
    initializeButton.disabled = true;

    let abGroupElement = <HTMLInputElement>window.parent.document.getElementById('abGroup');
    if(abGroupElement.value.length) {
        window.sessionStorage.setItem('PUBLIC', JSON.stringify({
            test: {
                abGroup: {
                    value: abGroupElement.value,
                    ts: Date.now()
                }
            }
        }));
    }

    let nativeBridge: NativeBridge;
    let platformElement = <HTMLSelectElement>window.parent.document.getElementById('platform');
    switch(platformElement.value) {
        case 'android':
            nativeBridge = new NativeBridge(new Backend(), Platform.ANDROID);
            break;

        case 'ios':
            nativeBridge = new NativeBridge(new Backend(), Platform.IOS, false);
            break;

        default:
            throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
    }

    let extWindow = <IExtendedWindow> window;
    extWindow.nativebridge = nativeBridge;
    extWindow.webview = new WebView(nativeBridge);
    extWindow.webview.initialize();
}, false);
