import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
import { assert } from 'chai';
import BannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
describe('BannerCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let session;
    beforeEach(() => {
        session = TestFixtures.getSession();
        parser = new BannerCampaignParser(Platform.ANDROID);
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
                return parse(BannerCampaignJSON);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof BannerCampaign, 'Campaign was not an VastCampaign');
                const json = BannerCampaignJSON;
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getMarkup(), encodeURIComponent(json.content), 'Markup is not the same');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQ2FtcGFpZ25QYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L0Jhbm5lcnMvUGFyc2Vycy9CYW5uZXJDYW1wYWlnblBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRS9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTlCLE9BQU8sa0JBQWtCLE1BQU0sZ0RBQWdELENBQUM7QUFDaEYsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDO0lBQ3BDLE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO0lBQ3pDLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBRWpELElBQUksTUFBNEIsQ0FBQztJQUNqQyxJQUFJLE9BQWdCLENBQUM7SUFFckIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFcEMsTUFBTSxHQUFHLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hELENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtRQUNoQyxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLElBQUksUUFBd0IsQ0FBQztZQUU3QixNQUFNLEtBQUssR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFO2dCQUN4QixNQUFNLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDM0QsUUFBUSxHQUFtQixjQUFjLENBQUM7Z0JBQzlDLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDO1lBRUYsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixPQUFPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtnQkFDOUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLFlBQVksY0FBYyxFQUFFLGtDQUFrQyxDQUFDLENBQUM7Z0JBRXRGLE1BQU0sSUFBSSxHQUFHLGtCQUFrQixDQUFDO2dCQUVoQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLDBCQUEwQixDQUFDLENBQUM7Z0JBQ3pFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1lBQ25HLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=