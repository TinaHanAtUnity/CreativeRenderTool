import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
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
            'outOfBoundsStartPlacement': Placement('outOfBoundsStartPlacement'),
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
                expect(parsedAuctionResponse.auctionId).toEqual('auction-v6-fake-auction-id');
            });

            it('should contain the correct refreshDelay', () => {
                expect(parsedAuctionResponse.refreshDelay).toEqual(3600);
            });

            it('should contain the correct refreshDelay', () => {
                expect(parsedAuctionResponse.auctionStatusCode).toEqual(AuctionStatusCode.NORMAL);
            });

            it('should contain the correct amount of AuctionPlacements', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements().length).toEqual(4);
            });

            it('should contain the correct placementIds', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[0].getPlacementId()).toEqual('premium');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[1].getPlacementId()).toEqual('video');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[2].getPlacementId()).toEqual('rewardedVideoZone');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[3].getPlacementId()).toEqual('outOfBoundsStartPlacement');
            });

            it('should contain the correct trackingUrls for premium', () => {
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

            it('should contain the correct trackingUrls for video', () => {
                const expectedTrackingUrls = {
                    impression: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/placement=video?eventType={{eventType}}'
                    ]
                };
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[1].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });

            it('should contain the correct trackingUrls for rewardedVideoZone', () => {
                const expectedTrackingUrls = {
                    unsupportedEvent: [
                        'https://ads.brand.postback.unity3d.com/impression/placement=rewardedVideoZone?data=rewardedVideoZoneDataBlob?secret=fifthQuartile'
                    ]
                };
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[2].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });

            it('should contain the correct trackingUrls for outOfBoundsStartPlacement with two out of bounds entries', () => {
                const expectedTrackingUrls = {
                    start: [
                        'https://ads.brand.postback.unity3d.com/impression/placement=oobPlacement?data=outOfBoundsData?secret=scott'
                    ],
                    complete: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/placement=oobPlacement?eventType=complete'
                    ]
                };
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[3].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });
        });
    });
});
