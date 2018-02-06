import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { JsonParser } from 'Utilities/JsonParser';
import { DisplayInterstitialMarkupUrlCampaign, IDisplayInterstitialMarkupUrlCampaign } from 'Models/Campaigns/DisplayInterstitialMarkupUrlCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

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
            meta: jsonDisplayUrl.meta,
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: undefined,
            session: session
        };

        const displayInterstitialParams: IDisplayInterstitialCampaign = {
            ... baseCampaignParams,
            clickThroughUrl: jsonDisplayUrl.clickThroughURL ? this.validateAndEncodeUrl(jsonDisplayUrl.clickThroughURL) : undefined,
            tracking: response.getTrackingUrls() || undefined
        };

        const displayInterstitialMarkupUrlParams: IDisplayInterstitialMarkupUrlCampaign = {
            ... displayInterstitialParams,
            markupUrl: this.validateAndEncodeUrl(jsonDisplayUrl.markupUrl)
        };

        return Promise.resolve(new DisplayInterstitialMarkupUrlCampaign(displayInterstitialMarkupUrlParams));
    }
}
