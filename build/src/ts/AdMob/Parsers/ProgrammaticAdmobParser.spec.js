import { Session } from 'Ads/Models/__mocks__/Session';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
// TODO: Fix imports in spec.ts files
// eslint-disable-next-line
const ValidAdMobCampaign = require('json/campaigns/admob/ValidAdMobCampaign.json');
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ProgrammaticAdMobParser', () => {
        let parser;
        let session;
        let core;
        let campaign;
        describe('parsing a campaign', () => {
            beforeEach(() => {
                core = new Core();
                session = new Session();
                parser = new ProgrammaticAdMobParser(core);
                const auctionPlacement = new AuctionPlacement('placementId', 'mediaId');
                const auctionResponse = new AuctionResponse([auctionPlacement], ValidAdMobCampaign, 'mediaId', 'correlationId');
                return parser.parse(auctionResponse, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            });
            describe('with a proper JSON payload', () => {
                describe(`on ${Platform[platform]}`, () => {
                    it('should be a valid campaign', () => {
                        expect(campaign).toBeDefined();
                    });
                    it('should set the dynamic markup correctly', () => {
                        expect(campaign.getDynamicMarkup()).toEqual(ValidAdMobCampaign.content);
                    });
                    it('should set the session correctly', () => {
                        expect(campaign.getSession()).toStrictEqual(session);
                    });
                    it('should not have required assets', () => {
                        expect(campaign.getRequiredAssets()).toEqual([]);
                    });
                    it('should not have optional assets', () => {
                        expect(campaign.getRequiredAssets()).toEqual([]);
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljQWRtb2JQYXJzZXIuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZE1vYi9QYXJzZXJzL1Byb2dyYW1tYXRpY0FkbW9iUGFyc2VyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE9BQU8sRUFBZSxNQUFNLDhCQUE4QixDQUFDO0FBQ3BFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFFM0MscUNBQXFDO0FBQ3JDLDJCQUEyQjtBQUMzQixNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO0FBR25GLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUUvRCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUNoRCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1FBRXJDLElBQUksTUFBK0IsQ0FBQztRQUNwQyxJQUFJLE9BQW9CLENBQUM7UUFDekIsSUFBSSxJQUFXLENBQUM7UUFDaEIsSUFBSSxRQUF1QixDQUFDO1FBRTVCLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7WUFFaEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDbEIsT0FBTyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7Z0JBQ3hCLE1BQU0sR0FBRyxJQUFJLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUMzQyxNQUFNLGdCQUFnQixHQUFHLElBQUksZ0JBQWdCLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2dCQUN4RSxNQUFNLGVBQWUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsa0JBQWtCLEVBQUUsU0FBUyxFQUFFLGVBQWUsQ0FBQyxDQUFDO2dCQUNoSCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLGNBQWMsRUFBRSxFQUFFO29CQUNsRSxRQUFRLEdBQUcsY0FBYyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtnQkFDeEMsUUFBUSxDQUFDLE1BQU0sUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFO29CQUV0QyxFQUFFLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO3dCQUNsQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQ25DLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx5Q0FBeUMsRUFBRSxHQUFHLEVBQUU7d0JBQy9DLE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDNUUsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTt3QkFDeEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTt3QkFDdkMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNyRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO3dCQUN2QyxNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==