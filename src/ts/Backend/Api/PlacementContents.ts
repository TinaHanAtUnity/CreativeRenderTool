import { BackendApi } from 'Backend/BackendApi';
import { FinishState } from 'Core/Constants/FinishState';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { IPlacementContentParams } from 'Monetization/Native/PlacementContents';

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
