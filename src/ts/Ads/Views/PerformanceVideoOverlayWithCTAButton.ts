import { AbstractPrivacy, IPrivacyHandler } from 'Ads/Views/AbstractPrivacy';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NewVideoOverlay } from 'Ads/Views/NewVideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { ABGroup } from 'Core/Models/ABGroup';
import { IVideoOverlayDownloadParameters } from 'Performance/EventHandlers/PerformanceOverlayWithCTAButtonEventHandler';

export class PerformanceVideoOverlayWithCTAButton extends NewVideoOverlay implements IPrivacyHandler {
    private _showPerformanceAdCTAButton: boolean = false;
    private _campaign: Campaign;

    constructor(nativeBridge: NativeBridge, muted: boolean, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, campaign: PerformanceCampaign, disablePrivacyDuringVideo?: boolean) {
        super(nativeBridge, muted, language, gameId, privacy, showGDPRBanner, disablePrivacyDuringVideo);

        this._campaign = campaign;
        this._templateData.gameIcon = campaign.getGameIcon() ? campaign.getGameIcon().getUrl() : '';
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
                        videoProgress: this._videoProgress
                    });
                }
            });
        }
    }
}
