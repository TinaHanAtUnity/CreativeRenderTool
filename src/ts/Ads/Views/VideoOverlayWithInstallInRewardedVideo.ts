import { VideoOverlay } from 'Ads/Views/VideoOverlay';

export class VideoOverlayWithInstallInRewardedVideos extends VideoOverlay {

    public setVideoProgress(value: number): void {
        super.setVideoProgress(value);

        if (this._videoProgress > 5000) {
            this.showCallButton();
            return;
        }
    }

    public setCallButtonVisible(value: boolean) {
        if (this._callButtonVisible !== value) {
            this._callButtonElement.style.display = value ? 'block' : 'none';
        }
    }
}
