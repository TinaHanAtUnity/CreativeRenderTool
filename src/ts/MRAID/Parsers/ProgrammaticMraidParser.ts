import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IMRAIDCampaign, MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';

export class ProgrammaticMraidParser extends CampaignParser {

    public static ContentType = 'programmatic/mraid';

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session): Promise<Campaign> {

        this.setIds(response);

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
            id: this.getProgrammaticCampaignId(platform),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticMraidParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: this._creativeID,
            seatId: this._seatID,
            meta: jsonMraid.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {}
        };

        const parameters: IMRAIDCampaign = {
            ... baseCampaignParams,
            resourceAsset: undefined,
            resource: markup,
            dynamicMarkup: jsonMraid.dynamicMarkup,
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
