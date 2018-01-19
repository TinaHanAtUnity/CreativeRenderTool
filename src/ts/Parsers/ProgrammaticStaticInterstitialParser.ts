import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { DisplayInterstitialMarkupCampaign, IDisplayInterstitialMarkupCampaign } from 'Models/Campaigns/DisplayInterstitialMarkupCampaign';
import { IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

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

        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            gamerId: gamerId,
            abGroup: abGroup,
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonDisplay.meta,
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: undefined,
            session: session,
            mediaId: response.getMediaId()
        };

        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... baseCampaignParams,
            clickThroughUrl: jsonDisplay.clickThroughURL,
            tracking: response.getTrackingUrls() || undefined
        };

        const displayInterstitialMarkupParams: IDisplayInterstitialMarkupCampaign = {
            ... displayInterstitialParams,
            markup: displayMarkup
        };

        return Promise.resolve(new DisplayInterstitialMarkupCampaign(displayInterstitialMarkupParams));
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
