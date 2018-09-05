import { Campaign } from 'Models/Campaign';
import { ProgrammaticTrackingService, ProgrammaticTrackingMetric } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

export enum BadAdReason {
    BLACK_SCREEN,
    SOUND_NOT_MUTED,
    OFFENSIVE,
    VIDEO_NOT_REWARDING,
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
}
