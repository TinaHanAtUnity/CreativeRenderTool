import { Placement, PlacementState } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { SdkStats } from 'Utilities/SdkStats';
import { Campaign } from 'Models/Campaign';

export interface IPlacementMap {
    [placementId: string]: Placement;
}

export class PromoPlacementManager {

    private _promoPlacements: IPlacementMap;
    private _placementIds: string[];
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge, configuration: Configuration) {
        this._promoPlacements = this.getPromoPlacements(configuration);
        this._placementIds = configuration.getPlacementIds();
        this._nativeBridge = nativeBridge;
    }

    public getPromoPlacementIds(): string[] {
        const promoPlacements = this._promoPlacements;
        const out: string[] = [];
        Object.keys(promoPlacements).forEach((placementId) => {
            out.push(placementId);
        });

        return out;
    }

    public setPromoPlacementReady(placementId: string, campaign: Campaign): void {
        this._nativeBridge.Sdk.logInfo(placementId);
        this.setPlacementState(placementId, PlacementState.READY);

        const placement = this.getPlacement(placementId);
        if(placement) {
            placement.setCurrentCampaign(campaign);
        }
    }

    public setPromoPlacementsReady(): void {
        for (const placementId of this._placementIds) {
            this.setPlacementState(placementId, PlacementState.READY);
        }
    }

    public setPlacementState(placementId: string, newState: PlacementState): void {
        const placement: Placement = this._promoPlacements[placementId];
        if (placement) {
            const oldState: PlacementState = placement.getState();

            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }

    private getPlacement(placementId: string): Placement | undefined {
        return this._promoPlacements[placementId];
    }

    private sendPlacementStateChange(placementId: string, oldState: PlacementState, newState: PlacementState): void {
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

    private getPromoPlacements(configuration: Configuration): IPlacementMap {
        const placements = configuration.getPlacements();
        const promos: IPlacementMap = {};
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            const adTypes = placement.getAdTypes();
            if (adTypes && adTypes.indexOf('IAP') > -1) {
                promos[placementId] = placement;
            }
        });
        return promos;
    }
}
