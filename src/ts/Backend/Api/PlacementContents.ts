import { IPlacementContentParams } from 'Monetization/Native/PlacementContents';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { FinishState } from 'Core/Constants/FinishState';
import { BackendApi } from '../BackendApi';

export class PlacementContents extends BackendApi {
    public sendAdFinished(placementId: string, finishState: FinishState) {
        // EMPTY
    }
    public sendAdStarted(placementId: string) {
        // EMPTY
    }

    public createPlacementContent(placementId: string, params: IPlacementContentParams) {
        // EMPTY
    }

    public setPlacementContentState(placementId: string, state: PlacementContentState) {
        // EMPTY
    }
}
