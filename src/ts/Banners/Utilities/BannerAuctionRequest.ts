import { Placement } from 'Ads/Models/Placement';
import { AuctionRequest, IAuctionRequestParams, IAuctionResponse } from 'Banners/Utilities/AuctionRequest';
import { BannerSize } from 'Banners/Utilities/BannerSize';
import { ProgrammaticTrackingMetricName } from 'Ads/Utilities/ProgrammaticTrackingService';

export class BannerAuctionRequest extends AuctionRequest {

    public static create(params: IAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    protected createPlacementDTO(placement: Placement): { [key: string]: unknown } {
        const placementRequest = super.createPlacementDTO(placement);
        placementRequest.dimensions = BannerSize.getPlatformDimensions(this._platform, this._deviceInfo);
        return placementRequest;
    }

    public request(): Promise<IAuctionResponse> {
        if (this._deviceInfo.getLimitAdTracking()) {
            this._pts.reportMetric(ProgrammaticTrackingMetricName.BannerAdRequestWithLimitedAdTracking);
        }
        return super.request();
    }
}
