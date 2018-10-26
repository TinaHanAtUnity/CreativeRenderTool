import { BackendApi } from 'Backend/BackendApi';

export class Placement extends BackendApi {

    public setDefaultPlacement(placement: string) {
        this._defaultPlacement = placement;
    }

    public getDefaultPlacement() {
        return this._defaultPlacement;
    }

    public setPlacementState(placement: string, state: string) {
        this._placements[placement] = state;
    }

    public getPlacementState(placement?: string) {
        if(!placement) {
            placement = this._defaultPlacement;
        }
        if(placement) {
            return this._placements[placement];
        }
        return 'NOT_AVAILABLE';
    }

    private _defaultPlacement: string | undefined;
    private _placements: { [key: string]: string } = {};

}
