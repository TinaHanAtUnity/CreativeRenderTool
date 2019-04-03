import { Placement } from 'Ads/Models/Placement';
import { AuctionRequest, IAuctionRequestParams } from 'Banners/Utilities/AuctionRequest';
import { BannerSize } from 'Banners/Utilities/BannerSize';

export class BannerAuctionRequest extends AuctionRequest {

    public static create(params: IAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    protected createPlacementDTO(placement: Placement): { [key: string]: unknown } {
        const placementRequest = super.createPlacementDTO(placement);
        placementRequest.dimensions = BannerSize.getPlatformDimensions(this._platform, this._deviceInfo);
        return placementRequest;
    }
}
