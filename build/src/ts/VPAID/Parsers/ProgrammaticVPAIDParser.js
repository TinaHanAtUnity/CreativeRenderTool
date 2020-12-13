import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDParser } from 'VPAID/Utilities/VPAIDParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
export class ProgrammaticVPAIDParser extends ProgrammaticVastParser {
    constructor(core) {
        super(core);
        this._vpaidParser = new VPAIDParser();
    }
    parse(response, session) {
        return this.retrieveVast(response).then((vast) => {
            const vpaidMediaFile = this.getVPAIDMediaFile(vast);
            if (vpaidMediaFile) {
                const vpaid = this._vpaidParser.parseFromVast(vast, vpaidMediaFile);
                const cacheTTL = response.getCacheTTL();
                const baseCampaignParams = {
                    id: this.getProgrammaticCampaignId(),
                    willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
                    contentType: ProgrammaticVPAIDParser.ContentType,
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
                const vpaidCampaignParams = Object.assign({}, baseCampaignParams, { vpaid: vpaid, appCategory: response.getCategory() || undefined, appSubcategory: response.getSubCategory() || undefined, advertiserDomain: response.getAdvertiserDomain() || undefined, advertiserCampaignId: response.getAdvertiserCampaignId() || undefined, advertiserBundleId: response.getAdvertiserBundleId() || undefined, useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(), buyerId: response.getBuyerId() || undefined });
                return Promise.resolve(new VPAIDCampaign(vpaidCampaignParams));
            }
            else {
                return this.parseVastToCampaign(vast, session, response);
            }
        });
    }
    getVPAIDMediaFile(vast) {
        return this._vpaidParser.getSupportedMediaFile(vast);
    }
}
ProgrammaticVPAIDParser.ContentType = CampaignContentTypes.ProgrammaticVpaid;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVlBBSURQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvUGFyc2Vycy9Qcm9ncmFtbWF0aWNWUEFJRFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQWtCLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUUxRSxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsc0JBQXNCO0lBTS9ELFlBQVksSUFBVztRQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFIUixpQkFBWSxHQUFnQixJQUFJLFdBQVcsRUFBRSxDQUFDO0lBSXRELENBQUM7SUFFTSxLQUFLLENBQUMsUUFBeUIsRUFBRSxPQUFnQjtRQUNwRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFxQixFQUFFO1lBQ2hFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRCxJQUFJLGNBQWMsRUFBRTtnQkFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUVwRSxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRXhDLE1BQU0sa0JBQWtCLEdBQWM7b0JBQ2xDLEVBQUUsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUU7b0JBQ3BDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTO29CQUNqRSxXQUFXLEVBQUUsdUJBQXVCLENBQUMsV0FBVztvQkFDaEQsTUFBTSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxTQUFTO29CQUN6QyxhQUFhLEVBQUUsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksU0FBUztvQkFDdkQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxTQUFTO29CQUNqRCxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVM7b0JBQ3pDLElBQUksRUFBRSxTQUFTO29CQUNmLE9BQU8sRUFBRSxPQUFPO29CQUNoQixPQUFPLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRTtvQkFDOUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFO29CQUM5QyxhQUFhLEVBQUUsS0FBSztpQkFDdkIsQ0FBQztnQkFFRixNQUFNLG1CQUFtQixxQkFDakIsa0JBQWtCLElBQ3RCLEtBQUssRUFBRSxLQUFLLEVBQ1osV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxTQUFTLEVBQ2hELGNBQWMsRUFBRSxRQUFRLENBQUMsY0FBYyxFQUFFLElBQUksU0FBUyxFQUN0RCxnQkFBZ0IsRUFBRSxRQUFRLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxTQUFTLEVBQzdELG9CQUFvQixFQUFFLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLFNBQVMsRUFDckUsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLHFCQUFxQixFQUFFLElBQUksU0FBUyxFQUNqRSw4QkFBOEIsRUFBRSxRQUFRLENBQUMsaUNBQWlDLEVBQUUsRUFDNUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxTQUFTLEdBQzlDLENBQUM7Z0JBRUYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUNsRTtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzVEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8saUJBQWlCLENBQUMsSUFBVTtRQUNoQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekQsQ0FBQzs7QUFwRGEsbUNBQVcsR0FBRyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyJ9