import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { IXPromoCampaign, XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/Core';

export class XPromoCampaignParser extends CampaignParser {

    public parse(platform: Platform, core: ICoreApi, request: RequestManager, response: AuctionResponse, session: Session): Promise<Campaign> {
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
            case 'standalone_android':
                throw new Error('Android APK not supported on cross promotion.');
            default:
                throw new Error('Unknown store value "' + json.store + '"');
        }

        const baseCampaignParams: ICampaign = {
            id: json.id,
            willExpireAt: undefined,
            adType: undefined,
            correlationId: undefined,
            creativeId: response.getCreativeId(),
            seatId: undefined,
            meta: json.meta,
            session: session,
            mediaId: response.getMediaId()
        };

        const parameters: IXPromoCampaign = {
            ... baseCampaignParams,

            appStoreId: json.appStoreId,
            gameId: json.gameId,
            gameName: json.gameName,
            gameIcon: new Image(this.validateAndEncodeUrl(json.gameIcon, session), session),
            rating: json.rating,
            ratingCount: json.ratingCount,
            landscapeImage: new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session),
            portraitImage: new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session),
            clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined,
            clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
            bypassAppSheet: json.bypassAppSheet,
            trackingUrls: response.getTrackingUrls() ? this.validateAndEncodeTrackingUrls(response.getTrackingUrls(), session) : undefined,
            videoEventUrls: this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session),
            store: storeName
        };

        if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(this.validateAndEncodeUrl(json.trailerDownloadable, session), session, json.trailerDownloadableSize);
            parameters.streamingVideo = new Video(this.validateAndEncodeUrl(json.trailerStreaming, session), session);
        }

        if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(this.validateAndEncodeUrl(json.trailerPortraitDownloadable, session), session, json.trailerPortraitDownloadableSize);
            parameters.streamingPortraitVideo = new Video(this.validateAndEncodeUrl(json.trailerPortraitStreaming, session), session);
        }

        return Promise.resolve(new XPromoCampaign(parameters));
    }

    private validateAndEncodeVideoEventUrls(urls: { [eventType: string]: string }, session: Session): { [eventType: string]: string } {
        if(urls && urls !== null) {
            for(const urlKey in urls) {
                if(urls.hasOwnProperty(urlKey)) {
                    urls[urlKey] = this.validateAndEncodeUrl(urls[urlKey], session);
                }
            }
        }

        return urls;
    }
}
