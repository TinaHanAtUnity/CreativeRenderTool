import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import OnProgrammaticMraidPlcCampaign from 'json/OnProgrammaticMraidPlcCampaign.json';
import 'mocha';
describe('AuctionResponse', () => {
    describe('when created with response json', () => {
        it('should have correct data from the json', () => {
            const json = OnProgrammaticMraidPlcCampaign;
            const mediaId = 'UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85';
            const campaignObject = json.media[mediaId];
            const correlationId = json.correlationId;
            const statusCode = json.statusCode;
            const placements = [];
            for (const placement in json.placements) {
                if (json.placements.hasOwnProperty(placement)) {
                    const auctionPlacement = new AuctionPlacement(placement, mediaId);
                    placements.push(auctionPlacement);
                }
            }
            const auctionResponse = new AuctionResponse(placements, campaignObject, mediaId, correlationId, statusCode);
            assert.equal(auctionResponse.getPlacements(), placements, 'Placements not what was expected');
            assert.equal(auctionResponse.getContentType(), campaignObject.contentType, 'ContentType not what was expected');
            assert.equal(auctionResponse.getContent(), campaignObject.content, 'Content not what was expected');
            assert.equal(auctionResponse.getCacheTTL(), campaignObject.cacheTTL, 'CacheTTL not what was expected');
            assert.deepEqual(auctionResponse.getTrackingUrls(), campaignObject.trackingUrls, 'TrackingUrls not what was expected');
            assert.equal(auctionResponse.getAdType(), campaignObject.adType, 'AdType not what was expected');
            assert.equal(auctionResponse.getCreativeId(), campaignObject.creativeId, 'CreativeId not what was expected');
            assert.equal(auctionResponse.getSeatId(), campaignObject.seatId, 'SeatId not what was expected');
            assert.equal(auctionResponse.getCategory(), campaignObject.appCategory, 'AppCategory not what was expected');
            assert.equal(auctionResponse.getSubCategory(), campaignObject.appSubCategory, 'AppSubCategory not what was expected');
            assert.equal(auctionResponse.getCorrelationId(), correlationId, 'CorrelationId not what was expected');
            assert.equal(auctionResponse.getUseWebViewUserAgentForTracking(), campaignObject.useWebViewUserAgentForTracking, 'UseWebViewUserAgentForTracking not what was expected');
            assert.equal(auctionResponse.isMoatEnabled(), campaignObject.isMoatEnabled, 'IsMoatEnabled not what was expected');
            assert.equal(auctionResponse.getStatusCode(), statusCode, 'statusCode not what was expected');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlc3BvbnNlVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvQXVjdGlvblJlc3BvbnNlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixPQUFPLDhCQUE4QixNQUFNLDBDQUEwQyxDQUFDO0FBQ3RGLE9BQU8sT0FBTyxDQUFDO0FBRWYsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRTtJQUM3QixRQUFRLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1FBQzdDLEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7WUFDOUMsTUFBTSxJQUFJLEdBQVEsOEJBQThCLENBQUM7WUFDakQsTUFBTSxPQUFPLEdBQVcseUNBQXlDLENBQUM7WUFDbEUsTUFBTSxjQUFjLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNoRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ3pDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDbkMsTUFBTSxVQUFVLEdBQXVCLEVBQUUsQ0FBQztZQUUxQyxLQUFLLE1BQU0sU0FBUyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLEVBQUU7b0JBQzNDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ2xFLFVBQVUsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztpQkFDckM7YUFDSjtZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM1RyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxVQUFVLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUM5RixNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxjQUFjLENBQUMsV0FBVyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7WUFDaEgsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxRQUFRLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztZQUN2RyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxjQUFjLENBQUMsWUFBWSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7WUFDdkgsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLEVBQUUsY0FBYyxDQUFDLE1BQU0sRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1lBQ2pHLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLGNBQWMsQ0FBQyxVQUFVLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUM3RyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLDhCQUE4QixDQUFDLENBQUM7WUFDakcsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLFdBQVcsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzdHLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGNBQWMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxjQUFjLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztZQUN0SCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ3ZHLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGlDQUFpQyxFQUFFLEVBQUUsY0FBYyxDQUFDLDhCQUE4QixFQUFFLHNEQUFzRCxDQUFDLENBQUM7WUFDekssTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLEVBQUUsY0FBYyxDQUFDLGFBQWEsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQ25ILE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ2xHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9