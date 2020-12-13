export const BannerSizeStandardDimensions = {
    w: 320,
    h: 50
};
export const BannerSizeLeaderboardDimensions = {
    w: 728,
    h: 90
};
export const BannerSizeIABStandardDimensions = {
    w: 468,
    h: 60
};
export class BannerSizeUtil {
    static getBannerSizeFromWidthAndHeight(width, height, errorLogger) {
        if (width >= BannerSizeLeaderboardDimensions.w && height >= BannerSizeLeaderboardDimensions.h) {
            return BannerSizeLeaderboardDimensions;
        }
        else if (width >= BannerSizeIABStandardDimensions.w && height >= BannerSizeIABStandardDimensions.h) {
            return BannerSizeIABStandardDimensions;
        }
        else if (width >= BannerSizeStandardDimensions.w && height >= BannerSizeStandardDimensions.h) {
            return BannerSizeStandardDimensions;
        }
        else {
            errorLogger.logError(`Invalid Banner size of ${width}(width) ${height}(height) was given to Unity Ads Sdk, resulted in no fill`);
            return undefined;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyU2l6ZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9VdGlsaXRpZXMvQmFubmVyU2l6ZVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBT0EsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQXNCO0lBQzNELENBQUMsRUFBRSxHQUFHO0lBQ04sQ0FBQyxFQUFFLEVBQUU7Q0FDUixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQXNCO0lBQzlELENBQUMsRUFBRSxHQUFHO0lBQ04sQ0FBQyxFQUFFLEVBQUU7Q0FDUixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sK0JBQStCLEdBQXNCO0lBQzlELENBQUMsRUFBRSxHQUFHO0lBQ04sQ0FBQyxFQUFFLEVBQUU7Q0FDUixDQUFDO0FBRUYsTUFBTSxPQUFPLGNBQWM7SUFFaEIsTUFBTSxDQUFDLCtCQUErQixDQUFDLEtBQWEsRUFBRSxNQUFjLEVBQUUsV0FBeUI7UUFDbEcsSUFBSSxLQUFLLElBQUksK0JBQStCLENBQUMsQ0FBQyxJQUFJLE1BQU0sSUFBSSwrQkFBK0IsQ0FBQyxDQUFDLEVBQUU7WUFDM0YsT0FBTywrQkFBK0IsQ0FBQztTQUMxQzthQUFNLElBQUksS0FBSyxJQUFJLCtCQUErQixDQUFDLENBQUMsSUFBSSxNQUFNLElBQUksK0JBQStCLENBQUMsQ0FBQyxFQUFFO1lBQ2xHLE9BQU8sK0JBQStCLENBQUM7U0FDMUM7YUFBTSxJQUFJLEtBQUssSUFBSSw0QkFBNEIsQ0FBQyxDQUFDLElBQUksTUFBTSxJQUFJLDRCQUE0QixDQUFDLENBQUMsRUFBRTtZQUM1RixPQUFPLDRCQUE0QixDQUFDO1NBQ3ZDO2FBQU07WUFDSCxXQUFXLENBQUMsUUFBUSxDQUFDLDBCQUEwQixLQUFLLFdBQVcsTUFBTSwwREFBMEQsQ0FBQyxDQUFDO1lBQ2pJLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO0lBQ0wsQ0FBQztDQUNKIn0=