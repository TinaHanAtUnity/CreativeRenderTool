import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export class NewVideoOverlayWithInstallInRewardedVideos extends NewVideoOverlay {

    public setVideoProgress(value: number): void {
        super.setVideoProgress(value);

        if (this._videoProgress > 500) {
            console.log(this._videoProgress);
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
