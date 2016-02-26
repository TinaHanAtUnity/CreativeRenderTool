import { TestApi } from './TestApi';

export class Placement extends TestApi {

    public setPlacementState(placementId: string, placementState: string): any[] {
        return ['OK'];
    }

    public setDefaultPlacement(placementId: string): any[] {
        return ['OK'];
    }

}