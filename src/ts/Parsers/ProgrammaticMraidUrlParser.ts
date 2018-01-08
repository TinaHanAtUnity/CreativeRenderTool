import { CampaignParser } from 'Parsers/CampaignParser';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign, ICampaign } from 'Models/Campaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { IMRAIDCampaign, MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Image } from 'Models/Assets/Image';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';
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

        const campaignStore = typeof jsonMraidUrl.store !== 'undefined' ? jsonMraidUrl.store : '';
        let storeName: StoreName;
        switch(campaignStore) {
            case 'apple':
                storeName = StoreName.APPLE;
                break;
            case 'google':
                storeName = StoreName.GOOGLE;
                break;
            case 'xiaomi':
                storeName = StoreName.XIAOMI;
                break;
            default:
                throw new Error('Unknown store value "' + jsonMraidUrl.store + '"');
        }

        const baseCampaignParams: ICampaign = {
            id: this.getProgrammaticCampaignId(nativeBridge),
            gamerId: gamerId,
            abGroup: abGroup,
            willExpireAt: jsonMraidUrl.cacheTTL ? Date.now() + jsonMraidUrl.cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraidUrl.meta,
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: undefined,
            session: session
        };

        const parameters: IMRAIDCampaign = {
            ... baseCampaignParams,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            resourceAsset: jsonMraidUrl.inlinedUrl ? new HTML(jsonMraidUrl.inlinedUrl, session) : undefined,
            resource: undefined,
            dynamicMarkup: jsonMraidUrl.dynamicMarkup,
            additionalTrackingEvents: response.getTrackingUrls(),
            clickAttributionUrl: jsonMraidUrl.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: jsonMraidUrl.clickAttributionUrlFollowsRedirects,
            clickUrl: jsonMraidUrl.clickUrl ? jsonMraidUrl.clickAttributionUrl : undefined,
            videoEventUrls: jsonMraidUrl.videoEventUrls ? jsonMraidUrl.videoEventUrls : undefined,
            gameName: jsonMraidUrl.gameName,
            gameIcon: jsonMraidUrl.gameIcon ? new Image(jsonMraidUrl.gameIcon, session) : undefined,
            rating: jsonMraidUrl.rating,
            ratingCount: jsonMraidUrl.ratingCount,
            landscapeImage: jsonMraidUrl.endScreenLandscape ? new Image(jsonMraidUrl.endScreenLandscape, session) : undefined,
            portraitImage: jsonMraidUrl.endScreenPortrait ? new Image(jsonMraidUrl.endScreenPortrait, session) : undefined,
            bypassAppSheet: jsonMraidUrl.bypassAppSheet,
            store: storeName,
            appStoreId: jsonMraidUrl.appStoreId
        };

        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
