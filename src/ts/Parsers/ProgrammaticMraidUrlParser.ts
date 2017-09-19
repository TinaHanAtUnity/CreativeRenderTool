import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Request } from 'Utilities/Request';

export class ProgrammaticMraidUrlParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign> {
        const jsonMraidUrl = JsonParser.parse(this.getAuctionResponse().getContent());

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
        return Promise.resolve(new MRAIDCampaign(jsonMraidUrl, this.getSession(), this.getGamerId(), this.getAbGroup(), this.getAuctionResponse().getCacheTTL(), jsonMraidUrl.inlinedUrl, undefined, this.getAuctionResponse().getTrackingUrls(), this.getAuctionResponse().getAdType(), this.getAuctionResponse().getCreativeId(), this.getAuctionResponse().getSeatId(), this.getAuctionResponse().getCorrelationId()));
    }
}
