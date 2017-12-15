import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticAdMobParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const markup = response.getContent();
        return Promise.resolve(new AdMobCampaign(markup, session, this.getProgrammaticCampaignId(nativeBridge), gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()));
    }
}
