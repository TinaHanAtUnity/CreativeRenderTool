import { IAdsApi } from 'Ads/IAds';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';

export interface IPlacementIdMap<T> {
    [placementId: string]: T;
}

export class PlacementManager {
    private _ads: IAdsApi;
    private _configuration: AdsConfiguration;
    private _placementCampaignMap: IPlacementIdMap<Campaign>;

    constructor(ads: IAdsApi, configuration: AdsConfiguration) {
        this._ads = ads;
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
            this._ads.Placement.setPlacementState(placementId, newState);
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[newState]);

            if(newState === PlacementState.READY) {
                this._ads.Listener.sendReadyEvent(placementId);
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
            }
        }
    }
}
