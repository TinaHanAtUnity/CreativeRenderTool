import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { PlacementState } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';

export class PlacementManager {
    private _nativeBridge: NativeBridge;
    private _configuration: Configuration;

    constructor(nativeBridge: NativeBridge, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
    }

    public setAllPlacementStates(newState: PlacementState) {
        // todo: implement method
    }

    public setCampaign(placementId: string, campaign: Campaign) {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            placement.setCurrentCampaign(campaign);
        }
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public clearCampaigns(): void {
        for(const placementId of this._configuration.getPlacementIds()) {
            this._configuration.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }
}
