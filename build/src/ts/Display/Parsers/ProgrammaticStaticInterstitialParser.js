import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { StringUtils } from 'Ads/Utilities/StringUtils';
export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    constructor(platform) {
        super(platform);
    }
    parse(response, session) {
        const dynamicMarkup = decodeURIComponent(response.getContent());
        if (!StringUtils.startWithHTMLTag(dynamicMarkup)) {
            throw new CampaignError(ProgrammaticStaticInterstitialParser.ErrorMessage, ProgrammaticStaticInterstitialParser.ContentTypeHtml, CampaignErrorLevel.MEDIUM, undefined, undefined, undefined, response.getSeatId(), response.getCreativeId());
        }
        const cacheTTL = response.getCacheTTL();
        const baseCampaignParams = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticStaticInterstitialParser.ContentTypeHtml,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        const displayInterstitialParams = Object.assign({}, baseCampaignParams, { dynamicMarkup: dynamicMarkup, useWebViewUserAgentForTracking: false, width: response.getWidth() || undefined, height: response.getHeight() || undefined });
        return Promise.resolve(new DisplayInterstitialCampaign(displayInterstitialParams));
    }
}
ProgrammaticStaticInterstitialParser.ContentTypeHtml = 'programmatic/static-interstitial-html';
ProgrammaticStaticInterstitialParser.ContentTypeJs = 'programmatic/static-interstitial-js';
ProgrammaticStaticInterstitialParser.ErrorMessage = 'Display ad content is not in HTML format';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljU3RhdGljSW50ZXJzdGl0aWFsUGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Rpc3BsYXkvUGFyc2Vycy9Qcm9ncmFtbWF0aWNTdGF0aWNJbnRlcnN0aXRpYWxQYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTVELE9BQU8sRUFBRSwyQkFBMkIsRUFBZ0MsTUFBTSw0Q0FBNEMsQ0FBQztBQUN2SCxPQUFPLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDN0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE1BQU0sT0FBTyxvQ0FBcUMsU0FBUSxjQUFjO0lBTXBFLFlBQVksUUFBa0I7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3BCLENBQUM7SUFFTSxLQUFLLENBQUMsUUFBeUIsRUFBRSxPQUFnQjtRQUNwRCxNQUFNLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQzlDLE1BQU0sSUFBSSxhQUFhLENBQUMsb0NBQW9DLENBQUMsWUFBWSxFQUFFLG9DQUFvQyxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1NBQ2hQO1FBRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXhDLE1BQU0sa0JBQWtCLEdBQWM7WUFDbEMsRUFBRSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUNwQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNqRSxXQUFXLEVBQUUsb0NBQW9DLENBQUMsZUFBZTtZQUNqRSxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVM7WUFDekMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLFNBQVM7WUFDdkQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxTQUFTO1lBQ2pELE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksU0FBUztZQUN6QyxJQUFJLEVBQUUsU0FBUztZQUNmLE9BQU8sRUFBRSxPQUFPO1lBQ2hCLE9BQU8sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQzlCLFlBQVksRUFBRSxRQUFRLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRTtZQUM5QyxhQUFhLEVBQUUsS0FBSztTQUN2QixDQUFDO1FBRUYsTUFBTSx5QkFBeUIscUJBQ3ZCLGtCQUFrQixJQUN0QixhQUFhLEVBQUUsYUFBYSxFQUM1Qiw4QkFBOEIsRUFBRSxLQUFLLEVBQ3JDLEtBQUssRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksU0FBUyxFQUN2QyxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVMsR0FDNUMsQ0FBQztRQUVGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLDJCQUEyQixDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztJQUV2RixDQUFDOztBQXpDYSxvREFBZSxHQUFHLHVDQUF1QyxDQUFDO0FBQzFELGtEQUFhLEdBQUcscUNBQXFDLENBQUM7QUFDdEQsaURBQVksR0FBRywwQ0FBMEMsQ0FBQyJ9