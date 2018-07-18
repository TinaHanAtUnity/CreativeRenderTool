import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { Placement, PlacementState } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { SdkStats } from 'Utilities/SdkStats';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

export interface IMap<T> {
    [placementId: string]: T;
}

export class PlacementManager {
    private _nativeBridge: NativeBridge;
    private _configuration: Configuration;
    private _auctionPlacementIds: IMap<boolean>;

    constructor(nativeBridge: NativeBridge, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._auctionPlacementIds = {};
    }

    public addAuctionFillPlacementId(placementId: string) {
        this._auctionPlacementIds[placementId] = true;
    }

    public clearAuctionFillPlacementIds() {
        this._auctionPlacementIds = {};
    }

    public getAuctionFillPlacementIds(): string[] {
        return Object.keys(this._auctionPlacementIds);
    }

    public getAuctionFillPlacementIdsCount(): number {
        return this.getAuctionFillPlacementIds().length;
    }

    public setPlacementState(placementId: string, newState: PlacementState) {
        const placement: Placement = this._configuration.getPlacement(placementId);
        const oldState: PlacementState = placement.getState();

        if (placement) {
            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }

    public setAllPlacementStates(newState: PlacementState) {
        for(const placementId of this._configuration.getPlacementIds()) {
            this.setPlacementState(placementId, newState);
        }
    }

    public setPlacementReady(placementId: string, campaign: Campaign): void {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            this.setPlacementState(placementId, PlacementState.READY);
            placement.setCurrentCampaign(campaign);
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
