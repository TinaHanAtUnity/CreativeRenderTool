import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen } from 'Views/EndScreen';

export class PerformanceAdUnit extends AbstractAdUnit {

    private _videoAdUnit: VideoAdUnit;
    private _endScreen: EndScreen;

    constructor(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, endScreen: EndScreen) {
        super(nativeBridge, videoAdUnit.getPlacement(), videoAdUnit.getCampaign());
        this._videoAdUnit = videoAdUnit;
        this._endScreen = endScreen;

        videoAdUnit.onClose.subscribe(() => this.onClose.trigger());
        videoAdUnit.onFinish.subscribe(() => this.onFinish.trigger());
        videoAdUnit.onStart.subscribe(() => this.onStart.trigger());
    }

    public show(): Promise<void> {
        return this._videoAdUnit.show();
    }

    public hide(): Promise<void> {
        if (this._endScreen) {
            this._endScreen.container().parentElement.removeChild(this._endScreen.container());
            this._endScreen = null;
        }

        return this._videoAdUnit.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnit.isShowing();
    }

    public getEndScreen(): EndScreen {
        return this._endScreen;
    }

}
