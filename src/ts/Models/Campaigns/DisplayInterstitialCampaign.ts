import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ISchema } from 'Models/Model';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Models/Campaigns/ProgrammaticCampaign';

export interface IDisplayInterstitialCampaign extends IProgrammaticCampaign {
    dynamicMarkup: string;
}

export class DisplayInterstitialCampaign extends ProgrammaticCampaign<IDisplayInterstitialCampaign> {
    constructor(campaign: IDisplayInterstitialCampaign) {
        super('DisplayInterstitialCampaign', {
            ... ProgrammaticCampaign.Schema,
            dynamicMarkup: ['string', 'undefined']
        }, campaign);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
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
