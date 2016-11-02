import 'Workarounds';
import { NativeBridge } from 'Native/NativeBridge';
import { WebView } from 'WebView';
import { Platform } from 'Constants/Platform';
import { Backend } from 'Native/Backend/Backend';

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

if(window.parent !== window) {
    const initializeButton: HTMLButtonElement = <HTMLButtonElement>window.parent.document.getElementById('initialize');
    initializeButton.addEventListener('click', (event: Event) => {
        event.preventDefault();
        initializeButton.disabled = true;

        const abGroupElement = <HTMLInputElement>window.parent.document.getElementById('abGroup');
        const autoSkipElement = <HTMLInputElement>window.parent.document.getElementById('autoSkip');
        const publicStorage: any = {
            test: {}
        };

        if(abGroupElement.value.length) {
            publicStorage.test.abGroup = {
                value: parseInt(abGroupElement.value, 10),
                ts: Date.now()
            };
        }
        if(autoSkipElement.checked) {
            publicStorage.test.autoSkip = {
                value: true,
                ts: Date.now()
            };
        }

        window.sessionStorage.clear();
        window.sessionStorage.setItem('PUBLIC', JSON.stringify(publicStorage));

        let nativeBridge: NativeBridge;
        const platformElement = <HTMLSelectElement>window.parent.document.getElementById('platform');
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

        const extWindow = <IExtendedWindow> window;
        extWindow.nativebridge = nativeBridge;
        extWindow.webview = new WebView(nativeBridge);
        extWindow.webview.initialize();
    }, false);
}
