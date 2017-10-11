import { IOverlayHandler } from 'Views/Overlay';
import { FinishState } from 'Constants/FinishState';
import { NativeBridge } from 'Native/NativeBridge';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { IVPAIDEndScreenHandler } from 'Views/VPAIDEndScreen';
import { IVPAIDHandler } from 'Views/VPAID';
import { OperativeEventManager } from 'Managers/OperativeEventManager';

export class VPAIDOverlayEventHandler implements IOverlayHandler {
    private _adUnit: VPAIDAdUnit;
    private _operativeEventManager: OperativeEventManager;

    constructor(nativeBridge: NativeBridge, adUnit: VPAIDAdUnit, parameters: IVPAIDAdUnitParameters<IVPAIDEndScreenHandler, IVPAIDHandler, IOverlayHandler>) {
        this._adUnit = adUnit;
        this._operativeEventManager = parameters.operativeEventManager;
    }

    public onOverlaySkip(position: number): void {
        this._adUnit.sendTrackingEvent('skip');
        this._operativeEventManager.sendSkip(this._adUnit);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._adUnit.hide();
    }

    public onOverlayMute(isMuted: boolean): void {
        // EMPTY
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }
}
