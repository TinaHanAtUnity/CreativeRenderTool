import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ISchema } from 'Models/Model';

export interface IDisplayInterstitialCampaign extends ICampaign {
    dynamicMarkup: string;
    tracking: object | undefined;
}

export class DisplayInterstitialCampaign extends Campaign<IDisplayInterstitialCampaign> {
    public static Schema: ISchema<IDisplayInterstitialCampaign> = {
        ... Campaign.Schema,
        dynamicMarkup: ['string'],
        tracking: ['object', 'undefined']
    };

    constructor(campaign: IDisplayInterstitialCampaign) {
        super('DisplayInterstitialCampaign', {
            ... Campaign.Schema,
            dynamicMarkup: ['string', 'undefined'],
            tracking: ['object', 'undefined']
        }, campaign);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return (<any>tracking)[eventName] || [];
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
