import { HTML } from 'Ads/Models/Assets/HTML';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { LimitedTimeOffer } from 'Promo/Models/LimitedTimeOffer';
import { ProductInfo } from 'Promo/Models/ProductInfo';

export interface IPromoCampaign extends ICampaign {
    additionalTrackingEvents: { [eventName: string]: string[] } | undefined;
    dynamicMarkup: string | undefined;
    creativeAsset: HTML | undefined;
    rewardedPromo: boolean;
    limitedTimeOffer: LimitedTimeOffer | undefined;
    costs: ProductInfo[];
    payouts: ProductInfo[];
    premiumProduct: ProductInfo;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: IPromoCampaign) {
        super('PromoCampaign', {
            ... Campaign.Schema,
            additionalTrackingEvents: ['object', 'undefined'],
            dynamicMarkup: ['string', 'undefined'],
            creativeAsset: ['object', 'undefined'],
            rewardedPromo: ['boolean'],
            limitedTimeOffer: ['object', 'undefined'],
            payouts: ['array'],
            costs: ['array'],
            premiumProduct: ['object', 'undefined']
        }, campaign);
    }

    public isConnectionNeeded(): boolean {
        const resource = this.getCreativeResource();
        // If the static resource is not cached we will need to download it, therefore
        // a connection is necessary.
        if (resource) {
            return !resource.getFileId();
        }
        return false;
    }

    private createTrackingEventUrlsWithProductType(productType: string): { [url: string]: string[] } {
        const additionalTrackingEvents = this.get('additionalTrackingEvents');
        const result: { [url: string]: string[] } = { };
        if (additionalTrackingEvents !== undefined) {
            for (const key in additionalTrackingEvents) {
                if(additionalTrackingEvents.hasOwnProperty(key)) {
                    result[key] = [];
                    const trackingURLs = additionalTrackingEvents[key];
                    for(const trackingURL of trackingURLs) {
                        if(trackingURL) {
                            const isStagingURL = trackingURL.indexOf('events-iap.staging.unityads.unity3d.com') !== -1;
                            const isProductionURL = trackingURL.indexOf('events.iap.unity3d.com') !== -1;
                            if(isStagingURL || isProductionURL) {
                                result[key].push(trackingURL + '&productType=' + productType);
                            } else {
                                result[key].push(trackingURL);
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    public getTrackingEventUrls(): { [eventName: string]: string[] } | undefined {
        const productId = this.getIapProductId();
        const productType = PurchasingUtilities.getProductType(productId);
        if (productType === undefined) {
            return this.get('additionalTrackingEvents');
        }
        return this.createTrackingEventUrlsWithProductType(productType);
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const trackingUrls = this.getTrackingEventUrls();
        if (trackingUrls) {
            return trackingUrls[eventName] || [];
        }
        return [];
    }

    public getCreativeResource(): HTML | undefined {
        return this.get('creativeAsset');
    }

    public getDynamicMarkup(): string | undefined {
        return this.get('dynamicMarkup');
    }

    public getIapProductId(): string {
        return this.get('premiumProduct').getId();
    }

    public getRequiredAssets() : HTML[] {
        const creativeResource = this.getCreativeResource();
        if (creativeResource) {
            return [creativeResource];
        }
        return [];
    }

    public getPayouts() : ProductInfo[] {
        return this.get('payouts');
    }

    public getCosts() : ProductInfo[] {
        return this.get('costs');
    }

    public getOptionalAssets() {
        return [];
    }

    public getRewardedPromo(): boolean {
        return this.get('rewardedPromo');
    }

    public getLimitedTimeOffer(): LimitedTimeOffer | undefined {
        return this.get('limitedTimeOffer');
    }
}
