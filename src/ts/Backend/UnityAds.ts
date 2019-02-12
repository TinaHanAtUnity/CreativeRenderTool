import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { WebView } from 'WebView';
import { PlacementState } from 'Ads/Models/Placement';

export class UnityAds {

    public static initialize(platform: Platform, gameId: string, listener: IUnityAdsListener, testMode: boolean = false) {
        let nativeBridge: NativeBridge;
        switch(platform) {
            case Platform.ANDROID:
                // todo: setting auto batching on causes some very weird behaviour with Node, should be investigated
                nativeBridge = new NativeBridge(UnityAds._backend, Platform.ANDROID);
                UnityAds._backend.setNativeBridge(nativeBridge);
                break;

            case Platform.IOS:
                nativeBridge = new NativeBridge(UnityAds._backend, Platform.IOS);
                UnityAds._backend.setNativeBridge(nativeBridge);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }

        UnityAds._backend.Api.Sdk.setGameId(gameId);
        UnityAds._backend.Api.Sdk.setTestMode(testMode);

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

    public static isReady(placementId: string) {
        return UnityAds._backend.Api.Placement.getPlacementState(placementId) === PlacementState[PlacementState.READY];
    }

    public static setBackend(backend: Backend) {
        UnityAds._backend = backend;
    }

    public static getBackend() {
        return UnityAds._backend;
    }

    private static _backend: Backend;
    private static _listener: IUnityAdsListener | undefined;
    private static _webView: WebView;

}
