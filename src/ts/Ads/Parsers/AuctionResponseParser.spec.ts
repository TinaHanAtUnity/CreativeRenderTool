import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement.ts';
import { AuctionResponseParser, IParsedAuctionResponse } from 'Ads/Parsers/AuctionResponseParser';

// TODO: Update once json importing is fixed for .spec.ts
const AuctionV6Response = require('json/AuctionV6Response.json');

describe('AuctionResponseParser', () => {

    let placements: { [id: string]: PlacementMock };

    beforeEach(() => {

        placements = {
            'premium': Placement('premium'),
            'video': Placement('video'),
            'rewardedVideoZone': Placement('rewardedVideoZone'),
            'mraid': Placement('mraid')
        };
    });

    describe('parse', () => {

        describe('when parsing succeeds', () => {
            let parsedAuctionResponse: IParsedAuctionResponse;

            beforeEach(() => {
                parsedAuctionResponse = AuctionResponseParser.parse(JSON.stringify(AuctionV6Response), placements);
            });

            it('should nofill for a single placement', () => {
                expect(parsedAuctionResponse.unfilledPlacementIds.length).toEqual(1);
            });

            it('should nofill for mraid placement', () => {
                expect(parsedAuctionResponse.unfilledPlacementIds[0]).toEqual('mraid');
            });

            it('should return one auctionResponse', () => {
                expect(parsedAuctionResponse.auctionResponses.length).toEqual(1);
            });

            it('should have the correct auction id', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getAuctionId()).toEqual('auction-v6-fake-auction-id');
            });

            it('should contain the correct amount of AuctionPlacements', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements().length).toEqual(3);
            });

            it('should contain the correct placementId', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[0].getPlacementId()).toEqual('premium');
            });

            it('should contain the correct refreshDelay', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getRefreshDelay()).toEqual(3600);
            });

            it('should contain the correct trackingUrls', () => {
                const expectedTrackingUrls = {
                    start: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/placement=premiumAuction?eventType=start',
                        'https://ads.brand.postback.unity3d.com/impression/placement=premiumAuction?data=premiumDataBlob?secret=scott'
                    ],
                    complete: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/placement=premiumAuction?eventType=complete'
                    ]
                };
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[0].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });
        });
    });
});
