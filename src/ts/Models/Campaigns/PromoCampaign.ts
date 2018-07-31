import { Campaign, ICampaign } from 'Models/Campaign';
import { HTML } from 'Models/Assets/HTML';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

export interface IPromoCampaign extends ICampaign {
    iapProductId: string;
    additionalTrackingEvents: { [eventName: string]: string[] } | undefined;
    dynamicMarkup: string | undefined;
    creativeAsset: HTML;
    rewardedPromo: boolean;
}

export class PromoCampaign extends Campaign<IPromoCampaign> {
    constructor(campaign: IPromoCampaign) {
        super('PromoCampaign', {
            ... Campaign.Schema,
            iapProductId: ['string'],
            additionalTrackingEvents: ['object', 'undefined'],
            dynamicMarkup: ['string', 'undefined'],
            creativeAsset: ['object'],
            rewardedPromo: ['boolean']
        }, campaign);
    }

    public isConnectionNeeded(): boolean {
        const resource = this.getCreativeResource();
        // If the static resource is not cached we will need to download it, therefore
        // a connection is necessary.
        return !resource.getFileId();
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
                        result[key].push(trackingURL + '&productType=' + productType);
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

    public getCreativeResource(): HTML {
        return this.get('creativeAsset');
    }

    public getDynamicMarkup(): string | undefined {
        return this.get('dynamicMarkup');
    }

    public getIapProductId(): string {
        return this.get('iapProductId');
    }

    public getRequiredAssets() {
        return [this.getCreativeResource()];
    }

    public getOptionalAssets() {
        return [];
    }

    public getRewardedPromo(): boolean {
        return this.get('rewardedPromo');
    }
}
