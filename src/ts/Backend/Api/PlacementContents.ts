import { IPlacementContentParams } from 'Monetization/Native/PlacementContents';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { FinishState } from 'Core/Constants/FinishState';

export class PlacementContents {
    public static sendAdFinished(placementId: string, finishState: FinishState) {
        // EMPTY
    }
    public static sendAdStarted(placementId: string) {
        // EMPTY
    }

    public static createPlacementContent(placementId: string, params: IPlacementContentParams) {
        // EMPTY
    }

    public static setPlacementContentState(placementId: string, state: PlacementContentState) {
        // EMPTY
    }
}
