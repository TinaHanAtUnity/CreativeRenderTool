import { Placement } from 'Ads/Models/Placement';
import { AuctionRequest, IAuctionRequestParams, IAuctionResponse, IPlacementRequestDTO } from 'Ads/Networking/AuctionRequest';
import { BannerSize } from 'Banners/Utilities/BannerSize';
import { BannerMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class BannerAuctionRequest extends AuctionRequest {

    public static create(params: IAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    protected createPlacementDTO(placement: Placement): IPlacementRequestDTO {
        const placementRequest = super.createPlacementDTO(placement);
        placementRequest.dimensions = BannerSize.getPlatformDimensions(this._platform, this._deviceInfo);
        return placementRequest;
    }

    public request(): Promise<IAuctionResponse> {
        if (this._deviceInfo.getLimitAdTracking()) {
            this._pts.reportMetric(BannerMetric.BannerAdRequestWithLimitedAdTracking);
        }
        return super.request();
    }
}
