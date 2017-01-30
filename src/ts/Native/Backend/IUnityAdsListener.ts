import { FinishState } from 'Constants/FinishState';
import { UnityAdsError } from 'Constants/UnityAdsError';

export interface IUnityAdsListener {

    onUnityAdsReady(placement: string): void;
    onUnityAdsStart(placement: string): void;
    onUnityAdsFinish(placement: string, state: FinishState): void;
    onUnityAdsError(error: UnityAdsError, message: string): void;
    onUnityAdsClick(placement: string): void;

}
