import { Campaign } from 'Ads/Models/Campaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export enum BadAdReason {
    BLACK_SCREEN = 'Showing only a black screen',
    BLACK_SCREEN_PARTIAL = 'Showing a mostly black screen with some surrounding pictures',
    SOUND_NOT_MUTED = 'Not respecting my device\'s mute status',
    OFFENSIVE = 'Very offensive to me',
    VIDEO_NOT_REWARDING = 'Not rewarding me after I watch it',
    DISLIKE_ADS = 'Annoying because I dislike ads',
    OTHER = 'Being reported for a different reason than the options above'
}

export class BadAdsReporting {

    public static onUserReport(campaign: Campaign, reasonIndex: number): void {

        const reportSummary = {
            creativeId: campaign.getCreativeId(),
            auctionId: campaign.getSession().getId(),
            reason: BadAdReason[reasonIndex]
        };

        Diagnostics.trigger('reported_ad', reportSummary);
    }
}
