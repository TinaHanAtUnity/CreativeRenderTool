import { CampaignParser } from 'Utilities/Campaigns/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { DisplayInterstitialCampaign } from 'Models/DisplayInterstitialCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';

export class ProgrammaticStaticInterstitialParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request): Promise<Campaign> {
        const jsonDisplay = JsonParser.parse(this.getAuctionResponse().getContent());

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
        return Promise.resolve(new DisplayInterstitialCampaign(displayMarkup, this.getSession(), this.getGamerId(), this.getAbGroup(), this.getAuctionResponse().getCacheTTL(), this.getAuctionResponse().getTrackingUrls(), clickThroughUrl, this.getAuctionResponse().getAdType(), this.getAuctionResponse().getCreativeId(), this.getAuctionResponse().getSeatId(), this.getAuctionResponse().getCorrelationId()));
    }
}
