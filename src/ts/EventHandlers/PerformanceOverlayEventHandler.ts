import { IOverlayHandler } from 'Views/Overlay';
import { NativeBridge } from 'Native/NativeBridge';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';

export class PerformanceOverlayEventHandler implements IOverlayHandler {
    private _adUnit: PerformanceAdUnit;

    constructor(nativeBridge: NativeBridge, adUnit: PerformanceAdUnit, parameters: IPerformanceAdUnitParameters) {
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
