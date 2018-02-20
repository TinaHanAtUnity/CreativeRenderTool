import { EndScreen } from 'Views/EndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitStyle } from 'Models/AdUnitStyle';

export class PerformanceEndScreen extends EndScreen {
    private _campaign: PerformanceCampaign;

    constructor(nativeBridge: NativeBridge, campaign: PerformanceCampaign, coppaCompliant: boolean, language: string, gameId: string, adUnitStyle?: AdUnitStyle) {
        super(nativeBridge, coppaCompliant, language, gameId, campaign.getGameName(), campaign.getAbGroup(), adUnitStyle);

        const adjustedRating: number = campaign.getRating() * 20;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': campaign.getPortrait().getUrl(),
            'endScreenPortrait': campaign.getLandscape().getUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt(campaign)
        };

        this._campaign = campaign;
    }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            gamerId: this._campaign.getGamerId(),
            adUnitStyle: this._adUnitStyle
        }));
    }
}
