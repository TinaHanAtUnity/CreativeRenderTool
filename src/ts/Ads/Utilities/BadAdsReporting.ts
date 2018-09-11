import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { FinishState } from 'Core/Constants/FinishState';
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

    public static setupReportListener(privacy: GDPRPrivacy, adunit: AbstractAdUnit): void {
        if (privacy._onReport) {
            privacy._onReport.subscribe((reportSent) => {
                if (reportSent) {
                    privacy._onReport.unsubscribe();
                    this.timeoutAd(adunit);
                }
            });
        }
    }

    // Timeout after four seconds
    private static timeoutAd(adunit: AbstractAdUnit): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                adunit.setFinishState(FinishState.SKIPPED, true);
                adunit.hide();
                resolve();
            }, 4000);
        });
    }
}
