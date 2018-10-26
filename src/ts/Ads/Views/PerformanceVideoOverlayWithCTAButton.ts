import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export class PerformanceVideoOverlayWithCTAButton extends NewVideoOverlay implements IPrivacyHandler {
    private _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, campaign: PerformanceCampaign, disablePrivacyDuringVideo?: boolean, seatId?: number) {
        super(nativeBridge, muted, language, gameId, privacy, showGDPRBanner, disablePrivacyDuringVideo, seatId);

        this._campaign = campaign;
        this._templateData.gameIcon = campaign.getGameIcon() ? campaign.getGameIcon().getUrl() : '';
    }

    protected showSkipButton() {
        if (this._skipEnabled) {
            this._skipButtonElement.classList.add('show-skip-button');
            this.showCallButton();
        }
    }

    protected fadeIn() {
        this._container.classList.add('fade-in');
        this._areControlsVisible = true;
    }

    protected onCallButtonEvent(event: Event): void {
        if (!this._callButtonEnabled) {
            return;
        }
        super.onCallButtonEvent(event);

        if (this._campaign instanceof PerformanceCampaign) {
            const campaign = this._campaign;
            this._handlers.forEach((handler) => {
                if (typeof handler.onOverlayDownload === 'function') {
                    handler.onOverlayDownload({
                        clickAttributionUrl: campaign.getClickAttributionUrl(),
                        clickAttributionUrlFollowsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
                        bypassAppSheet: campaign.getBypassAppSheet(),
                        appStoreId: campaign.getAppStoreId(),
                        store: campaign.getStore(),
                        videoDuration: this._videoDuration,
                        videoProgress: this._videoProgress
                    });
                }
            });
        }
    }

    public render() {
        super.render();
        this._container.classList.add('cta-button-test');
    }
}
