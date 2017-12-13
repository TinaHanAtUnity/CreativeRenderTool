import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { DisplayInterstitialMarkupUrlCampaign } from 'Models/Campaigns/DisplayInterstitialMarkupUrlCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';

export class ProgrammaticStaticInterstitialUrlParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonDisplayUrl = JsonParser.parse(response.getContent());

        if (!jsonDisplayUrl) {
            throw new Error('Corrupted display-institial-url content');
        }

        if(!jsonDisplayUrl.markupUrl) {
            const DisplayInterstitialError = new DiagnosticError(
                new Error('DisplayInterstitial Campaign missing markupUrl'),
                {displayInterstitial: jsonDisplayUrl}
            );
            throw DisplayInterstitialError;
        }

        return Promise.resolve(new DisplayInterstitialMarkupUrlCampaign(jsonDisplayUrl.markupUrl, session, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()));
    }
}
