import { AdsConfiguration, AdsConfigurationMock } from 'Ads/Models/__mocks__/AdsConfiguration';
import { Placement } from 'Ads/Models/__mocks__/Placement.ts';
import { Observable, ObservableMock } from 'Core/Utilities/__mocks__/Observable';

import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionResponseParser } from 'Ads/Parsers/AuctionResponseParser';

// TODO: Update once json importing is fixed for .spec.ts
const AuctionV6Response = require('json/AuctionV6Response.json');

describe('AuctionResponseParser', () => {
    let adsConfig: AdsConfigurationMock;

    beforeEach(() => {
        adsConfig = AdsConfiguration();

        adsConfig.getPlacements.mockReturnValue({
            premium: Placement('premium'),
            video: Placement('video'),
            rewardedVideoZone: Placement('rewardedVideoZone'),
            mraid: Placement('mraid')
        });
    });

    describe('parse', () => {

        describe('when parsing succeeds', () => {
            let auctionResponses: AuctionResponse[];
            let nofillPlacementIds: string[];
            let onAdPlanReceived: ObservableMock;

            beforeEach(() => {
                nofillPlacementIds = [];

                const handleNofill = (placementId: string) => {
                    nofillPlacementIds.push(placementId);
                };

                onAdPlanReceived = new Observable();

                auctionResponses = AuctionResponseParser.parse(JSON.stringify(AuctionV6Response), adsConfig, handleNofill, onAdPlanReceived, undefined);
            });

            it('should call getPlacements', () => {
                expect(adsConfig.getPlacements).toBeCalledTimes(1);
            });

            it('should nofill for a single placement', () => {
                expect(nofillPlacementIds.length).toEqual(1);
            });

            it('should nofill for mraid placement', () => {
                expect(nofillPlacementIds[0]).toEqual('mraid');
            });

            it('should trigger onAdPlanReceived', () => {
                expect(onAdPlanReceived.trigger).toBeCalledTimes(1);
            });

            it('should trigger onAdPlanReceived with correct arguments', () => {
                expect(onAdPlanReceived.trigger).toBeCalledWith(3600, 1, 0);
            });

            it('should return three auctionPlacements', () => {
                expect(auctionResponses.length).toEqual(1);
            });

            it('should have the correct auction id', () => {
                expect(auctionResponses[0].getAuctionId()).toEqual('auction-v6-fake-auction-id');
            });

            it('should contain the correct amount of AuctionPlacements', () => {
                expect(auctionResponses[0].getPlacements().length).toEqual(3);
            });

            it('should contain the correct placementId', () => {
                expect(auctionResponses[0].getPlacements()[0].getPlacementId()).toEqual('premium');
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
                expect(auctionResponses[0].getPlacements()[0].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });
        });
    });
});
