import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

export interface IDisplayInterstitialMarkupCampaign extends IDisplayInterstitialCampaign {
    markup: string;
}

export class DisplayInterstitialMarkupCampaign extends DisplayInterstitialCampaign<IDisplayInterstitialMarkupCampaign> {
    constructor(campaign: IDisplayInterstitialMarkupCampaign) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... DisplayInterstitialCampaign.Schema,
            markup: ['string']
        }, campaign);
    }

    public getDynamicMarkup() {
        return this.get('markup');
    }
}
