import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export interface IPlacementIdMap<T> {
    [placementId: string]: T;
}

export class PlacementManager {
    private _nativeBridge: NativeBridge;
    private _configuration: AdsConfiguration;
    private _placementCampaignMap: IPlacementIdMap<Campaign>;

    constructor(nativeBridge: NativeBridge, configuration: AdsConfiguration) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._placementCampaignMap = {};
    }

    public addCampaignPlacementIds(placementId: string, campaign: Campaign) {
        this._placementCampaignMap[placementId] = campaign;
    }

    public getPlacementCampaignMap(adType: string): IPlacementIdMap<Campaign> {
        const placementIds = Object.keys(this._placementCampaignMap);
        const res: IPlacementIdMap<Campaign> = {};

        placementIds.forEach((placementId) => {
            if (this._placementCampaignMap[placementId].getAdType() === adType) {
                res[placementId] = this._placementCampaignMap[placementId];
            }
        });

        return res;
    }

    public clear() {
        this._placementCampaignMap = {};
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
