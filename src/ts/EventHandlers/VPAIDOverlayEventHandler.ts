import { IOverlayHandler } from 'Views/AbstractOverlay';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Placement } from 'Models/Placement';

export class VPAIDOverlayEventHandler implements IOverlayHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;
    private _comScoreTrackingService: ComScoreTrackingService;
    private _abGroup: number;
    private _campaign: VPAIDCampaign;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._comScoreTrackingService = parameters.comScoreTrackingService;
        this._abGroup = parameters.campaign.getAbGroup();
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
    }

    public onOverlaySkip(position: number): void {
        this._adUnit.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign);

        this.sendComscoreEvent('end', 0);

        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    public onOverlayMute(isMuted: boolean): void {
        // EMPTY
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }

    public onOverlayPauseForTesting(paused: boolean): void {
        // EMPTY
    }

    public onOverlayClose(): void {
        this._adUnit.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._campaign.getSession(), this._placement, this._campaign);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    private sendComscoreEvent(eventName: string, position: number) {
        const sessionId = this._campaign.getSession().getId();
        const creativeId = this._campaign.getCreativeId();
        const category = this._campaign.getCategory();
        const subCategory = this._campaign.getSubCategory();
        const adDuration = 0;

        this._comScoreTrackingService.sendEvent(eventName, sessionId, adDuration.toString(10), position, creativeId, category, subCategory);
    }
}
