import { HTML } from 'Ads/Models/Assets/HTML';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { IMRAIDCampaign, MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IRawPerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

export interface IRawMraidUrlCampaign extends IRawPerformanceCampaign {
    inlinedUrl?: string;
}

export class ProgrammaticMraidUrlParser extends CampaignParser {

    public static ContentType = 'programmatic/mraid-url';

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        const jsonMraidUrl = <IRawMraidUrlCampaign>response.getJsonContent();

        if (!jsonMraidUrl) {
            throw new Error('Corrupted mraid-url content');
        }
        if (!jsonMraidUrl.inlinedUrl) {
            const MRAIDError = new DiagnosticError(
                new Error('MRAID Campaign missing inlinedUrl'),
                { mraid: jsonMraidUrl }
            );
            throw MRAIDError;
        }

        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticMraidUrlParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraidUrl.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };

        const parameters: IMRAIDCampaign = {
            ... baseCampaignParams,
            resourceAsset: jsonMraidUrl.inlinedUrl ? new HTML(this.validateAndEncodeUrl(jsonMraidUrl.inlinedUrl, session), session) : undefined,
            resource: undefined,
            dynamicMarkup: jsonMraidUrl.dynamicMarkup,
            clickAttributionUrl: jsonMraidUrl.clickAttributionUrl ? this.validateAndEncodeUrl(jsonMraidUrl.clickAttributionUrl, session) : undefined,
            clickAttributionUrlFollowsRedirects: jsonMraidUrl.clickAttributionUrlFollowsRedirects,
            clickUrl: jsonMraidUrl.clickUrl ? this.validateAndEncodeUrl(jsonMraidUrl.clickUrl, session) : undefined,
            videoEventUrls: {},
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking() || false,
            gameName: undefined,
            gameIcon: undefined,
            rating: undefined,
            ratingCount: undefined,
            landscapeImage: undefined,
            portraitImage: undefined,
            bypassAppSheet: undefined,
            store: undefined,
            appStoreId: undefined,
            playableConfiguration: undefined,
            targetGameId: undefined,
            isCustomCloseEnabled: response.isCustomCloseEnabled()
        };

        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
