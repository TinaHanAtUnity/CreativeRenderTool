import { EndScreen } from 'Ads/Views/EndScreen';
import { Template } from 'Core/Utilities/Template';
import SquareEndScreenTemplate from 'html/SquareEndScreen.html';
export const SQUARE_END_SCREEN = 'square-end-screen';
export class PerformanceEndScreen extends EndScreen {
    constructor(parameters, campaign, country) {
        super(parameters);
        this._campaign = campaign;
        this._country = country;
        this._template = new Template(this.getTemplate(), this._localization);
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        const adjustedRating = campaign.getRating() * 20;
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
        this._core = parameters.core;
        this._campaign = campaign;
    }
    onDownloadEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore(),
            appDownloadUrl: this._campaign.getAppDownloadUrl(),
            adUnitStyle: this._adUnitStyle
        }));
    }
    render() {
        super.render();
        document.documentElement.classList.add('performance-end-screen');
        const chinaAdvertisementElement = this._container.querySelector('.china-advertisement');
        if (this._country === 'CN' && chinaAdvertisementElement) {
            chinaAdvertisementElement.style.display = 'block';
        }
    }
    getEndscreenAlt() {
        if (this._campaign.getSquare()) {
            return SQUARE_END_SCREEN;
        }
        return undefined;
    }
    getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenTemplate;
        }
        return super.getTemplate();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyZm9ybWFuY2VFbmRTY3JlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvUGVyZm9ybWFuY2UvVmlld3MvUGVyZm9ybWFuY2VFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBd0IsTUFBTSxxQkFBcUIsQ0FBQztBQUV0RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyx1QkFBdUIsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxtQkFBbUIsQ0FBQztBQUVyRCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsU0FBUztJQUsvQyxZQUFZLFVBQWdDLEVBQUUsUUFBNkIsRUFBRSxPQUFnQjtRQUN6RixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFFeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXRFLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM3QyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0MsTUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sY0FBYyxHQUFXLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLGFBQWEsR0FBRztZQUNqQixVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRTtZQUNsQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLE1BQU0sRUFB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