import { Placement } from 'Ads/Models/Placement';
import { AuctionRequest, IAuctionRequestParams } from 'Banners/Utilities/AuctionRequest';

export class BannerAuctionRequest extends AuctionRequest {

    public static create(params: IAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    protected createPlacementDTO(placement: Placement): unknown {
        const placementRequest = super.createPlacementDTO(placement);
        // TODO replace with actual dimensions
        placementRequest.dimensions = {
            w: 320,
            h: 50
        };
        return placementRequest;
    }
}
