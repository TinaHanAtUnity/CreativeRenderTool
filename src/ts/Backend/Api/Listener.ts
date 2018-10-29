import { BackendApi } from 'Backend/BackendApi';
import { UnityAds } from 'Backend/UnityAds';

export class Listener extends BackendApi {

    public sendReadyEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsReady(placement);
        }
    }

    public sendStartEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsStart(placement);
        }
    }

    public sendFinishEvent(placement: string, state: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsFinish(placement, state);
        }
    }

    public sendErrorEvent(error: string, message: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsError(error, message);
        }
    }

    public sendClickEvent(placement: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsClick(placement);
        }
    }

    public sendPlacementStateChangedEvent(placement: string, oldState: string, newState: string) {
        const listener = UnityAds.getListener();
        if(listener) {
            listener.onUnityAdsPlacementStateChanged(placement, oldState, newState);
        }
    }

}
