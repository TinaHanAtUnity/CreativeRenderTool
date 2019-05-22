import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractPrivacy, IPrivacyHandlerView } from 'Ads/Views/AbstractPrivacy';
import VideoOverlayTemplateCTAV2 from 'html/VideoOverlayCTAV2.html';
import { Template } from 'Core/Utilities/Template';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export class VideoOverlayCTAV2 extends VideoOverlay implements IPrivacyHandlerView {
  constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
    super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

    this._template = new Template(VideoOverlayTemplateCTAV2, this._localization);

    if (this._campaign instanceof PerformanceCampaign || this._campaign instanceof XPromoCampaign) {
      this._templateData.gameName = this._campaign.getGameName();
      this._templateData.rating = this._campaign.getRating() * 20;
    }
  }
}
