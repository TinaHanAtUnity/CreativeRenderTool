// todo: fix tests
/*
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';

import XPromoCampaignJSON from 'json/campaigns/xpromo/XPromoCampaign.json';
import 'mocha';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';

describe('XPromoCampaignParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: XPromoCampaignParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new XPromoCampaignParser();
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: XPromoCampaign;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <XPromoCampaign>parsedCampaign;
                });
            };

            const getStore = (store: string) => {
                switch (store) {
                case 'apple':
                    return StoreName.APPLE;
                case 'google':
                    return StoreName.GOOGLE;
                case 'xiaomi':
                    return StoreName.XIAOMI;
                case 'standalone_android':
                    return StoreName.STANDALONE_ANDROID;
                default:
                    throw new Error('Unknown store value "' + store + '"');
                }
            };

            beforeEach(() => {
                return parse(JSON.parse(XPromoCampaignJSON));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof XPromoCampaign, 'Campaign was not an MRAIDCampaign');

                const json = JSON.parse(XPromoCampaignJSON);
                const content = JSON.parse(json.content);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getCreativeId(), json.creativeId, 'CreativeId is not the equal');
                assert.equal(campaign.getId(), content.id, 'ID is not equal');
                assert.equal(campaign.getMeta(), content.meta, 'Meta is not equal');
                assert.equal(campaign.getClickAttributionUrl(), Url.encode(content.clickAttributionUrl), 'Click Attribution URL is not equal');
                assert.equal(campaign.getClickAttributionUrlFollowsRedirects(), content.clickAttributionUrlFollowsRedirects, 'Click Attribution Url follows redirects is not equal');
                assert.equal(campaign.getGameName(), content.gameName, 'Game Name is equal');
                assert.equal(campaign.getGameIcon().getUrl(), Url.encode(content.gameIcon), 'Game Icon is not equal');
                assert.equal(campaign.getRating(), content.rating, 'Rating is not the same');
                assert.equal(campaign.getLandscape().getOriginalUrl(), Url.encode(content.endScreenLandscape), 'Landscape URL is not equal');
                assert.equal(campaign.getPortrait().getOriginalUrl(), Url.encode(content.endScreenPortrait), 'Portrait URL is not equal');
                assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
                assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
                assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
                assert.equal(campaign.getVideo()!.getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(campaign.getStreamingVideo()!.getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
            });
        });
    });
});
*/
