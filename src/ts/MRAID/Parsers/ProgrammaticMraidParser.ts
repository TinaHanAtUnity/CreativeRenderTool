import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { IMRAIDCampaign, MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';

export class ProgrammaticMraidParser extends CampaignParser {
    public static ContentType = CampaignContentTypes.ProgrammaticMraid;
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session): Promise<Campaign> {
        const jsonMraid = response.getJsonContent();

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

        const markup = decodeURIComponent(jsonMraid.markup);
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraid.meta,
            session: session,
            mediaId: response.getMediaId()
        };

        const parameters: IMRAIDCampaign = {
            ... baseCampaignParams,
            resourceAsset: undefined,
            resource: markup,
            dynamicMarkup: jsonMraid.dynamicMarkup,
            trackingUrls: response.getTrackingUrls(),
            clickAttributionUrl: jsonMraid.clickAttributionUrl ? this.validateAndEncodeUrl(jsonMraid.clickAttributionUrl, session) : undefined,
            clickAttributionUrlFollowsRedirects: jsonMraid.clickAttributionUrlFollowsRedirects,
            clickUrl: jsonMraid.clickUrl ? this.validateAndEncodeUrl(jsonMraid.clickUrl, session) : undefined,
            videoEventUrls: {},
            gameName: undefined,
            gameIcon: undefined,
            rating: undefined,
            ratingCount: undefined,
            landscapeImage: undefined,
            portraitImage: undefined,
            bypassAppSheet: undefined,
            store: undefined,
            appStoreId: undefined,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking() || false,
            playableConfiguration: undefined
        };

        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
