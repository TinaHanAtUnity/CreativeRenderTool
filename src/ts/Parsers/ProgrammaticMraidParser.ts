import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticMraidParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonMraid = response.getJsonContent();

        if(!jsonMraid) {
             throw new Error('Corrupted mraid content');
        }
        if(!jsonMraid.markup) {
            const MRAIDError = new DiagnosticError(
                new Error('MRAID Campaign missing markup'),
                {mraid: jsonMraid}
            );
            throw MRAIDError;
        }

        jsonMraid.id = this.getProgrammaticCampaignId(nativeBridge);
        const markup = decodeURIComponent(jsonMraid.markup);
        return Promise.resolve(new MRAIDCampaign(jsonMraid, session, gamerId, abGroup, response.getCacheTTL(), undefined, markup, response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId(), response.getUseWebViewUserAgentForTracking()));
    }
}
