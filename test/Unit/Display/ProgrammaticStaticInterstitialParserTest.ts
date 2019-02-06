import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';

import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

import DisplayStaticInterstitialCampaignHTML from 'json/campaigns/display/DisplayStaticInterstitialCampaignHTML.json';
import DisplayStaticInterstitialCampaignJS from 'json/campaigns/display/DisplayStaticInterstitialCampaignJS.json';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('ProgrammaticVPAIDParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let platform: Platform;
    let parser: ProgrammaticStaticInterstitialParser;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        session = TestFixtures.getSession();
    });

    describe('parsing an HTML campaign', () => {

        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(platform, false);
        });

        describe('with proper HTML payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignHTML));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignHTML);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });

    describe('parsing a JS campaign', () => {
        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(platform, true);
        });

        describe('with proper JS payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignJS));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignJS);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), '<script>' + decodeURIComponent(json.content) + '</script>', 'Dynamic Markup is not equal');
            });
        });
    });
});
