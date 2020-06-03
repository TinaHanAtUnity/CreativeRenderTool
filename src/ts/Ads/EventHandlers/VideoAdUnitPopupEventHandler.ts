import { IPopupEventHandler } from 'Ads/Views/PopupController';
import { Campaign } from 'Ads/Models/Campaign';
import { IVideoAdUnitParameters, VideoAdUnit, VideoState } from 'Ads/AdUnits/VideoAdUnit';
import { IAdsApi } from 'Ads/IAds';

export class VideoAdUnitPopupEventHandler<T extends Campaign> implements IPopupEventHandler {

    private _adUnit: VideoAdUnit<T>;
    private readonly _ads: IAdsApi;

    constructor(videoAdUnit: VideoAdUnit<T>, parameters: IVideoAdUnitParameters<T>) {
        this._adUnit = videoAdUnit;
        this._ads = parameters.ads;
    }

    public onPopupClosed(): void {
        if (this._adUnit.isShowing() && this._adUnit.canShowVideo() && this._adUnit.canPlayVideo()) {
            this._adUnit.setVideoState(VideoState.PLAYING);
            this._ads.VideoPlayer.play();
        }
    }

    public onPopupShow(): void {
        if (this._adUnit.isShowing() && this._adUnit.canShowVideo() && this._adUnit.canPlayVideo()) {
            this._adUnit.setVideoState(VideoState.PAUSED);
            this._ads.VideoPlayer.pause();
        }
    }

    public onPopupVisible(): void {
        //
    }
}
