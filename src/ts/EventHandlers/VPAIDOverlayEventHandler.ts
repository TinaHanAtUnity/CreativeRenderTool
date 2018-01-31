import { IOverlayHandler } from 'Views/AbstractOverlay';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { ICloseHandler } from 'Views/Closer';

export class VPAIDOverlayEventHandler implements ICloseHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;
    private _comScoreTrackingService: ComScoreTrackingService;
    private _abGroup: number;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters) {
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
        this._comScoreTrackingService = parameters.comScoreTrackingService;
        this._abGroup = parameters.campaign.getAbGroup();
    }

    public onClose(skipped: boolean) {
        const finishState = skipped ? FinishState.SKIPPED : FinishState.COMPLETED;
        this._adUnit.setFinishState(finishState);
        this._adUnit.hide();
    }
}
