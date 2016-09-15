import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';

export class PerformanceAdUnit extends AbstractAdUnit {

    private _videoAdUnit: VideoAdUnit;

    constructor(nativeBridge: NativeBridge, videoAdUnit: VideoAdUnit, placement: Placement, campaign: Campaign) {
        super(nativeBridge, videoAdUnit.getAdunitObservables(), placement, campaign);
        this._videoAdUnit = videoAdUnit;
    }

    public show(): Promise<void> {
        return this._videoAdUnit.show();
    }

    public hide(): Promise<void> {
        return this._videoAdUnit.hide();
    }

    public isShowing(): boolean {
        return this._videoAdUnit.isShowing();
    }

    public setNativeOptions(options: any): void {
        this._videoAdUnit.setNativeOptions(options);
    }

}