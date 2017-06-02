import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { PlacementState } from 'Models/Placement';

export interface IUnityAdsListener {

    onUnityAdsReady(placement: string): void;
    onUnityAdsStart(placement: string): void;
    onUnityAdsFinish(placement: string, state: FinishState): void;
    onUnityAdsError(error: UnityAdsError, message: string): void;
    onUnityAdsClick(placement: string): void;
    onUnityAdsPlacementStateChanged(placement: string, oldState: PlacementState, newState: PlacementState): void;
    onUnityAdsInitiatePurchaseEvent(eventString: string): void;
}
