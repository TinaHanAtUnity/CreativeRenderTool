import { Campaign, ICampaign } from 'Models/Campaign';
import { HTML } from 'Models/Assets/HTML';

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

    public getTrackingEventUrls(): { [eventName: string]: string[] } | undefined {
        return this.get('additionalTrackingEvents');
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

    public setIapProductId(iapProductId: string) {
        this.set('iapProductId', iapProductId);
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
