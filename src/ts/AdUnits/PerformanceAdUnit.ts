import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';
import { EndScreen } from 'Views/EndScreen';
import { AdUnit } from 'Utilities/AdUnit';

export class PerformanceAdUnit extends VideoAdUnit {

    private _endScreen: EndScreen | undefined;

    constructor(nativeBridge: NativeBridge, adUnit: AdUnit, videoAdUnitController: VideoAdUnitController, endScreen: EndScreen) {
        super(nativeBridge, adUnit, videoAdUnitController);

        this._endScreen = endScreen;
    }

    public show(): Promise<void> {
        return this._videoAdUnitController.show();
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }
        this.unsetReferences();
        return this._videoAdUnitController.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnitController.isShowing();
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    private unsetReferences() {
        delete this._endScreen;
    }

}
