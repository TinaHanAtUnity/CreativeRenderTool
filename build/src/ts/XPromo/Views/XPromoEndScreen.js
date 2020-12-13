import { EndScreen } from 'Ads/Views/EndScreen';
import { Template } from 'Core/Utilities/Template';
import SquareEndScreenTemplate from 'html/SquareEndScreen.html';
const SQUARE_END_SCREEN = 'square-end-screen';
export class XPromoEndScreen extends EndScreen {
    constructor(parameters, campaign, country) {
        parameters.targetGameName = campaign.getGameName();
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
    }
    onDownloadEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onEndScreenDownload({
            clickAttributionUrl: this._campaign.getClickAttributionUrl(),
            clickAttributionUrlFollowsRedirects: this._campaign.getClickAttributionUrlFollowsRedirects(),
            bypassAppSheet: this._campaign.getBypassAppSheet(),
            appStoreId: this._campaign.getAppStoreId(),
            store: this._campaign.getStore()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vRW5kU2NyZWVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1hQcm9tby9WaWV3cy9YUHJvbW9FbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBd0IsTUFBTSxxQkFBcUIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyx1QkFBdUIsTUFBTSwyQkFBMkIsQ0FBQztBQUVoRSxNQUFNLGlCQUFpQixHQUFHLG1CQUFtQixDQUFDO0FBRTlDLE1BQU0sT0FBTyxlQUFnQixTQUFRLFNBQVM7SUFJMUMsWUFBWSxVQUFnQyxFQUFFLFFBQXdCLEVBQUUsT0FBZ0I7UUFDcEYsVUFBVSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV0RSxNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0MsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9DLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN6QyxNQUFNLGNBQWMsR0FBVyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3pELElBQUksQ0FBQyxhQUFhLEdBQUc7WUFDakIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUU7WUFDbEMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDM0MsZ0hBQWdIO1lBQ2hILG9CQUFvQixFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3hFLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ3pFLGlCQUFpQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ2pFLFFBQVEsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFO1lBQ25DLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkUsY0FBYyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7U0FDekMsQ0FBQztJQUNOLENBQUM7SUFFUyxlQUFlLENBQUMsS0FBWTtRQUNsQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUM7WUFDMUQsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRTtZQUM1RCxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxFQUFFO1lBQzVGLGNBQWMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFO1lBQ2xELFVBQVUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRTtZQUMxQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUU7U0FDbkMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRU0sTUFBTTtRQUNULEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUVmLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBRWpFLE1BQU0seUJBQXlCLEdBQXVCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDNUcsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSx5QkFBeUIsRUFBRTtZQUNyRCx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFFUyxlQUFlO1FBQ3JCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUM1QixPQUFPLGlCQUFpQixDQUFDO1NBQzVCO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVTLFdBQVc7UUFDakIsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLEtBQUssaUJBQWlCLEVBQUU7WUFDOUMsT0FBTyx1QkFBdUIsQ0FBQztTQUVsQztRQUNELE9BQU8sS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQy9CLENBQUM7Q0FFSiJ9