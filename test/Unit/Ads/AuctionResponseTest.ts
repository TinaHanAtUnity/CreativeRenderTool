import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { assert } from 'chai';

import OnProgrammaticMraidPlcCampaign from 'json/OnProgrammaticMraidPlcCampaign.json';
import 'mocha';

describe('AuctionResponse', () => {
    describe('when created with response json', () => {
        it('should have correct data from the json', () => {
            const json: any = JSON.parse(OnProgrammaticMraidPlcCampaign);
            const mediaId: string = 'UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85';
            const campaignObject: any = json.media[mediaId];
            const correlationId = json.correlationId;
            const placements: string[] = [];

            for(const placement in json.placements) {
                if(json.placements.hasOwnProperty(placement)) {
                    placements.push(placement);
                }
            }

            const auctionResponse = new AuctionResponse(placements, campaignObject, mediaId, correlationId);
            assert.equal(auctionResponse.getPlacements(), placements, 'Placements not what was expected');
            assert.equal(auctionResponse.getContentType(), campaignObject.contentType, 'ContentType not what was expected');
            assert.equal(auctionResponse.getContent(), campaignObject.content, 'Content not what was expected');
            assert.equal(auctionResponse.getCacheTTL(), campaignObject.cacheTTL, 'CacheTTL not what was expected');
            assert.deepEqual(auctionResponse.getTrackingUrls(), campaignObject.trackingUrls, 'TrackingUrls not what was expected');
            assert.equal(auctionResponse.getAdType(), campaignObject.adType, 'AdType not what was expected');
            assert.equal(auctionResponse.getCreativeId(), campaignObject.creativeId, 'CreativeId not what was expected');
            assert.equal(auctionResponse.getSeatId(), campaignObject.seatId, 'SeatId not what was expected');
            assert.equal(auctionResponse.getCategory(), campaignObject.appCategory, 'AppCategory not what was expected');
            assert.equal(auctionResponse.getSubCategory(), campaignObject.appSubCategory, 'AppSubCategory not what was expected');
            assert.equal(auctionResponse.getCorrelationId(), correlationId, 'CorrelationId not what was expected');
            assert.equal(auctionResponse.getUseWebViewUserAgentForTracking(), campaignObject.useWebViewUserAgentForTracking, 'UseWebViewUserAgentForTracking not what was expected');
            assert.equal(auctionResponse.isMoatEnabled(), campaignObject.isMoatEnabled, 'IsMoatEnabled not what was expected');
        });
    });
});
