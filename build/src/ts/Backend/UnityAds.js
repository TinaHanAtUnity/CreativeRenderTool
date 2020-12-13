import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { WebView } from 'WebView';
import { PlacementState } from 'Ads/Models/Placement';
import { EventCategory } from 'Core/Constants/EventCategory';
import { LoadEvent } from 'Core/Native/LoadApi';
export class UnityAds {
    static initialize(platform, gameId, listener, testMode = false, enablePerPlacementLoad = false) {
        let nativeBridge;
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
    static show(placement) {
        UnityAds._webView.show(placement, {}, () => {
            return;
        });
    }
    static load(placement) {
        if (UnityAds._initialized) {
            const placements = {};
            placements[placement] = 1;
            UnityAds.getBackend().sendEvent(EventCategory[EventCategory.LOAD_API], LoadEvent[LoadEvent.LOAD_PLACEMENTS], placements);
        }
        else {
            const placements = {};
            placements[placement] = 1;
            UnityAds._loadRequests.push(placements);
        }
    }
    static getListener() {
        return UnityAds._listener;
    }
    static isReady(placementId) {
        return UnityAds._backend.Api.Placement.getPlacementState(placementId) === PlacementState[PlacementState.READY];
    }
    static setBackend(backend) {
        UnityAds._backend = backend;
        UnityAds._initialized = false;
        UnityAds._loadRequests = [];
    }
    static getBackend() {
        return UnityAds._backend;
    }
}
UnityAds._initialized = false;
UnityAds._loadRequests = [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVW5pdHlBZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvQmFja2VuZC9Vbml0eUFkcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQy9ELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDbEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFaEQsTUFBTSxPQUFPLFFBQVE7SUFFVixNQUFNLENBQUMsVUFBVSxDQUFDLFFBQWtCLEVBQUUsTUFBYyxFQUFFLFFBQTJCLEVBQUUsV0FBb0IsS0FBSyxFQUFFLHlCQUFrQyxLQUFLO1FBQ3hKLElBQUksWUFBMEIsQ0FBQztRQUMvQixRQUFRLFFBQVEsRUFBRTtZQUNkLHdHQUF3RztZQUN4RyxzR0FBc0c7WUFDdEcsS0FBSyxRQUFRLENBQUMsT0FBTztnQkFDakIsWUFBWSxHQUFHLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQ2hELE1BQU07WUFFVixLQUFLLFFBQVEsQ0FBQyxHQUFHO2dCQUNiLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3hFLFFBQVEsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNo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