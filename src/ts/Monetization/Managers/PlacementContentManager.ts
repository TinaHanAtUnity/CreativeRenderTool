import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { IPlacementContentType } from 'Monetization/Native/PlacementContents';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement } from 'Ads/Models/Placement';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { FinishState } from 'Core/Constants/FinishState';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';

export interface IPlacementContent {
    state: PlacementContentState;
    type: IPlacementContentType;
}

export interface IPlacementContentMap {
    [id: string]: IPlacementContent;
}

export class PlacementContentManager {
    private _nativeBridge: NativeBridge;
    private _configuration: AdsConfiguration;
    private _placementContentMap: IPlacementContentMap = {};
    private _placementManager: PlacementManager;

    constructor(nativeBridge: NativeBridge, configuration: AdsConfiguration, campaignManager: CampaignManager, placementManager: PlacementManager) {
        this._nativeBridge = nativeBridge;
        this._configuration = configuration;
        this._placementManager = placementManager;
        campaignManager.onCampaign.subscribe((placementId, campaign) => this.createPlacementContent(placementId, campaign));
        campaignManager.onNoFill.subscribe((placementId) => this.onPlacementNoFill(placementId));
    }

    public createPlacementContent(placementId: string, campaign: Campaign) {
        const params = this.createPlacementContentParams(this._configuration.getPlacement(placementId), campaign);
        return this._nativeBridge.Monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            this.setPlacementContentState(placementId, PlacementContentState.READY);
            return this._nativeBridge.Monetization.Listener.sendPlacementContentReady(placementId);
        });
    }

    public setPlacementContentState(placementId: string, state: PlacementContentState) {
        const placementContent = this._placementContentMap[placementId];
        if (!placementContent) {
            return Promise.resolve();
        }
        const previousState = placementContent.state;
        let promise = this._nativeBridge.Monetization.PlacementContents.setPlacementContentState(placementId, state);
        placementContent.state = state;
        if (previousState !== state) {
            promise = promise.then(() => this._nativeBridge.Monetization.Listener.sendPlacementContentStateChanged(placementId, previousState, state));
        }
        return promise;
    }

    public setCurrentAdUnit(placementId: string, adUnit: AbstractAdUnit) {
        adUnit.onStart.subscribe(() => this.onAdUnitStart(placementId));
        adUnit.onClose.subscribe(() => this.onAdUnitFinish(placementId, adUnit.getFinishState()));
    }

    private createPlacementContentParams(placement: Placement, campaign: Campaign) {
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
        return this._nativeBridge.Monetization.PlacementContents.sendAdFinished(placementId, finishState);
    }
    private onAdUnitStart(placementId: string) {
        this._nativeBridge.Monetization.PlacementContents.sendAdStarted(placementId);
        this.setAdPlacementContentStates(PlacementContentState.WAITING);
    }

    private onPlacementNoFill(placementId: string) {
        const params = this.createNoFillParams();
        return this._nativeBridge.Monetization.PlacementContents.createPlacementContent(placementId, params).then(() => {
            if (!(placementId in this._placementContentMap)) {
                this._placementContentMap[placementId] = {
                    type: params.type,
                    state: PlacementContentState.WAITING
                };
            }
            this.setPlacementContentState(placementId, PlacementContentState.NO_FILL);
        });
    }

    private createNoFillParams() {
        return {
            type: IPlacementContentType.NO_FILL
        };
    }
}
