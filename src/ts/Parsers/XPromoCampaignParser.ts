import { Campaign, ICampaign } from 'Models/Campaign';
import { CampaignParser } from 'Parsers/CampaignParser';
import { StoreName } from 'Models/Campaigns/PerformanceCampaign';
import { IXPromoCampaign, XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Video } from 'Models/Assets/Video';
import { Image } from 'Models/Assets/Image';

export class XPromoCampaignParser extends CampaignParser {
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
            session: session
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
}
