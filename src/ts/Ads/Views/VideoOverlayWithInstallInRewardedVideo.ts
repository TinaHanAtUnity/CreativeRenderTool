import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export class VideoOverlayWithInstallInRewardedVideos extends VideoOverlay {

    public setVideoProgress(value: number): void {
        super.setVideoProgress(value);

        if (this._videoProgress > 500) {
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
