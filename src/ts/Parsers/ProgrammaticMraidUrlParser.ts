import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticMraidUrlParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonMraidUrl = response.getJsonContent();

        if(!jsonMraidUrl) {
            throw new Error('Corrupted mraid-url content');
        }
        if(!jsonMraidUrl.inlinedUrl) {
            const MRAIDError = new DiagnosticError(
                new Error('MRAID Campaign missing inlinedUrl'),
                {mraid: jsonMraidUrl}
            );
            throw MRAIDError;
        }

        jsonMraidUrl.id = this.getProgrammaticCampaignId(nativeBridge);
        return Promise.resolve(new MRAIDCampaign(jsonMraidUrl, session, gamerId, abGroup, response.getCacheTTL(), jsonMraidUrl.inlinedUrl, undefined, response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId(), response.getUseWebViewUserAgentForTracking()));
    }
}
