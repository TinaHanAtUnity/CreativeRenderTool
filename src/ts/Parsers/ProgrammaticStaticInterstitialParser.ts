import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const displayMarkup = response.getContent();
        return Promise.resolve(new DisplayInterstitialCampaign(displayMarkup, session, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()));
    }
}
