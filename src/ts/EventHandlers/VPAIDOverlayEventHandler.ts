import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ICloseHandler } from 'Views/Closer';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Placement } from 'Models/Placement';
import { Configuration } from 'Models/Configuration';
import { GdprManager, GDPREventAction } from 'Managers/GdprManager';

export class VPAIDOverlayEventHandler implements ICloseHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;
    private _abGroup: number;
    private _campaign: VPAIDCampaign;
    private _placement: Placement;
    private _configuration: Configuration;
    private _gdprManager: GdprManager;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._abGroup = parameters.campaign.getAbGroup();
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._configuration = parameters.configuration;
        this._gdprManager = parameters.gdprManager;
    }

    public onGDPRPopupSkipped(): void {
        if (!this._configuration.isOptOutRecorded()) {
            this._configuration.setOptOutRecorded(true);
        }
        this._gdprManager.sendGDPREvent(GDPREventAction.SKIP);
    }

    public onClose(skipped: boolean) {
        const finishState = skipped ? FinishState.SKIPPED : FinishState.COMPLETED;
        this._adUnit.setFinishState(finishState);
        this._adUnit.hide();
    }
}
