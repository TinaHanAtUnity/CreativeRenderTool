import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { Template } from "../../Core/Utilities/Template";

export class XPromoEndScreen extends EndScreen {
    private _campaign: XPromoCampaign;

    constructor(parameters: IEndScreenParameters, campaign: XPromoCampaign) {
        parameters.targetGameName = campaign.getGameName();
        super(parameters);

        this._template = new Template(this.getTemplate(), this._localization);

        const adjustedRating: number = campaign.getRating() * 20;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': campaign.getPortrait().getUrl(),
            'endScreenPortrait': campaign.getLandscape().getUrl(),
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt()
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
            store: this._campaign.getStore()
        }));
    }
}
