import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
export class ProgrammaticMraidParser extends CampaignParser {
    parse(response, session) {
        const jsonMraid = response.getJsonContent();
        if (!jsonMraid) {
            throw new Error('Corrupted mraid content');
        }
        if (!jsonMraid.markup) {
            const MRAIDError = new DiagnosticError(new Error('MRAID Campaign missing markup'), { mraid: jsonMraid });
            throw MRAIDError;
        }
        const markup = decodeURIComponent(jsonMraid.markup);
        const cacheTTL = response.getCacheTTL();
        const baseCampaignParams = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticMraidParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraid.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        const parameters = Object.assign({}, baseCampaignParams, { resourceAsset: undefined, resource: markup, dynamicMarkup: jsonMraid.dynamicMarkup, clickAttributionUrl: jsonMraid.clickAttributionUrl ? this.validateAndEncodeUrl(jsonMraid.clickAttributionUrl, session) : undefined, clickAttributionUrlFollowsRedirects: jsonMraid.clickAttributionUrlFollowsRedirects, clickUrl: jsonMraid.clickUrl ? this.validateAndEncodeUrl(jsonMraid.clickUrl, session) : undefined, videoEventUrls: {}, gameName: undefined, gameIcon: undefined, rating: undefined, ratingCount: undefined, landscapeImage: undefined, portraitImage: undefined, bypassAppSheet: undefined, store: undefined, appStoreId: undefined, useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking() || false, playableConfiguration: undefined, targetGameId: undefined, isCustomCloseEnabled: response.isCustomCloseEnabled() });
        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
ProgrammaticMraidParser.ContentType = 'programmatic/mraid';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvUGFyc2Vycy9Qcm9ncmFtbWF0aWNNcmFpZFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzlELE9BQU8sRUFBa0IsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFPM0UsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGNBQWM7SUFJaEQsS0FBSyxDQUFDLFFBQXlCLEVBQUUsT0FBZ0I7UUFDcEQsTUFBTSxTQUFTLEdBQXNCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUUvRCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQzlDO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFlLENBQ2xDLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLEVBQzFDLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUN2QixDQUFDO1lBQ0YsTUFBTSxVQUFVLENBQUM7U0FDcEI7UUFFRCxNQUFNLE1BQU0sR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRXhDLE1BQU0sa0JBQWtCLEdBQWM7WUFDbEMsRUFBRSxFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRTtZQUNwQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNqRSxXQUFXLEVBQUUsdUJBQXVCLENBQUMsV0FBVztZQUNoRCxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVM7WUFDekMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLFNBQVM7WUFDdkQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxTQUFTO1lBQ2pELE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksU0FBUztZQUN6QyxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUk7WUFDcEIsT0FBTyxFQUFFLE9BQU87WUFDaEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDOUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFO1lBQzlDLGFBQWEsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7UUFFRixNQUFNLFVBQVUscUJBQ1Isa0JBQWtCLElBQ3RCLGFBQWEsRUFBRSxTQUFTLEVBQ3hCLFFBQVEsRUFBRSxNQUFNLEVBQ2hCLGFBQWEsRUFBRSxTQUFTLENBQUMsYUFBYSxFQUN0QyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDbEksbUNBQW1DLEVBQUUsU0FBUyxDQUFDLG1DQUFtQyxFQUNsRixRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDakcsY0FBYyxFQUFFLEVBQUUsRUFDbEIsUUFBUSxFQUFFLFNBQVMsRUFDbkIsUUFBUSxFQUFFLFNBQVMsRUFDbkIsTUFBTSxFQUFFLFNBQVMsRUFDakIsV0FBVyxFQUFFLFNBQVMsRUFDdEIsY0FBYyxFQUFFLFNBQVMsRUFDekIsYUFBYSxFQUFFLFNBQVMsRUFDeEIsY0FBYyxFQUFFLFNBQVMsRUFDekIsS0FBSyxFQUFFLFNBQVMsRUFDaEIsVUFBVSxFQUFFLFNBQVMsRUFDckIsOEJBQThCLEVBQUUsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLElBQUksS0FBSyxFQUNyRixxQkFBcUIsRUFBRSxTQUFTLEVBQ2hDLFlBQVksRUFBRSxTQUFTLEVBQ3ZCLG9CQUFvQixFQUFFLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUN4RCxDQUFDO1FBRUYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQzs7QUEzRGEsbUNBQVcsR0FBRyxvQkFBb0IsQ0FBQyJ9