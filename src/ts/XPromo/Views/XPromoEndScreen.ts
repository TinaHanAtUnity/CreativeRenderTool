import { EndScreen, IEndScreenParameters } from 'Ads/Views/EndScreen';
import { Template } from 'Core/Utilities/Template';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import SquareEndScreenTemplate from 'html/SquareEndScreen.html';

const SQUARE_END_SCREEN = 'square-end-screen';

export class XPromoEndScreen extends EndScreen {
    private _campaign: XPromoCampaign;
    private _country: string | undefined;

    constructor(parameters: IEndScreenParameters, campaign: XPromoCampaign, country?: string) {
        parameters.targetGameName = campaign.getGameName();
        super(parameters);

        this._campaign = campaign;
        this._country = country;
        this._template = new Template(this.getTemplate(), this._localization);

        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        const adjustedRating: number = campaign.getRating() * 20;
        this._templateData = {
            'gameName': campaign.getGameName(),
            'gameIcon': campaign.getGameIcon().getUrl(),
            // NOTE! Landscape orientation should use a portrait image and portrait orientation should use a landscape image
            'endScreenLandscape': portraitImage ? portraitImage.getUrl() : undefined,
            'endScreenPortrait': landscapeImage ? landscapeImage.getUrl() : undefined,
            'endScreenSquare': squareImage ? squareImage.getUrl() : undefined,
            'rating': adjustedRating.toString(),
            'ratingCount': this._localization.abbreviate(campaign.getRatingCount()),
            'endscreenAlt': this.getEndscreenAlt()
        };
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

    public render(): void {
        super.render();

        document.documentElement.classList.add('performance-end-screen');

        const chinaAdvertisementElement: HTMLElement | null = this._container.querySelector('.china-advertisement');
        if (this._country === 'CN' && chinaAdvertisementElement) {
            chinaAdvertisementElement.style.display = 'block';
        }
    }

    protected getEndscreenAlt(): string | undefined {
        if (this._campaign.getSquare()) {
            return SQUARE_END_SCREEN;
        }
        return undefined;
    }

    protected getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenTemplate;

        }
        return super.getTemplate();
    }

}
