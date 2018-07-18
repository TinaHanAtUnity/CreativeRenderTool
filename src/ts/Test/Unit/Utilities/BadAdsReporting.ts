import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { ProgrammaticTrackingService, ProgrammaticTrackingMetric } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

export enum BadAdReason {
    OFFENSIVE,
    RELIGIOUS,
    BLACK_SCREEN,
    NO_SOUND,
    OTHER
}

export class BadAdsReporting {

    public static onUserReport(pts: ProgrammaticTrackingService, campaign: Campaign, reason: BadAdReason, explanation: string): void {

        const data: string = JSON.stringify({
            creativeId: campaign.getCreativeId(),
            auctionId: campaign.getSession().getId(),
            reason: reason,
            explanation: explanation
        });

        // This does not work, currently
        pts.reportMetric(<ProgrammaticTrackingMetric>data);
    }
    // Currently unused, remove before PR goes out
    public onScreenshotTaken(isVerifiedScreenshot: boolean, adUnit: AbstractAdUnit, nativeBridge: NativeBridge, campaign: Campaign) {
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
