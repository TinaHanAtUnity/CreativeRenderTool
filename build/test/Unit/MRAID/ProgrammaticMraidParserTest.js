import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import ProgrammaticMRAIDCampaign from 'json/campaigns/mraid/ProgrammaticMRAIDCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('ProgrammaticMraidParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let platform;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        session = TestFixtures.getSession();
        parser = new ProgrammaticMraidParser(platform);
    });
    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            beforeEach(() => {
                return parse(ProgrammaticMRAIDCampaign);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof MRAIDCampaign, 'Campaign was not an MRAIDCampaign');
                const json = ProgrammaticMRAIDCampaign;
                const content = JSON.parse(json.content);
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs is not equal');
                assert.equal(campaign.getResource(), decodeURIComponent(content.markup), 'MRAID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL1Byb2dyYW1tYXRpY01yYWlkUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyx5QkFBeUIsTUFBTSxxREFBcUQsQ0FBQztBQUM1RixPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUNoRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7SUFDcEMsTUFBTSxPQUFPLEdBQUcsd0JBQXdCLENBQUM7SUFDekMsTUFBTSxhQUFhLEdBQUcsMEJBQTBCLENBQUM7SUFFakQsSUFBSSxNQUErQixDQUFDO0lBQ3BDLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFFckIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFcEMsTUFBTSxHQUFHLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkQsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO1FBQ2hDLFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7WUFDeEMsSUFBSSxRQUF1QixDQUFDO1lBRTVCLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBUyxFQUFFLEVBQUU7Z0JBQ3hCLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BFLE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN2RixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO29CQUMzRCxRQUFRLEdBQWtCLGNBQWMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUM7WUFFRixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLE9BQU8sS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO2dCQUM5QixNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsWUFBWSxhQUFhLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztnQkFFdEYsTUFBTSxJQUFJLEdBQUcseUJBQXlCLENBQUM7Z0JBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUV6QyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLDBCQUEwQixDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztnQkFDOUYsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFHLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQ2hHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=