import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { FinishState } from 'Core/Constants/FinishState';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { IMonetizationApi } from 'Monetization/IMonetization';
import { IPlacementContentType } from 'Monetization/Native/PlacementContents';

export interface IPlacementContent {
    state: PlacementContentState;
    type: IPlacementContentType;
}

export interface IPlacementContentMap {
    [id: string]: IPlacementContent;
}

export interface IPlacementContentParams {
    type: IPlacementContentType;
    rewarded?: boolean;
}

export class PlacementContentManager {
    private _monetization: IMonetizationApi;
    private _configuration: AdsConfiguration;
    private _placementContentMap: IPlacementContentMap = {};

    constructor(monetization: IMonetizationApi, configuration: AdsConfiguration, campaignManager: CampaignManager) {
        this._monetization = monetization;
        this._configuration = configuration;
        campaignManager.onCampaign.subscribe((placementId, campaign) => this.createPlacementContent(placementId, campaign));
        campaignManager.onNoFill.subscribe((placementId) => this.onPlacementNoFill(placementId));
    }

    public createPlacementContent(placementId: string, campaign: Campaign) {
        const params = this.createPlacementContentParams(this._configuration.getPlacement(placementId), campaign);
        return this._monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            this.setPlacementContentState(placementId, PlacementContentState.READY);
            this._monetization.Listener.sendPlacementContentReady(placementId);
        });
    }

    public setPlacementContentState(placementId: string, state: PlacementContentState) {
        const placementContent = this._placementContentMap[placementId];
        if (!placementContent) {
            return Promise.resolve();
        }
        const previousState = placementContent.state;
        let promise = this._monetization.PlacementContents.setPlacementContentState(placementId, state);
        placementContent.state = state;
        if (previousState !== state) {
            promise = promise.then(() => this._monetization.Listener.sendPlacementContentStateChanged(placementId, previousState, state));
        }
        return promise;
    }

    public setCurrentAdUnit(placementId: string, adUnit: AbstractAdUnit) {
        adUnit.onStart.subscribe(() => this.onAdUnitStart(placementId));
        adUnit.onClose.subscribe(() => this.onAdUnitFinish(placementId, adUnit.getFinishState()));
    }

    private createPlacementContentParams(placement: Placement, campaign: Campaign): IPlacementContentParams {
            return {
                type: IPlacementContentType.SHOW_AD,
                rewarded: !placement.allowSkip()
            };
    }

    private setAdPlacementContentStates(state: PlacementContentState) {
        for (const placementId of Object.keys(this._placementContentMap)) {
            const placementContent = this._placementContentMap[placementId];
            if (placementContent.type === IPlacementContentType.SHOW_AD || placementContent.type === IPlacementContentType.PROMO_AD) {
                this.setPlacementContentState(placementId, state);
            }
        }
    }

    private onAdUnitFinish(placementId: string, finishState: FinishState) {
        return this._monetization.PlacementContents.sendAdFinished(placementId, finishState);
    }
    private onAdUnitStart(placementId: string) {
        this._monetization.PlacementContents.sendAdStarted(placementId);
        this.setAdPlacementContentStates(PlacementContentState.WAITING);
    }

    private onPlacementNoFill(placementId: string) {
        const params = this.createNoFillParams();
        return this._monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            this.setPlacementContentState(placementId, PlacementContentState.NO_FILL);
        });
    }

    private createNoFillParams(): IPlacementContentParams {
        return {
            type: IPlacementContentType.NO_FILL
        };
    }
}
