import { CampaignParser } from 'Utilities/Campaigns/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';

export class ProgrammaticMraidParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign> {
        const jsonMraid = JsonParser.parse(this.getAuctionResponse().getContent());

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
        return Promise.resolve(new MRAIDCampaign(jsonMraid, this.getSession(), this.getGamerId(), this.getAbGroup(), this.getAuctionResponse().getCacheTTL(), undefined, markup, this.getAuctionResponse().getTrackingUrls(), this.getAuctionResponse().getAdType(), this.getAuctionResponse().getCreativeId(), this.getAuctionResponse().getSeatId(), this.getAuctionResponse().getCorrelationId()));
    }
}
