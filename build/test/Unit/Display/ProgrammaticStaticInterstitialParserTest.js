import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';
import DisplayStaticInterstitialCampaignHTML from 'json/campaigns/display/DisplayStaticInterstitialCampaignHTML.json';
import DisplayStaticInterstitialCampaignJS from 'json/campaigns/display/DisplayStaticInterstitialCampaignJS.json';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('ProgrammaticStaticInterstitialParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let platform;
    let parser;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        session = TestFixtures.getSession();
    });
    describe('parsing an HTML campaign', () => {
        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(platform);
        });
        describe('with proper HTML payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            beforeEach(() => {
                return parse(DisplayStaticInterstitialCampaignHTML);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');
                const json = DisplayStaticInterstitialCampaignHTML;
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });
    describe('parsing a JS campaign', () => {
        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(platform);
        });
        describe('with wrapped JS payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            beforeEach(() => {
                return parse(DisplayStaticInterstitialCampaignJS);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');
                const json = DisplayStaticInterstitialCampaignJS;
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljU3RhdGljSW50ZXJzdGl0aWFsUGFyc2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9EaXNwbGF5L1Byb2dyYW1tYXRpY1N0YXRpY0ludGVyc3RpdGlhbFBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTdELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDRDQUE0QyxDQUFDO0FBQ3pGLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLHNEQUFzRCxDQUFDO0FBRTVHLE9BQU8scUNBQXFDLE1BQU0sbUVBQW1FLENBQUM7QUFDdEgsT0FBTyxtQ0FBbUMsTUFBTSxpRUFBaUUsQ0FBQztBQUNsSCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxRQUFRLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxFQUFFO0lBQ2xELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQztJQUNwQyxNQUFNLE9BQU8sR0FBRyx3QkFBd0IsQ0FBQztJQUN6QyxNQUFNLGFBQWEsR0FBRywwQkFBMEIsQ0FBQztJQUVqRCxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxNQUE0QyxDQUFDO0lBQ2pELElBQUksT0FBZ0IsQ0FBQztJQUVyQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN4QyxDQUFD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