import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { Placement, PlacementState } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { SdkStats } from 'Utilities/SdkStats';

export class PlacementManager {
    private _nativeBridge: NativeBridge;
    private _configuration: Configuration;

    constructor(nativeBridge: NativeBridge, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
    }

    public setPlacementState(placementId: string, newState: PlacementState) {
        const placement: Placement = this._configuration.getPlacement(placementId);
        const oldState: PlacementState = placement.getState();

        placement.setState(newState);
        this.sendPlacementStateChange(placementId, oldState, newState);
    }

    public setAllPlacementStates(newState: PlacementState) {
        for(const placementId of this._configuration.getPlacementIds()) {
            this.setPlacementState(placementId, newState);
        }
    }

    public setCampaign(placementId: string, campaign: Campaign | undefined) {
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

    private sendPlacementStateChange(placementId: string, oldState: PlacementState, newState: PlacementState) {
        if(oldState !== newState) {
            this._nativeBridge.Placement.setPlacementState(placementId, newState);
            this._nativeBridge.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[newState]);

            if(newState === PlacementState.READY) {
                this._nativeBridge.Listener.sendReadyEvent(placementId);
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
            }
        }
    }
}
