import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { WebView } from 'WebView';

export class UnityAds {

    public static initialize(platform: Platform, gameId: string, listener: IUnityAdsListener, testMode: boolean = false) {
        let backend: Backend;
        let nativeBridge: NativeBridge;
        switch(platform) {
            case Platform.ANDROID:
                // todo: setting auto batching on causes some very weird behaviour with Node, should be investigated
                backend = new Backend(Platform.ANDROID);
                nativeBridge = new NativeBridge(backend, Platform.ANDROID, false);
                backend.setNativeBridge(nativeBridge);
                break;

            case Platform.IOS:
                backend = new Backend(Platform.IOS);
                nativeBridge = new NativeBridge(backend, Platform.IOS, false);
                backend.setNativeBridge(nativeBridge);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }

        backend.Api.Sdk.setGameId(gameId);
        backend.Api.Sdk.setTestMode(testMode);

        UnityAds._listener = listener;

        UnityAds._webView = new WebView(nativeBridge);
        UnityAds._webView.initialize();
    }

    public static show(placement: string) {
        UnityAds._webView.show(placement, {}, () => {
            return;
        });
    }

    public static getListener() {
        return UnityAds._listener;
    }

    private static _listener: IUnityAdsListener | undefined;
    private static _webView: WebView;

}
