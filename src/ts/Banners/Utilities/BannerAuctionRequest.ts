import { Placement } from 'Ads/Models/Placement';
import { AuctionRequest, IAuctionRequestParams, IAuctionResponse } from 'Banners/Utilities/AuctionRequest';
import { BannerSize } from 'Banners/Utilities/BannerSize';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
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
        this.checkForLimitedAdTracking();
        return super.request();
    }

    private checkForLimitedAdTracking() {
        if (this._deviceInfo.getLimitAdTracking()) {
            // Report to PTS to easily get percent comparisons in Datadog
            this._pts.reportMetric(ProgrammaticTrackingMetricName.BannerAdRequestWithLimitedAdTracking);
            let userId = this._deviceInfo.getAdvertisingIdentifier();
            if (!userId && this._platform === Platform.ANDROID) {
                userId = (<AndroidDeviceInfo>this._deviceInfo).getAndroidId();
            }
            // Report to Kibana to break out by userId
            Diagnostics.trigger('banner_request_with_limited_ad_tracking', {
                userId: userId
            });
        }
    }
}
