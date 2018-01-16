import { UnityAds } from 'Native/Backend/UnityAds';

export class Listener {

    public static sendReadyEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsReady(placement);
        }
    }

    public static sendStartEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsStart(placement);
        }
    }

    public static sendFinishEvent(placement: string, state: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsFinish(placement, state);
        }
    }

    public static sendErrorEvent(error: string, message: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsError(error, message);
        }
    }

    public static sendClickEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsClick(placement);
        }
    }

    public static sendPlacementStateChangedEvent(placement: string, oldState: string, newState: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsPlacementStateChanged(placement, oldState, newState);
        }
    }

}
