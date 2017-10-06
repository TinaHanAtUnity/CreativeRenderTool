import { IOverlayHandler } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceOverlayEventHandler implements IOverlayHandler {
    private _adUnit: PerformanceAdUnit;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IAdUnitParameters) {
        this._adUnit = adUnit;
    }

    public onOverlaySkip(position: number): void {
        const endScreen = this._adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
        this._adUnit.onFinish.trigger();
    }

    public onOverlayMute(isMuted: boolean): void {
        // EMPTY
    }

    public onOverlayCallButton(): void {
        // EMPTY
    }
}
