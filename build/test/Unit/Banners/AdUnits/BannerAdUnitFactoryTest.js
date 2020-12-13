import { BannerAdUnitFactory } from 'Banners/AdUnits/BannerAdUnitFactory';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
describe('BannerAdUnitFactoryTest', () => {
    describe('when creating an ad unit for a BannerCampaign', () => {
        let campaign;
        let nativeBridge;
        let parameters;
        beforeEach(() => {
            campaign = sinon.createStubInstance(BannerCampaign);
            nativeBridge = sinon.createStubInstance(NativeBridge);
            parameters = {
                campaign
            };
        });
        it('should return a banner ad unit', () => {
            const factory = new BannerAdUnitFactory();
            const adUnit = factory.createAdUnit(parameters);
            assert.instanceOf(adUnit, DisplayHTMLBannerAdUnit, 'Returned ad unit is not a BannerAdUnit.');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRVbml0RmFjdG9yeVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQmFubmVycy9BZFVuaXRzL0Jhbm5lckFkVW5pdEZhY3RvcnlUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRWxGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMvRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMvRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7SUFDckMsUUFBUSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtRQUMzRCxJQUFJLFFBQXdCLENBQUM7UUFDN0IsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksVUFBbUMsQ0FBQztRQUV4QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNwRCxZQUFZLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RELFVBQVUsR0FBNEI7Z0JBQ2xDLFFBQVE7YUFDWCxDQUFDO1FBQ04sQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO1lBQ3RDLE1BQU0sT0FBTyxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQztZQUMxQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLHVCQUF1QixFQUFFLHlDQUF5QyxDQUFDLENBQUM7UUFDbEcsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=