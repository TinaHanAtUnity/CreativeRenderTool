import { IOverlayHandler } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { FinishState } from 'Constants/FinishState';
import { Double } from 'Utilities/Double';
import { Campaign } from 'Models/Campaign';

export class OverlayEventHandler<T extends Campaign> implements IOverlayHandler {
    private _nativeBridge: NativeBridge;
    private _operativeEventManager: OperativeEventManager;
    private _adUnit: VideoAdUnit<T>;

    constructor(nativeBridge: NativeBridge, adUnit: VideoAdUnit<T>, parameters: IAdUnitParameters<T>) {
        this._nativeBridge = nativeBridge;
        this._operativeEventManager = parameters.operativeEventManager;
        this._adUnit = adUnit;
    }

    public onOverlaySkip(position: number): void {
        this._nativeBridge.VideoPlayer.pause();
        this._adUnit.setActive(false);
        this._adUnit.setFinishState(FinishState.SKIPPED);
        this._operativeEventManager.sendSkip(this._adUnit, this._adUnit.getVideo().getPosition());

        this._adUnit.getContainer().reconfigure(ViewConfiguration.ENDSCREEN);

        const overlay = this._adUnit.getOverlay();
        if (overlay) {
            overlay.hide();
        }

        this._adUnit.onFinish.trigger();
    }

    public onOverlayMute(isMuted: boolean): void {
        this._nativeBridge.VideoPlayer.setVolume(new Double(isMuted ? 0.0 : 1.0));
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }
}
