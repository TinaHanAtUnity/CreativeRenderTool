import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { DisplayInterstitialMarkupCampaign } from 'Models/Campaigns/DisplayInterstitialMarkupCampaign';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonDisplay = response.getJsonContent();

        if(!jsonDisplay.markup) {
            throw new DiagnosticError(
                new Error('No markup for programmatic/static-interstitial'),
                {json: jsonDisplay}
            );
        }

        const displayMarkup = decodeURIComponent(jsonDisplay.markup);

        if(!jsonDisplay.clickThroughURL) {
            const clickThroughFromMarkup = this.getClickThroughUrlFromMarkup(displayMarkup);
            if (clickThroughFromMarkup) {
                jsonDisplay.clickThroughURL = clickThroughFromMarkup;
            } else {
                throw new DiagnosticError(
                    new Error('No clickThroughURL for programmatic/static-interstitial'),
                    {json: jsonDisplay}
                );
            }
        }

        const clickThroughUrl = jsonDisplay.clickThroughURL;
        return Promise.resolve(new DisplayInterstitialMarkupCampaign(displayMarkup, session, gamerId, abGroup, response.getCacheTTL(), response.getTrackingUrls(), clickThroughUrl, response.getAdType(), response.getCreativeId(), response.getSeatId(), response.getCorrelationId()));
    }

    private getClickThroughUrlFromMarkup(markup: string): string | null {
        const doc = new DOMParser().parseFromString(markup, 'text/html');
        const a = doc.querySelector('a');
        if (a) {
            const href = a.getAttribute('href');
            if (href) {
                return href;
            }
        }
        return null;
    }
}
