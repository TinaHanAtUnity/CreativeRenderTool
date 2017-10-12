import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { GlyphCampaign } from 'Models/Campaigns/GlyphCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticGlyphParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonDisplay = JsonParser.parse(response.getContent());

        if(!jsonDisplay.markup) {
            throw new DiagnosticError(
                new Error('No markup for programmatic/static-interstitial'),
                {json: jsonDisplay}
            );
        }
        const displayMarkup = decodeURIComponent(jsonDisplay.markup);
        if(!jsonDisplay.clickThroughURL) {
            throw new DiagnosticError(
                new Error('No clickThroughURL for programmatic/static-interstitial'),
                {json: jsonDisplay}
            );
        }

        const clickThroughUrl = jsonDisplay.clickThroughURL;
        return Promise.resolve(new GlyphCampaign(displayMarkup, session, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), clickThroughUrl, response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()));
    }
}
