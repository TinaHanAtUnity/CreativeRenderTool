import { Session } from 'Models/Session';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

interface IDisplayInterstitialMarkupCampaign extends IDisplayInterstitialCampaign {
    markup: string;
}

export class DisplayInterstitialMarkupCampaign extends DisplayInterstitialCampaign<IDisplayInterstitialMarkupCampaign> {
    constructor(markup: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, clickThroughUrl?: string, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... DisplayInterstitialCampaign.Schema,
            markup: ['string']
        }, session, gamerId, abGroup, cacheTTL, tracking, adType, creativeId, seatId, correlationId);

        this.set('markup', markup);
        this.set('clickThroughUrl', clickThroughUrl);
    }

    public getDynamicMarkup() {
        return this.get('markup');
    }
}
