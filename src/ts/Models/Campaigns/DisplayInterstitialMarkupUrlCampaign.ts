import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

export interface IDisplayInterstitialMarkupUrlCampaign extends IDisplayInterstitialCampaign {
    markupUrl: string;
}

export class DisplayInterstitialMarkupUrlCampaign extends DisplayInterstitialCampaign<IDisplayInterstitialMarkupUrlCampaign> {
    constructor(campaign: IDisplayInterstitialMarkupUrlCampaign) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... DisplayInterstitialCampaign.Schema,
            markupUrl: ['string']
        }, campaign);
    }

    public getMarkupUrl(): string {
        return this.get('markupUrl');
    }

    public setMarkupUrl(url: string) {
        this.set('markupUrl', url);
    }
}
