import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { Url } from 'Core/Utilities/Url';
import ProgrammaticMRAIDCampaign from 'json/campaigns/mraid/ProgrammaticMRAIDCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('ProgrammaticMraidUrlParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let platform;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        session = TestFixtures.getSession();
        parser = new ProgrammaticMraidUrlParser(platform);
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
                assert.equal(campaign.getResourceUrl().getUrl(), Url.encode(content.inlinedUrl), 'MRAID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljTXJhaWRVcmxQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL1Byb2dyYW1tYXRpY01yYWlkVXJsUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLE9BQU8seUJBQXlCLE1BQU0scURBQXFELENBQUM7QUFDNUYsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDdEYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELFFBQVEsQ0FBQyw0QkFBNEIsRUFBRSxHQUFHLEVBQUU7SUFDeEMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDO0lBQ3BDLE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO0lBQ3pDLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBRWpELElBQUksTUFBa0MsQ0FBQztJQUN2QyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBRXJCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUM1QixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRXBDLE1BQU0sR0FBRyxJQUFJLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtRQUNoQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLElBQUksUUFBdUIsQ0FBQztZQUU1QixNQUFNLEtBQUssR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFO2dCQUN4QixNQUFNLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDM0QsUUFBUSxHQUFrQixjQUFjLENBQUM7Z0JBQzdDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDO1lBRUYsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixPQUFPLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtnQkFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFlBQVksYUFBYSxFQUFFLG1DQUFtQyxDQUFDLENBQUM7Z0JBRXRGLE1BQU0sSUFBSSxHQUFHLHlCQUF5QixDQUFDO2dCQUN2QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFekMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLE9BQU8sRUFBRSwwQkFBMEIsQ0FBQyxDQUFDO2dCQUN6RSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLDRCQUE0QixDQUFDLENBQUM7Z0JBQzlGLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLG9CQUFvQixDQUFDLENBQUM7Z0JBQ3hHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsT0FBTyxDQUFDLGFBQWEsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1lBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=