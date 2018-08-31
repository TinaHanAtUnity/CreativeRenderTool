import { AuctionRequest, IAuctionRequestParams } from 'Banners/Utilities/AuctionRequest';
import { Placement } from 'Ads/Models/Placement';

export class BannerAuctionRequest extends AuctionRequest {

    public static create(params: IAuctionRequestParams): BannerAuctionRequest {
        return new BannerAuctionRequest(params);
    }

    protected createPlacementDTO(placement: Placement): any {
        const placementRequest = super.createPlacementDTO(placement);
        // TODO replace with actual dimensions
        placementRequest.dimensions = {
            w: 320,
            h: 50
        };
        return placementRequest;
    }
}
