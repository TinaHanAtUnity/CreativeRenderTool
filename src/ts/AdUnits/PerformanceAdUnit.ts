import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen } from 'Views/EndScreen';

export class PerformanceAdUnit extends AbstractAdUnit {

    private _videoAdUnit: VideoAdUnit;
    private _endScreen: EndScreen | undefined;

    constructor(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, endScreen: EndScreen) {
        super(nativeBridge, videoAdUnit.getPlacement(), videoAdUnit.getCampaign());
        this._videoAdUnit = videoAdUnit;
        this._endScreen = endScreen;

        videoAdUnit.onVideoClose.subscribe(() => this.onClose.trigger());
        videoAdUnit.onVideoFinish.subscribe(() => this.onFinish.trigger());
        videoAdUnit.onVideoStart.subscribe(() => this.onStart.trigger());
    }

    public show(): Promise<void> {
        return this._videoAdUnit.show();
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.container().parentElement.removeChild(endScreen.container());
        }
        this.unsetReferences();
        return this._videoAdUnit.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnit.isShowing();
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    private unsetReferences() {
        delete this._endScreen;
    }

}
