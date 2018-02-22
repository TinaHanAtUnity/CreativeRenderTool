import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign, ICampaign } from 'Models/Campaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { IMRAIDCampaign, MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Image } from 'Models/Assets/Image';
import { HTML } from 'Models/Assets/HTML';

export class ProgrammaticMraidUrlParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const jsonMraidUrl = response.getJsonContent();

        if(!jsonMraidUrl) {
            throw new Error('Corrupted mraid-url content');
        }
        if(!jsonMraidUrl.inlinedUrl) {
            const MRAIDError = new DiagnosticError(
                new Error('MRAID Campaign missing inlinedUrl'),
                {mraid: jsonMraidUrl}
            );
            throw MRAIDError;
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
            meta: jsonMraidUrl.meta,
            session: session
        };

        const parameters: IMRAIDCampaign = {
            ... baseCampaignParams,
            resourceAsset: jsonMraidUrl.inlinedUrl ? new HTML(jsonMraidUrl.inlinedUrl, session) : undefined,
            resource: undefined,
            dynamicMarkup: jsonMraidUrl.dynamicMarkup,
            trackingUrls: response.getTrackingUrls(),
            clickAttributionUrl: jsonMraidUrl.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: jsonMraidUrl.clickAttributionUrlFollowsRedirects,
            clickUrl: jsonMraidUrl.clickUrl ? jsonMraidUrl.clickUrl : undefined,
            videoEventUrls: {},
            useWebViewUserAgentForTracking: false,
            gameName: undefined,
            gameIcon: undefined,
            rating: undefined,
            ratingCount: undefined,
            landscapeImage: undefined,
            portraitImage: undefined,
            bypassAppSheet: undefined,
            store: undefined,
            appStoreId: undefined
        };

        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
