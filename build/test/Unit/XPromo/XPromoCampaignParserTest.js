import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { SdkApi } from 'Core/Native/Sdk';
import { Url } from 'Core/Utilities/Url';
import XPromoCampaignJSON from 'json/campaigns/xpromo/XPromoCampaign.json';
import 'mocha';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromoCampaignParser } from 'XPromo/Parsers/XPromoCampaignParser';
describe('XPromoCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        core.Sdk = sinon.createStubInstance(SdkApi);
        session = TestFixtures.getSession();
        parser = new XPromoCampaignParser(platform);
    });
    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                parser.setCreativeIdentification(response);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            const getStore = (store) => {
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
                return parse(XPromoCampaignJSON);
            });
            it('should set the creative identification in the parser', () => {
                assert.isNotNull(parser.creativeID);
                assert.isNotNull(parser.seatID);
                assert.equal(parser.creativeID, campaign.getCreativeId());
                assert.equal(parser.seatID, campaign.getSeatId());
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof XPromoCampaign, 'Campaign was not an MRAIDCampaign');
                const json = XPromoCampaignJSON;
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
                assert.equal(campaign.getSquare().getOriginalUrl(), Url.encode(content.endScreen), 'Portrait URL is not equal');
                assert.equal(campaign.getBypassAppSheet(), content.bypassAppSheet, 'Bypass App Sheet is not equal');
                assert.equal(campaign.getStore(), getStore(content.store), 'Store is not equal');
                assert.equal(campaign.getAppStoreId(), content.appStoreId, 'App Store ID is not equal');
                assert.equal(campaign.getVideo().getUrl(), Url.encode(content.trailerDownloadable), 'Downloadable Trailer URL is not equal');
                assert.equal(campaign.getStreamingVideo().getUrl(), Url.encode(content.trailerStreaming), 'Downloadable Trailer URL is not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQ2FtcGFpZ25QYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1hQcm9tby9YUHJvbW9DYW1wYWlnblBhcnNlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRy9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFekMsT0FBTyxrQkFBa0IsTUFBTSwyQ0FBMkMsQ0FBQztBQUMzRSxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNuRSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTNFLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDO0lBQ3BDLE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO0lBQ3pDLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBRWpELElBQUksTUFBNEIsQ0FBQztJQUNqQyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIs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