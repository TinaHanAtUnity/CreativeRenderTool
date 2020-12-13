import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';
import { IPlacementContentType } from 'Monetization/Native/PlacementContents';
export class PlacementContentManager {
    constructor(monetization, configuration, campaignManager) {
        this._placementContentMap = {};
        this._monetization = monetization;
        this._configuration = configuration;
        campaignManager.onCampaign.subscribe((placementId, campaign) => this.createPlacementContent(placementId, campaign));
        campaignManager.onNoFill.subscribe((placementId) => this.onPlacementNoFill(placementId));
    }
    createPlacementContent(placementId, campaign) {
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
    setPlacementContentState(placementId, state) {
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
    setCurrentAdUnit(placementId, adUnit) {
        adUnit.onStart.subscribe(() => this.onAdUnitStart(placementId));
        adUnit.onClose.subscribe(() => this.onAdUnitFinish(placementId, adUnit.getFinishState()));
    }
    createPlacementContentParams(placement, campaign) {
        return {
            type: IPlacementContentType.SHOW_AD,
            rewarded: !placement.allowSkip()
        };
    }
    setAdPlacementContentStates(state) {
        for (const placementId of Object.keys(this._placementContentMap)) {
            const placementContent = this._placementContentMap[placementId];
            if (placementContent.type === IPlacementContentType.SHOW_AD || placementContent.type === IPlacementContentType.PROMO_AD) {
                this.setPlacementContentState(placementId, state);
            }
        }
    }
    onAdUnitFinish(placementId, finishState) {
        return this._monetization.PlacementContents.sendAdFinished(placementId, finishState);
    }
    onAdUnitStart(placementId) {
        this._monetization.PlacementContents.sendAdStarted(placementId);
        this.setAdPlacementContentStates(PlacementContentState.WAITING);
    }
    onPlacementNoFill(placementId) {
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
    createNoFillParams() {
        return {
            type: IPlacementContentType.NO_FILL
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50Q29udGVudE1hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTW9uZXRpemF0aW9uL01hbmFnZXJzL1BsYWNlbWVudENvbnRlbnRNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBRXJGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBZ0I5RSxNQUFNLE9BQU8sdUJBQXVCO0lBS2hDLFlBQVksWUFBOEIsRUFBRSxhQUErQixFQUFFLGVBQWdDO1FBRnJHLHlCQUFvQixHQUF5QixFQUFFLENBQUM7UUFHcEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7UUFDcEMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDcEgsZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFTSxzQkFBc0IsQ0FBQyxXQUFtQixFQUFFLFFBQWtCO1FBQ2pFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMxRyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7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