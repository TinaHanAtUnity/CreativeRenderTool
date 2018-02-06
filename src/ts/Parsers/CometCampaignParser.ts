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
            meta: json.meta,
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
                resourceAsset: json.mraidUrl ? new HTML(this.validateAndEncodeUrl(json.mraidUrl), session) : undefined,
                resource: undefined,
                dynamicMarkup: json.dynamicMarkup,
                additionalTrackingEvents: undefined,
                clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl) : undefined,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: json.clickUrl ? this.validateAndEncodeUrl(json.clickUrl) : undefined,
                videoEventUrls: json.videoEventUrls ? json.videoEventUrls : undefined,
                gameName: json.gameName,
                gameIcon: json.gameIcon ? new Image(this.validateAndEncodeUrl(json.gameIcon), session) : undefined,
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape), session) : undefined,
                portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait), session) : undefined,
                bypassAppSheet: json.bypassAppSheet,
                store: storeName,
                appStoreId: json.appStoreId
            };

            return Promise.resolve(new MRAIDCampaign(parameters));
        } else {
            const parameters: IPerformanceCampaign = {
                ... baseCampaignParams,

                appStoreId: json.appStoreId,
                gameId: json.gameId,
                gameName: json.gameName,
                gameIcon: new Image(this.validateAndEncodeUrl(json.gameIcon), session),
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: new Image(this.validateAndEncodeUrl(json.endScreenLandscape), session),
                portraitImage: new Image(this.validateAndEncodeUrl(json.endScreenPortrait), session),
                clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl) : undefined,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: this.validateAndEncodeUrl(json.clickUrl),
                videoEventUrls: json.videoEventUrls,
                bypassAppSheet: json.bypassAppSheet,
                store: storeName
            };

            if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                parameters.video = new Video(this.validateAndEncodeUrl(json.trailerDownloadable), session, json.trailerDownloadableSize);
                parameters.streamingVideo = new Video(this.validateAndEncodeUrl(json.trailerStreaming), session);
            }

            if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                parameters.videoPortrait = new Video(this.validateAndEncodeUrl(json.trailerPortraitDownloadable), session, json.trailerPortraitDownloadableSize);
                parameters.streamingPortraitVideo = new Video(this.validateAndEncodeUrl(json.trailerPortraitStreaming), session);
            }

            return Promise.resolve(new PerformanceCampaign(parameters));
        }
    }
}
