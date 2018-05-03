import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ISchema } from 'Models/Model';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Models/Campaigns/ProgrammaticCampaign';

export interface IDisplayInterstitialCampaign extends IProgrammaticCampaign {
    dynamicMarkup: string;
    width: number | undefined;
    height: number | undefined;
    contentType: string | undefined;
}

export class DisplayInterstitialCampaign extends ProgrammaticCampaign<IDisplayInterstitialCampaign> {
    constructor(campaign: IDisplayInterstitialCampaign) {
        super('DisplayInterstitialCampaign', {
            ... ProgrammaticCampaign.Schema,
            dynamicMarkup: ['string', 'undefined'],
            width: ['number', 'undefined'],
            height: ['number', 'undefined'],
            contentType: ['string', 'undefined']
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

    public getWidth(): number | undefined {
        return this.get('width');
    }

    public getHeight(): number | undefined {
        return this.get('height');
    }

    public getContentType(): string | undefined {
        return this.get('contentType');
    }
}
