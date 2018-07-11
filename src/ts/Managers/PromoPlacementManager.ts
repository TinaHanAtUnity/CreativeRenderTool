import { Placement, PlacementState } from 'Models/Placement';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { SdkStats } from 'Utilities/SdkStats';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

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

    public setPromoPlacementReady(placementId: string) {
        this._nativeBridge.Sdk.logInfo(placementId);
        this.setPlacementState(placementId, PlacementState.READY);
    }

    public setPromoPlacementsReady(): void {
        for (const placementId of this._placementIds) {
            this.setPlacementState(placementId, PlacementState.READY);
        }
    }

    public setActivePlacementId(activePlacementId: string) {
        Object.keys(this._promoPlacements).forEach((placementId) => {
            if (activePlacementId !== placementId) {
                this.setPlacementState(placementId, PlacementState.WAITING);
            }
        });
    }

    public getPlacement(placementId: string): Placement | undefined {
        return this._promoPlacements[placementId];
    }

    public setPlacementState(placementId: string, newState: PlacementState): void {
        const placement: Placement = this._promoPlacements[placementId];
        if (placement) {
            const oldState: PlacementState = placement.getState();

            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
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
