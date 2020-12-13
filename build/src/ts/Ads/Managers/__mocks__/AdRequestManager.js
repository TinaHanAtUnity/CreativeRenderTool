import { Observable } from 'Core/Utilities/__mocks__/Observable';
export const AdRequestManager = jest.fn(() => {
    return {
        onNoFill: Observable(),
        onCampaign: Observable(),
        requestPreload: jest.fn().mockImplementation(() => Promise.resolve()),
        loadCampaign: jest.fn().mockImplementation(() => Promise.resolve()),
        requestReload: jest.fn().mockImplementation(() => Promise.resolve()),
        request: jest.fn().mockImplementation(() => Promise.resolve()),
        isPreloadDataExpired: jest.fn().mockReturnValue(false),
        hasPreloadFailed: jest.fn().mockReturnValue(false),
        onAdditionalPlacementsReady: Observable(),
        cacheCampaign: jest.fn().mockImplementation((notCachedLoadedCampaign) => Promise.resolve({
            campaign: notCachedLoadedCampaign.notCachedCampaign,
            trackingUrl: notCachedLoadedCampaign.notCachedTrackingUrls
        })),
        loadCampaignWithAdditionalPlacement: jest.fn().mockImplementation(() => Promise.resolve()),
        reportMetricEvent: jest.fn()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRSZXF1ZXN0TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvX19tb2Nrc19fL0FkUmVxdWVzdE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQWtCakYsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDekMsT0FBNkI7UUFDekIsUUFBUSxFQUFFLFVBQVUsRUFBRTtRQUN0QixVQUFVLEVBQUUsVUFBVSxFQUFFO1FBQ3hCLGNBQWMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JFLFlBQVksRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25FLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BFLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlELG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBQ3RELGdCQUFnQixFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBQ2xELDJCQUEyQixFQUFFLFVBQVUsRUFBRTtRQUN6QyxhQUFhLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUMsdUJBQWlELEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7WUFDL0csUUFBUSxFQUFFLHVCQUF1QixDQUFDLGlCQUFpQjtZQUNuRCxXQUFXLEVBQUUsdUJBQXVCLENBQUMscUJBQXFCO1NBQzdELENBQUMsQ0FBQztRQUNILG1DQUFtQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDMUYsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRTtLQUMvQixDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMifQ==