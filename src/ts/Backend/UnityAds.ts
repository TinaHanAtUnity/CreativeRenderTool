import { Backend } from 'Backend/Backend';
import { IUnityAdsListener } from 'Backend/IUnityAdsListener';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { WebView } from 'WebView';
import { PlacementState } from 'Ads/Models/Placement';
import { EventCategory } from 'Core/Constants/EventCategory';
import { LoadEvent } from 'Core/Native/LoadApi';

export class UnityAds {

    public static initialize(platform: Platform, gameId: string, listener: IUnityAdsListener, testMode: boolean = false, enablePerPlacementLoad: boolean = false): Promise<void> {
        let nativeBridge: NativeBridge;
        switch (platform) {
            // Setting auto batching on does not work in a "single-threaded" environment due to callbacks and events
            // being triggered out of order. This could in theory be fixed by running the backend in a web worker?
            case Platform.ANDROID:
                nativeBridge = new NativeBridge(UnityAds._backend, Platform.ANDROID, false);
                UnityAds._backend.setNativeBridge(nativeBridge);
                break;

            case Platform.IOS:
                nativeBridge = new NativeBridge(UnityAds._backend, Platform.IOS, false);
                UnityAds._backend.setNativeBridge(nativeBridge);
                break;

            default:
                throw new Error('Unity Ads webview init failure: no platform defined, unable to initialize native bridge');
        }

        UnityAds._backend.Api.Sdk.setGameId(gameId);
        UnityAds._backend.Api.Sdk.setTestMode(testMode);
        UnityAds._backend.Api.Sdk.setUsePerPlacementLoad(enablePerPlacementLoad);

        UnityAds._listener = listener;

        UnityAds._webView = new WebView(nativeBridge);
        return UnityAds._webView.initialize().then(() => {
            UnityAds._initialized = true;
            UnityAds.getBackend().sendEvent(EventCategory[EventCategory.LOAD_API], LoadEvent[LoadEvent.LOAD_PLACEMENTS], ...UnityAds._loadRequests);
            UnityAds._loadRequests = [];
        });
    }

    public static show(placement: string) {
        UnityAds._webView.show(placement, {}, () => {
            return;
        });
    }

    public static load(placement: string) {
        if (UnityAds._initialized) {
            const placements: {[key: string]: number} = {};
            placements[placement] = 1;
            UnityAds.getBackend().sendEvent(EventCategory[EventCategory.LOAD_API], LoadEvent[LoadEvent.LOAD_PLACEMENTS], placements);
        } else {
            UnityAds._loadRequests.push(placement);
        }
    }

    public static getListener() {
        return UnityAds._listener;
    }

    public static isReady(placementId: string) {
        return UnityAds._backend.Api.Placement.getPlacementState(placementId) === PlacementState[PlacementState.READY];
    }

    public static setBackend(backend: Backend) {
        UnityAds._backend = backend;
        UnityAds._initialized = false;
        UnityAds._loadRequests = [];
    }

    public static getBackend() {
        return UnityAds._backend;
    }

    private static _backend: Backend;
    private static _listener: IUnityAdsListener | undefined;
    private static _webView: WebView;
    private static _initialized: boolean = false;
    private static _loadRequests: string[] = [];

}
