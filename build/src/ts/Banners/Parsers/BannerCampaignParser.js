import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
export class BannerCampaignParser extends CampaignParser {
    constructor(platform, wrapJS = false) {
        super(platform);
        this._wrapJS = false;
        this._wrapJS = wrapJS;
    }
    parse(response, session) {
        const markup = this._wrapJS ? this.getJSContent(response) : this.getHTMLContent(response);
        const campaign = {
            id: this.getProgrammaticCampaignId(),
            adType: response.getAdType(),
            correlationId: response.getCorrelationId(),
            mediaId: response.getMediaId(),
            creativeId: response.getCreativeId(),
            meta: undefined,
            session: session,
            seatId: response.getSeatId(),
            willExpireAt: response.getCacheTTL(),
            markup: markup,
            trackingUrls: response.getTrackingUrls() || {},
            width: response.getWidth(),
            height: response.getHeight()
        };
        return Promise.resolve(new BannerCampaign(campaign));
    }
    getJSContent(response) {
        return encodeURIComponent(`<script>${response.getContent()}</script>`);
    }
    getHTMLContent(response) {
        return encodeURIComponent(response.getContent());
    }
}
BannerCampaignParser.ContentTypeJS = 'programmatic/banner-js';
BannerCampaignParser.ContentTypeHTML = 'programmatic/banner-html';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQ2FtcGFpZ25QYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9QYXJzZXJzL0Jhbm5lckNhbXBhaWduUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsY0FBYyxFQUFtQixNQUFNLCtCQUErQixDQUFDO0FBR2hGLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBTXBELFlBQVksUUFBa0IsRUFBRSxTQUFrQixLQUFLO1FBQ25ELEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUhaLFlBQU8sR0FBRyxLQUFLLENBQUM7UUFJcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUF5QixFQUFFLE9BQWdCO1FBQ3BELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDMUYsTUFBTSxRQUFRLEdBQW9CO1lBQzlCLEVBQUUsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUU7WUFDcEMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUU7WUFDNUIsYUFBYSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRTtZQUMxQyxPQUFPLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRTtZQUM5QixVQUFVLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRTtZQUNwQyxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFO1lBQzVCLFlBQVksRUFBRSxRQUFRLENBQUMsV0FBVyxFQUFFO1lBQ3BDLE1BQU0sRUFBRSxNQUFNO1lBQ2QsWUFBWSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFO1lBQzlDLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFO1lBQzFCLE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFO1NBQy9CLENBQUM7UUFDRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU8sWUFBWSxDQUFDLFFBQXlCO1FBQzFDLE9BQU8sa0JBQWtCLENBQUMsV0FBVyxRQUFRLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFFTyxjQUFjLENBQUMsUUFBeUI7UUFDNUMsT0FBTyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDOztBQXBDYSxrQ0FBYSxHQUFHLHdCQUF3QixDQUFDO0FBQ3pDLG9DQUFlLEdBQUcsMEJBQTBCLENBQUMifQ==