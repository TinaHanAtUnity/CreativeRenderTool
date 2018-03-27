import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ProgrammaticCampaign, IProgrammaticCampaign } from 'Models/Campaigns/ProgrammaticCampaign';

export interface IAdMobCampaign extends IProgrammaticCampaign {
    dynamicMarkup: string;
}

export class AdMobCampaign extends ProgrammaticCampaign<IAdMobCampaign> {
    constructor(campaign: IAdMobCampaign) {
        super('AdMobCampaign', {
            ... ProgrammaticCampaign.Schema,
            dynamicMarkup: ['string']
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
