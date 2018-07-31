import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { ABGroup } from 'Models/ABGroup';

export class MRAIDEndScreen extends EndScreen {
    private _campaign: MRAIDCampaign;

    constructor(nativeBridge: NativeBridge, campaign: MRAIDCampaign, language: string, gameId: string, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup) {
        super(nativeBridge, language, gameId, campaign.getGameName(), abGroup, privacy, showGDPRBanner);

        this._campaign = campaign;

        this._templateData = {
            'gameName': campaign.getGameName(),
            'endscreenAlt': this.getEndscreenAlt(campaign)
        };
        const gameIcon = campaign.getGameIcon();
        if(gameIcon) {
            this._templateData.gameIcon = gameIcon.getUrl();
        }
        const rating = campaign.getRating();
        if(rating) {
            const adjustedRating: number = rating * 20;
            this._templateData.rating = adjustedRating.toString();
        }
        const ratingCount = campaign.getRatingCount();
        if(ratingCount) {
            this._templateData.ratingCount = this._localization.abbreviate(ratingCount);
        }
        const portrait = campaign.getPortrait();
        if(portrait) {
            this._templateData.endScreenLandscape = portrait.getUrl();
        }
        const landscape = campaign.getLandscape();
        if(landscape) {
            this._templateData.endScreenPortrait = landscape.getUrl();
        }
    }

    protected onDownloadEvent(event: Event): void {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            gamerId: this._campaign.getGamerId()
        }));
    }
}
