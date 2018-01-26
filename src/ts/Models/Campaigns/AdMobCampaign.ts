import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';

export interface IAdMobCampaign extends ICampaign {
    dynamicMarkup: string;
    tracking: { [eventName: string]: string[] } | undefined;
}

export class AdMobCampaign extends Campaign<IAdMobCampaign> {
    constructor(campaign: IAdMobCampaign) {
        super('AdMobCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string'],
            tracking: ['object', 'undefined']
        }, campaign);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return tracking[eventName] || [];
        }
        return [];
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }
}
