import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { FinishState } from 'Core/Constants/FinishState';
import { Observable0 } from 'Core/Utilities/Observable';
export class AbstractAdUnit {
    constructor(parameters) {
        this.onStart = new Observable0();
        this.onStartProcessed = new Observable0();
        this.onFinish = new Observable0();
        this.onClose = new Observable0();
        this.onError = new Observable0();
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._ads = parameters.ads;
        this._store = parameters.store;
        this._forceOrientation = parameters.forceOrientation;
        this._container = parameters.container;
        this._showing = false;
        this._finishState = FinishState.ERROR;
        this._baseCampaign = parameters.campaign;
    }
    static setAutoClose(value) {
        AbstractAdUnit._autoClose = value;
    }
    static getAutoClose() {
        return AbstractAdUnit._autoClose;
    }
    static setAutoCloseDelay(value) {
        AbstractAdUnit._autoCloseDelay = value;
    }
    static getAutoCloseDelay() {
        return AbstractAdUnit._autoCloseDelay;
    }
    isCached() {
        return CampaignAssetInfo.isCached(this._baseCampaign);
    }
    isShowing() {
        return this._showing;
    }
    setShowing(showing) {
        this._showing = showing;
    }
    getContainer() {
        return this._container;
    }
    getForceOrientation() {
        return this._forceOrientation;
    }
    getFinishState() {
        return this._finishState;
    }
    setFinishState(finishState) {
        if (this._finishState !== FinishState.COMPLETED) {
            this._finishState = finishState;
        }
    }
    markAsSkipped() {
        this._finishState = FinishState.SKIPPED;
    }
    getCampaign() {
        return this._baseCampaign;
    }
}
AbstractAdUnit._autoClose = false;
AbstractAdUnit._autoCloseDelay = 0;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL0FkVW5pdHMvQWJzdHJhY3RBZFVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBUXpELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQTZCeEQsTUFBTSxPQUFnQixjQUFjO0lBdUNoQyxZQUFZLFVBQXVDO1FBbEJuQyxZQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM1QixxQkFBZ0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3JDLGFBQVEsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQzdCLFlBQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQzVCLFlBQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBZXhDLElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNyQyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDO0lBQzdDLENBQUM7SUEvQ00sTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFjO1FBQ3JDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWTtRQUN0QixPQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFhO1FBQ3pDLGNBQWMsQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0lBQzNDLENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCO1FBQzNCLE9BQU8sY0FBYyxDQUFDLGVBQWUsQ0FBQztJQUMxQyxDQUFDO0lBeUNNLFFBQVE7UUFDWCxPQUFPLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVNLFVBQVUsQ0FBQyxPQUFnQjtRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztJQUM1QixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sbUJBQW1CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2xDLENBQUM7SUFFTSxjQUFjO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRU0sY0FBYyxDQUFDLFdBQXdCO1FBQzFDLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxXQUFXLENBQUMsU0FBUyxFQUFFO1lBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1NBQ25DO0lBQ0wsQ0FBQztJQUVNLGFBQWE7UUFDaEIsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDO0lBQzVDLENBQUM7SUFFTSxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7O0FBM0VjLHlCQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ25CLDhCQUFlLEdBQVcsQ0FBQyxDQUFDIn0=