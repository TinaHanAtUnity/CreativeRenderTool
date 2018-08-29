import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { BannerCampaignParser } from 'AdTypes/Banner/Parsers/BannerCampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Session } from 'Models/Session';
import { AuctionResponse } from 'Models/AuctionResponse';
import { BannerCampaign } from 'AdTypes/Banner/Models/Campaigns/BannerCampaign';
import { Request } from 'Utilities/Request';

import BannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import { ABGroupBuilder } from 'Models/ABGroup';

describe('BannerCampaignParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = ABGroupBuilder.getAbGroup(99);

    let parser: BannerCampaignParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new BannerCampaignParser();
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: BannerCampaign;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <BannerCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(BannerCampaignJSON));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof BannerCampaign, 'Campaign was not an VastCampaign');

                const json = JSON.parse(BannerCampaignJSON);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getMarkup(), encodeURIComponent(json.content), 'Markup is not the same');
            });
        });
    });
});
