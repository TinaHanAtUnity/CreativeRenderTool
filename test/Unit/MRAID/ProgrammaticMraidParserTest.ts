import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
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

    let parser: ProgrammaticMraidParser;
    let platform: Platform;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        session = TestFixtures.getSession();

        parser = new ProgrammaticMraidParser(platform);
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: MRAIDCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <MRAIDCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(ProgrammaticMRAIDCampaign)
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof MRAIDCampaign, 'Campaign was not an MRAIDCampaign');

                const json = ProgrammaticMRAIDCampaign
                const content = JSON.parse(json.content);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs is not equal');
                assert.equal(campaign.getResource()!, decodeURIComponent(content.markup), 'MRAID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
            });
        });
    });
});
