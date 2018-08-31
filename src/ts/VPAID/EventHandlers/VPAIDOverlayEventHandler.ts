import { GDPREventHandler } from 'Ads/EventHandlers/GDPREventHandler';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { Placement } from 'Ads/Models/Placement';
import { ICloseHandler } from 'Ads/Views/Closer';
import { VPAIDEndScreen } from 'Ads/Views/VPAIDEndScreen';
import { FinishState } from 'Common/Constants/FinishState';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';

export class VPAIDOverlayEventHandler extends GDPREventHandler implements ICloseHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;
    private _campaign: VPAIDCampaign;
    private _placement: Placement;
    private _endScreen: VPAIDEndScreen | undefined;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        super(parameters.gdprManager, parameters.configuration);
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._campaign = parameters.campaign;
        this._placement = parameters.placement;
        this._endScreen = parameters.endScreen;
    }

    public onClose(skipped: boolean) {
        const finishState = skipped ? FinishState.SKIPPED : FinishState.COMPLETED;
        this._adUnit.setFinishState(finishState);
        if (this._endScreen) {
            this._endScreen.show();
        }
        this._adUnit.hide();
    }
}
