import { UnityAds } from 'Native/Backend/UnityAds';
import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { PlacementState } from 'Models/Placement';

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
            listener.onUnityAdsFinish(placement, FinishState[state]);
        }
    }

    public static sendErrorEvent(error: string, message: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsError(UnityAdsError[error], message);
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
            listener.onUnityAdsPlacementStateChanged(placement, PlacementState[oldState], PlacementState[newState]);
        }
    }

}
