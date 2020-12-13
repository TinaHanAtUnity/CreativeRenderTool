import { HTML } from 'Ads/Models/Assets/HTML';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
export class ProgrammaticMraidUrlParser extends CampaignParser {
    parse(response, session) {
        const jsonMraidUrl = response.getJsonContent();
        if (!jsonMraidUrl) {
            throw new Error('Corrupted mraid-url content');
        }
        if (!jsonMraidUrl.inlinedUrl) {
            const MRAIDError = new DiagnosticError(new Error('MRAID Campaign missing inlinedUrl'), { mraid: jsonMraidUrl });
            throw MRAIDError;
        }
        const cacheTTL = response.getCacheTTL();
        const baseCampaignParams = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticMraidUrlParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraidUrl.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        const parameters = Object.assign({}, baseCampaignParams, { resourceAsset: jsonMraidUrl.inlinedUrl ? new HTML(this.validateAndEncodeUrl(jsonMraidUrl.inlinedUrl, session), session) : undefined, resource: undefined, dynamicMarkup: jsonMraidUrl.dynamicMarkup, clickAttributionUrl: jsonMraidUrl.clickAttributionUrl ? this.validateAndEncodeUrl(jsonMraidUrl.clickAttributionUrl, session) : undefined, clickAttributionUrlFollowsRedirects: jsonMraidUrl.clickAttributionUrlFollowsRedirects, clickUrl: jsonMraidUrl.clickUrl ? this.validateAndEncodeUrl(jsonMraidUrl.clickUrl, session) : undefined, videoEventUrls: {}, useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking() || false, gameName: undefined, gameIcon: undefined, rating: undefined, ratingCount: undefined, landscapeImage: undefined, portraitImage: undefined, bypassAppSheet: undefined, store: undefined, appStoreId: undefined, playableConfiguration: undefined, targetGameId: undefined, isCustomCloseEnabled: response.isCustomCloseEnabled() });
        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
ProgrammaticMraidUrlParser.ContentType = 'programmatic/mraid-url';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRVcmxQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvUGFyc2Vycy9Qcm9ncmFtbWF0aWNNcmFpZFVybFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFJOUMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM5RCxPQUFPLEVBQWtCLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBTzNFLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxjQUFjO0lBSW5ELEtBQUssQ0FBQyxRQUF5QixFQUFFLE9BQWdCO1FBQ3BELE1BQU0sWUFBWSxHQUF5QixRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztTQUNsRDtRQUNELElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFO1lBQzFCLE1BQU0sVUFBVSxHQUFHLElBQUksZUFBZSxDQUNsQyxJQUFJLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQyxFQUM5QyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FDMUIsQ0FBQztZQUNGLE1BQU0sVUFBVSxDQUFDO1NBQ3BCO1FBRUQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXhDLE1BQU0sa0JBQWtCLEdBQWM7WUFDbEMsRUFBRSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUNwQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNqRSxXQUFXLEVBQUUsMEJBQTBCLENBQUMsV0FBVztZQUNuRCxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVM7WUFDekMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLFNBQVM7WUFDdkQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxTQUFTO1lBQ2pELE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksU0FBUztZQUN6QyxJQUFJLEVBQUUsWUFBWSxDQUFDLElBQUk7WUFDdkIsT0FBTyxFQUFFLE9BQU87WUFDaEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDOUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFO1lBQzlDLGFBQWEsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7UUFFRixNQUFNLFVBQVUscUJBQ1Isa0JBQWtCLElBQ3RCLGFBQWEsRUFBRSxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUNuSSxRQUFRLEVBQUUsU0FBUyxFQUNuQixhQUFhLEVBQUUsWUFBWSxDQUFDLGFBQWEsRUFDekMsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ3hJLG1DQUFtQyxFQUFFLFlBQVksQ0FBQyxtQ0FBbUMsRUFDckYsUUFBUSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQ3ZHLGNBQWMsRUFBRSxFQUFFLEVBQ2xCLDhCQUE4QixFQUFFLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxJQUFJLEtBQUssRUFDckYsUUFBUSxFQUFFLFNBQVMsRUFDbkIsUUFBUSxFQUFFLFNBQVMsRUFDbkIsTUFBTSxFQUFFLFNBQVMsRUFDakIsV0FBVyxFQUFFLFNBQVMsRUFDdEIsY0FBYyxFQUFFLFNBQVMsRUFDekIsYUFBYSxFQUFFLFNBQVMsRUFDeEIsY0FBYyxFQUFFLFNBQVMsRUFDekIsS0FBSyxFQUFFLFNBQVMsRUFDaEIsVUFBVSxFQUFFLFNBQVMsRUFDckIscUJBQXFCLEVBQUUsU0FBUyxFQUNoQyxZQUFZLEVBQUUsU0FBUyxFQUN2QixvQkFBb0IsRUFBRSxRQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FDeEQsQ0FBQztRQUVGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQzFELENBQUM7O0FBMURhLHNDQUFXLEdBQUcsd0JBQXdCLENBQUMifQ==