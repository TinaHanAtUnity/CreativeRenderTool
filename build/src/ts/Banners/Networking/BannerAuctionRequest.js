import { BannerMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AuctionRequest } from 'Ads/Networking/AuctionRequest';
export class BannerAuctionRequest extends AuctionRequest {
    static create(params) {
        return new BannerAuctionRequest(params);
    }
    constructor(params) {
        super(params);
        this._bannerSize = params.bannerSize;
    }
    createPlacementDTO(placement) {
        const placementRequest = super.createPlacementDTO(placement);
        placementRequest.dimensions = this._bannerSize;
        return placementRequest;
    }
    request() {
        if (this._deviceInfo.getLimitAdTracking()) {
            SDKMetrics.reportMetricEvent(BannerMetric.BannerAdRequestWithLimitedAdTracking);
        }
        return super.request();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQXVjdGlvblJlcXVlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9OZXR3b3JraW5nL0Jhbm5lckF1Y3Rpb25SZXF1ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBaUUsTUFBTSwrQkFBK0IsQ0FBQztBQU05SCxNQUFNLE9BQU8sb0JBQXFCLFNBQVEsY0FBYztJQUk3QyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQW1DO1FBQ3BELE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsWUFBbUIsTUFBbUM7UUFDbEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDO0lBQ3pDLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxTQUFvQjtRQUM3QyxNQUFNLGdCQUFnQixHQUF5QixLQUFLLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkYsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDL0MsT0FBTyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0lBRU0sT0FBTztRQUNWLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO1lBQ3ZDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsb0NBQW9DLENBQUMsQ0FBQztTQUNuRjtRQUNELE9BQU8sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCLENBQUM7Q0FDSiJ9