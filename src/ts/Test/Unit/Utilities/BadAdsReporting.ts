import { Campaign } from 'Models/Campaign';
import { Diagnostics } from 'Utilities/Diagnostics';

export enum BadAdReason {
    BLACK_SCREEN = 'Adverstisement is showing a black screen',
    SOUND_NOT_MUTED = 'Advertisement was not muted when it should have been',
    OFFENSIVE = 'Advertisement was offensive',
    VIDEO_NOT_REWARDING = 'Advertisement was watched, but a reward was not granted',
    OTHER = 'Other'
}

export class BadAdsReporting {

    public static onUserReport(campaign: Campaign, reason: BadAdReason, explanation: string): void {

        const error = {
            creativeId: campaign.getCreativeId(),
            auctionId: campaign.getSession().getId(),
            reason: reason,
            explanation: explanation
        };

        Diagnostics.trigger(reason, error);
    }
}
