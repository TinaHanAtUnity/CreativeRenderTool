import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ICloseHandler } from 'Views/Closer';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { Placement } from 'Models/Placement';
import { GDPREventHandler } from 'EventHandlers/GDPREventHandler';

export class VPAIDOverlayEventHandler extends GDPREventHandler implements ICloseHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;
    private _campaign: VPAIDCampaign;
    private _placement: Placement;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        super(parameters.gdprManager, parameters.configuration);
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
    }

    public onClose(skipped: boolean) {
        const finishState = skipped ? FinishState.SKIPPED : FinishState.COMPLETED;
        this._adUnit.setFinishState(finishState);
        this._adUnit.hide();
    }
}
