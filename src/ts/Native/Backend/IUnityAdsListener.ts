import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { PlacementState } from 'Models/Placement';

export interface IUnityAdsListener {

    onUnityAdsReady(placement: string): void;
    onUnityAdsStart(placement: string): void;
    onUnityAdsFinish(placement: string, state: string): void;
    onUnityAdsError(error: string, message: string): void;
    onUnityAdsClick(placement: string): void;
    onUnityAdsPlacementStateChanged(placement: string, oldState: string, newState: string): void;

}
