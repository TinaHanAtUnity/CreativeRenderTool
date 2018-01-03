import { Campaign, ICampaign } from 'Models/Campaign';
import { CampaignParser } from 'Parsers/CampaignParser';
import { IMRAIDCampaign, MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { IPerformanceCampaign, PerformanceCampaign, StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';
import { HTML } from 'Models/Assets/HTML';

export class CometCampaignParser extends CampaignParser {
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const json = response.getJsonContent();

        const campaignStore = typeof json.store !== 'undefined' ? json.store : '';
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
                throw new Error('Unknown store value "' + json.store + '"');
        }

        const baseCampaignParams: ICampaign = {
            id: json.id,
            gamerId: gamerId,
            abGroup: abGroup,
            willExpireAt: undefined,
            adType: undefined,
            correlationId: undefined,
            creativeId: undefined,
            seatId: undefined,
            meta: undefined,
            appCategory: undefined,
            appSubCategory: undefined,
            advertiserDomain: undefined,
            advertiserCampaignId: undefined,
            advertiserBundleId: undefined,
            useWebViewUserAgentForTracking: undefined,
            buyerId: undefined,
            session: session
        };

        if(json && json.mraidUrl) {
            const parameters: IMRAIDCampaign = {
                ... baseCampaignParams,
                useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
                resourceAsset: json.resourceUrl ? new HTML(json.resourceUrl, session) : undefined,
                resource: undefined,
                dynamicMarkup: json.dynamicMarkup,
                additionalTrackingEvents: undefined,
                clickAttributionUrl: json.clickAttributionUrl,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: json.clickUrl ? json.clickAttributionUrl : undefined,
                videoEventUrls: json.videoEventUrls ? json.videoEventUrls : undefined,
                gameName: json.gameName,
                gameIcon: json.gameIcon ? new Image(json.gameIcon, session) : undefined,
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: json.endScreenLandscape ? new Image(json.endScreenLandscape, session) : undefined,
                portraitImage: json.endScreenPortrait ? new Image(json.endScreenPortrait, session) : undefined,
                bypassAppSheet: json.bypassAppSheet,
                store: storeName,
                appStoreId: json.appStoreId
            };
/*
            if(json.cacheTTL) {
                parameters.willExpireAt = Date.now() + json.cacheTTL * 1000;
            }
*/
            return Promise.resolve(new MRAIDCampaign(parameters));
        } else {
            const parameters: IPerformanceCampaign = {
                ... baseCampaignParams,

                appStoreId: json.appStoreId,
                gameId: json.gameId,
                gameName: json.gameName,
                gameIcon: new Image(json.gameIcon, session),
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: new Image(json.endScreenLandscape, session),
                portraitImage: new Image(json.endScreenPortrait, session),
                clickAttributionUrl: json.clickAttributionUrl,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: json.clickUrl,
                videoEventUrls: json.videoEventUrls,
                bypassAppSheet: json.bypassAppSheet,
                store: storeName
            };

            if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                parameters.video = new Video(json.trailerDownloadable, session, json.trailerDownloadableSize);
                parameters.streamingVideo = new Video(json.trailerStreaming, session);
            }

            if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                parameters.videoPortrait = new Video(json.trailerPortraitDownloadable, session, json.trailerPortraitDownloadableSize);
                parameters.streamingPortraitVideo = new Video(json.trailerPortraitStreaming, session);
            }

            return Promise.resolve(new PerformanceCampaign(parameters));
        }
    }
}
