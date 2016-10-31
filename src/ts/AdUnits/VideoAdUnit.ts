import { NativeBridge } from 'Native/NativeBridge';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VideoAdUnitController } from 'AdUnits/VideoAdUnitController';

export abstract class VideoAdUnit extends AbstractAdUnit {

    protected _videoAdUnitController: VideoAdUnitController;

    constructor(nativeBridge: NativeBridge, videoAdUnitController: VideoAdUnitController) {
        super(nativeBridge, videoAdUnitController.getPlacement(), videoAdUnitController.getCampaign());

        videoAdUnitController.onVideoClose.subscribe(() => this.onClose.trigger());
        videoAdUnitController.onVideoFinish.subscribe(() => this.onFinish.trigger());
        videoAdUnitController.onVideoStart.subscribe(() => this.onStart.trigger());

        this._videoAdUnitController = videoAdUnitController;
    }

    public getVideoAdUnitController(): VideoAdUnitController {
        return this._videoAdUnitController;
    }
}
