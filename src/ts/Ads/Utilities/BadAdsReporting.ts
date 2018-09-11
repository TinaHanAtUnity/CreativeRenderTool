import { Campaign } from 'Ads/Models/Campaign';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

export enum BadAdReason {
    OFFENSIVE = 'Ad is very offensive',
    NEVER_STARTED = 'Ad did not start',
    WONT_END = 'Ad will not close',
    MALFORMED = 'Ad does not look right',
    OTHER = 'Other'
}

export class BadAdsReporting {

    public static onUserReport(campaign: Campaign, reasonKey: string): void {

        const error = {
            creativeId: campaign.getCreativeId(),
            auctionId: campaign.getSession().getId(),
            reason: reasonKey
        };

        Diagnostics.trigger('reported_ad', error);
    }
}
