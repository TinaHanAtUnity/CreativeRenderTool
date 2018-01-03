import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { IMRAIDCampaign, MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { HTML } from 'Models/Assets/HTML';
import { Image } from 'Models/Assets/Image';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';

export class ProgrammaticMraidParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
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

        jsonMraid.id = this.getProgrammaticCampaignId(nativeBridge);
        const markup = decodeURIComponent(jsonMraid.markup);

        const campaignStore = typeof jsonMraid.store !== 'undefined' ? jsonMraid.store : '';
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
                throw new Error('Unknown store value "' + jsonMraid.store + '"');
        }

        const baseCampaignParams: ICampaign = {
            id: jsonMraid.id,
            gamerId: gamerId,
            abGroup: abGroup,
            willExpireAt: jsonMraid.cacheTTL ? Date.now() + jsonMraid.cacheTTL * 1000 : undefined,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: jsonMraid.meta,
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
            resourceAsset: undefined,
            resource: markup,
            dynamicMarkup: jsonMraid.dynamicMarkup,
            additionalTrackingEvents: response.getTrackingUrls(),
            clickAttributionUrl: jsonMraid.clickAttributionUrl,
            clickAttributionUrlFollowsRedirects: jsonMraid.clickAttributionUrlFollowsRedirects,
            clickUrl: jsonMraid.clickUrl ? jsonMraid.clickAttributionUrl : undefined,
            videoEventUrls: jsonMraid.videoEventUrls ? jsonMraid.videoEventUrls : undefined,
            gameName: jsonMraid.gameName,
            gameIcon: jsonMraid.gameIcon ? new Image(jsonMraid.gameIcon, session) : undefined,
            rating: jsonMraid.rating,
            ratingCount: jsonMraid.ratingCount,
            landscapeImage: jsonMraid.endScreenLandscape ? new Image(jsonMraid.endScreenLandscape, session) : undefined,
            portraitImage: jsonMraid.endScreenPortrait ? new Image(jsonMraid.endScreenPortrait, session) : undefined,
            bypassAppSheet: jsonMraid.bypassAppSheet,
            store: storeName,
            appStoreId: jsonMraid.appStoreId
        };

        return Promise.resolve(new MRAIDCampaign(parameters));
    }
}
