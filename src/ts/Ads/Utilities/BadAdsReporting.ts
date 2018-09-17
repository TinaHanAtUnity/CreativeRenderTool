import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { FinishState } from 'Core/Constants/FinishState';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { AbstractVideoOverlay } from 'Ads/Views/AbstractVideoOverlay';

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

    public static setupReportListener(privacy: GDPRPrivacy, ad: AbstractAdUnit | AbstractVideoOverlay): void {
        if (privacy._onReport) {
            privacy._onReport.subscribe(() => {
                privacy._onReport.unsubscribe();
                this.timeoutAd(ad);
            });
        }
    }

    // After the report, wait four seconds and close the ad
    private static timeoutAd(ad: AbstractAdUnit | AbstractVideoOverlay): Promise<void> {
        return new Promise(resolve => {
            setTimeout(() => {
                if (ad instanceof AbstractAdUnit) {
                    ad.markAsSkipped();
                    ad.hide();
                } else if (ad instanceof AbstractVideoOverlay) {
                    ad.hide();
                }
                resolve();
            }, 4000);
        });
    }
}
