import { Placement } from 'Ads/Models/Placement';
import { IBannerDimensions } from 'Banners/Utilities/BannerSizeUtil';
import { BannerMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { AuctionRequest, IAuctionRequestParams, IAuctionResponse, IPlacementRequestDTO } from 'Ads/Networking/AuctionRequest';

export interface IBannerAuctionRequestParams extends IAuctionRequestParams {
    bannerSize: IBannerDimensions;
}

export class BannerAuctionRequest extends AuctionRequest {

    private _bannerSize: IBannerDimensions;

    public static create(params: IBannerAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    public constructor(params: IBannerAuctionRequestParams) {
        super(params);
        this._bannerSize = params.bannerSize;
    }

    protected createPlacementDTO(placement: Placement): IPlacementRequestDTO {
        const placementRequest: IPlacementRequestDTO = super.createPlacementDTO(placement);
        placementRequest.dimensions = this._bannerSize;
        return placementRequest;
    }

    public request(): Promise<IAuctionResponse> {
        if (this._deviceInfo.getLimitAdTracking()) {
            SDKMetrics.reportMetricEvent(BannerMetric.BannerAdRequestWithLimitedAdTracking);
        }
        return super.request();
    }
}
