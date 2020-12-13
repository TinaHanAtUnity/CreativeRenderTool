import { HTML } from 'Ads/Models/Assets/HTML';
import { assert } from 'chai';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('MRAIDCampaign', () => {
    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const configuration = TestFixtures.getCoreConfiguration();
            const json = OnProgrammaticMraidUrlPlcCampaign;
            const media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
            const mraidJson = JSON.parse(media.content);
            const asset = new HTML(mraidJson.inlinedUrl, TestFixtures.getSession());
            mraidJson.id = 'testId';
            const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
            const campaign = new MRAIDCampaign(params);
            assert.equal(campaign.getId(), mraidJson.id);
            assert.deepEqual(campaign.getResourceUrl(), asset);
            assert.deepEqual(campaign.getRequiredAssets(), [asset]);
            assert.deepEqual(campaign.getOptionalAssets(), []);
            assert.equal(campaign.getResource(), '<div>resource</div>');
            assert.equal(campaign.getDynamicMarkup(), mraidJson.dynamicMarkup);
            assert.equal(campaign.getUseWebViewUserAgentForTracking(), media.useWebViewUserAgentForTracking);
            const willExpireAt = campaign.getWillExpireAt();
            assert.isDefined(willExpireAt, 'Will expire at should be defined');
            if (willExpireAt) {
                const timeDiff = willExpireAt - (Date.now() + media.cacheTTL * 1000);
                assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
            }
        });
        it('should have correct additional tracking from the json', () => {
            const json = OnProgrammaticMraidUrlPlcCampaign;
            const media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
            const mraidJson = JSON.parse(media.content);
            mraidJson.id = 'testId';
            const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
            const campaign = new MRAIDCampaign(params);
            assert.deepEqual(campaign.getTrackingUrls(), media.trackingUrls);
        });
        it('should set resourceUrl', () => {
            const json = OnProgrammaticMraidUrlPlcCampaign;
            const media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            mraidJson.id = 'testId';
            const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
            const campaign = new MRAIDCampaign(params);
            const asset = new HTML('https://resource-url.com', TestFixtures.getSession());
            campaign.setResourceUrl('https://resource-url.com');
            assert.deepEqual(campaign.getResourceUrl(), asset);
        });
        it('should set resource', () => {
            const json = OnProgrammaticMraidUrlPlcCampaign;
            const media = json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'];
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            mraidJson.id = 'testId';
            const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, media.cacheTTL, mraidJson.id);
            const campaign = new MRAIDCampaign(params);
            campaign.setResource('some resource');
            assert.equal(campaign.getResource(), 'some resource');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURDYW1wYWlnblRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvTVJBSUQvTVJBSURDYW1wYWlnblRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzlDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUIsT0FBTyxpQ0FBaUMsTUFBTSw2Q0FBNkMsQ0FBQztBQUM1RixPQUFPLE9BQU8sQ0FBQztBQUVmLE9BQU8sRUFBa0IsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0UsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO0lBRTNCLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDN0MsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtZQUM5QyxNQUFNLGFBQWEsR0FBRyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUMxRCxNQUFNLElBQUksR0FBRyxpQ0FBaUMsQ0FBQztZQUMvQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFDcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUN4RSxTQUFTLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQztZQUV4QixNQUFNLE1BQU0sR0FBbUIsWUFBWSxDQUFDLGtDQUFrQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENB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