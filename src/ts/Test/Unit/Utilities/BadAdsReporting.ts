import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { Request, INativeResponse } from 'Utilities/Request';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

export enum BadAdReason {
    OFFENSIVE,
    RELIGIOUS,
    BLACK_SCREEN,
    NO_SOUND,
    OTHER
}

export class BadAdsReporting {

    private _request: Request;

    constructor(request: Request) {
        this._request = request;
    }

    public static onUserReport(campaign: Campaign, reason: BadAdReason, explanation: string): Promise<INativeResponse> {

        const data: string = JSON.stringify({
            creativeId: campaign.getCreativeId(),
            auctionId: campaign.getSession().getId(),
            reason: reason,
            explanation: explanation
        });

        const url: string = ProgrammaticTrackingService.productionMetricServiceUrl;


        return this._request.post(url, data);
    }
    // Currently unused, remove before PR goes out
    public static onScreenshotTaken(isVerifiedScreenshot: boolean, adUnit: AbstractAdUnit, nativeBridge: NativeBridge, campaign: Campaign) {
        if (adUnit.isShowing()) {
            nativeBridge.Sdk.logInfo(`Screenshot was taken with verified status of ${isVerifiedScreenshot}`);
            const badAdBody = {
                screenshotVerified: isVerifiedScreenshot,
                creativeId: campaign.getCreativeId(),
                auctionId: campaign.getSession().getId()
            };
            // Send information to PTS
        }
    }
}
