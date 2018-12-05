import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
import { assert } from 'chai';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import BannerCampaignJSON from 'json/campaigns/banner/ValidBannerCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';

describe('BannerCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: BannerCampaignParser;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        core = TestFixtures.getCoreApi(nativeBridge);
        request = sinon.createStubInstance(RequestManager);
        session = TestFixtures.getSession();

        parser = new BannerCampaignParser();
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: BannerCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(Platform.ANDROID, core, request, response, session).then((parsedCampaign) => {
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
