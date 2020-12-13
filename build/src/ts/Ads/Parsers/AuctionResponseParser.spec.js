import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { Placement } from 'Ads/Models/__mocks__/Placement.ts';
import { AuctionResponseParser } from 'Ads/Parsers/AuctionResponseParser';
// TODO: Update once json importing is fixed for .spec.ts
// eslint-disable-next-line
const AuctionV6Response = require('json/AuctionV6Response.json');
describe('AuctionResponseParser', () => {
    let placements;
    beforeEach(() => {
        placements = {
            'premium': Placement('premium'),
            'video': Placement('video'),
            'rewardedVideoZone': Placement('rewardedVideoZone'),
            'outOfBoundsStartPlacement': Placement('outOfBoundsStartPlacement'),
            'emptyTracking': Placement('outOfBoundsStartPlacement'),
            'mraid': Placement('mraid')
        };
    });
    describe('parse', () => {
        describe('when parsing succeeds', () => {
            let parsedAuctionResponse;
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
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements().length).toEqual(5);
            });
            it('should contain the correct placementIds', () => {
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[0].getPlacementId()).toEqual('premium');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[1].getPlacementId()).toEqual('video');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[2].getPlacementId()).toEqual('rewardedVideoZone');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[3].getPlacementId()).toEqual('outOfBoundsStartPlacement');
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[4].getPlacementId()).toEqual('emptyTracking');
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
            it('should contain the correct trackingUrls for emptyTracking with two out of bounds entries', () => {
                const expectedTrackingUrls = {};
                expect(parsedAuctionResponse.auctionResponses[0].getPlacements()[4].getTrackingUrls()).toStrictEqual(expectedTrackingUrls);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlc3BvbnNlUGFyc2VyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1BhcnNlcnMvQXVjdGlvblJlc3BvbnNlUGFyc2VyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLFNBQVMsRUFBaUIsTUFBTSxtQ0FBbUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUscUJBQXFCLEVBQTBCLE1BQU0sbUNBQW1DLENBQUM7QUFFbEcseURBQXlEO0FBQ3pELDJCQUEyQjtBQUMzQixNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBRWpFLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7SUFFbkMsSUFBSSxVQUEyQyxDQUFDO0lBRWhELFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFFWixVQUFVLEdBQUc7WUFDVCxTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQztZQUMvQixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQztZQUMzQixtQkFBbUIsRUFBRSxTQUFTLENBQUMsbUJBQW1CLENBQUM7WUFDbkQsMkJBQTJCLEVBQUUsU0FBUyxDQUFDLDJCQUEyQixDQUFDO1lBQ25FLGVBQWUsRUFBRSxTQUFTLENBQUMsMkJBQTJCLENBQUM7WUFDdkQsT0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUM7U0FDOUIsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7UUFFbkIsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUNuQyxJQUFJLHFCQUE2QyxDQUFDO1lBRWxELFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1oscUJBQXFCLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2RyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzVDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUN6QyxNQUFNLENBQUMscUJBQXFCLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUN6QyxNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHlDQUF5QyxFQUFFLEdBQUcsRUFBRTtnQkFDL0MsTUFBTSxDQUFDLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLEVBQUU7Z0JBQy9DLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0RixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3REFBd0QsRUFBRSxHQUFHLEVBQUU7Z0JBQzlELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEYsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUNBQXlDLEVBQUUsR0FBRyxFQUFFO2dCQUMvQyxNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3pHLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkcsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7Z0JBQ25ILE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUMzSCxNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkgsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscURBQXFELEVBQUUsR0FBRyxFQUFFO2dCQUMzRCxNQUFNLG9CQUFvQixHQUFHO29CQUN6QixLQUFLLEVBQUU7d0JBQ0gsaUdBQWlHO3dCQUNqRyw4R0FBOEc7cUJBQ2pIO29CQUNELFFBQVEsRUFBRTt3QkFDTixvR0FBb0c7cUJBQ3ZHO2lCQUNKLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7WUFDL0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsbURBQW1ELEVBQUUsR0FBRyxFQUFFO2dCQUN6RCxNQUFNLG9CQUFvQixHQUFHO29CQUN6QixVQUFVLEVBQUU7d0JBQ1IsZ0dBQWdHO3FCQUNuRztpQkFDSixDQUFDO2dCQUNGLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQy9ILENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtEQUErRCxFQUFFLEdBQUcsRUFBRTtnQkFDckUsTUFBTSxvQkFBb0IsR0FBRztvQkFDekIsZ0JBQWdCLEVBQUU7d0JBQ2QsbUlBQW1JO3FCQUN0STtpQkFDSixDQUFDO2dCQUNGLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1lBQy9ILENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHNHQUFzRyxFQUFFLEdBQUcsRUFBRTtnQkFDNUcsTUFBTSxvQkFBb0IsR0FBRztvQkFDekIsS0FBSyxFQUFFO3dCQUNILDRHQUE0RztxQkFDL0c7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLGtHQUFrRztxQkFDckc7aUJBQ0osQ0FBQztnQkFDRixNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMvSCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwRkFBMEYsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hHLE1BQU0sb0JBQW9CLEdBQUcsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUMvSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9