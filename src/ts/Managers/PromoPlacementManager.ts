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
        this._nativeBridge = nativeBridge;
        this._placementIds = [];
    }

    public addAuctionFillPromoPlacementId(placementId: string) {
        this._placementIds.push(placementId);
    }

    public getAuctionFillPlacementIds(): string[] {
        return this._placementIds;
    }

    public setPromoPlacementReady(placementId: string, campaign: Campaign): void {
        const placement = this.getPlacement(placementId);
        if(placement) {
            this.setPlacementState(placementId, PlacementState.READY);
            placement.setCurrentCampaign(campaign);
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
