import { Session } from 'Models/Session';
import {DisplayInterstitialCampaign, IDisplayInterstitialCampaign} from 'Models/Campaigns/DisplayInterstitialCampaign';

interface IDisplayInterstitialMarkupUrlCampaign extends IDisplayInterstitialCampaign {
    markupUrl: string;
}

export class DisplayInterstitialMarkupUrlCampaign extends DisplayInterstitialCampaign<IDisplayInterstitialMarkupUrlCampaign> {
    constructor(markupUrl: string, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super('DisplayInterstitialMarkupUrlCampaign', {
            ... DisplayInterstitialCampaign.Schema,
            markupUrl: ['string']
        }, session, gamerId, abGroup, cacheTTL, tracking, adType, creativeId, seatId, correlationId);

        this.set('markupUrl', markupUrl);
    }

    public getMarkupUrl(): string {
        return this.get('markupUrl');
    }

    public setMarkupUrl(url: string) {
        this.set('markupUrl', url);
    }
}
