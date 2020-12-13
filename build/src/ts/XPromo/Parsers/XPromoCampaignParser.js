import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { StoreName } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
export class XPromoCampaignParser extends CampaignParser {
    parse(response, session) {
        const json = response.getJsonContent();
        const campaignStore = typeof json.store !== 'undefined' ? json.store : '';
        let storeName;
        switch (campaignStore) {
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
        const baseCampaignParams = {
            id: json.id,
            willExpireAt: undefined,
            contentType: XPromoCampaignParser.ContentType,
            adType: undefined,
            correlationId: undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: json.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() ? this.validateAndEncodeTrackingUrls(response.getTrackingUrls(), session) : {},
            isLoadEnabled: false
        };
        const parameters = Object.assign({}, baseCampaignParams, { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image(this.validateAndEncodeUrl(json.gameIcon, session), session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session) : undefined, portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session) : undefined, squareImage: json.endScreen ? new Image(this.validateAndEncodeUrl(json.endScreen, session), session) : undefined, clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, bypassAppSheet: json.bypassAppSheet, videoEventUrls: this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session), store: storeName });
        if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
            parameters.video = new Video(this.validateAndEncodeUrl(json.trailerDownloadable, session), session, json.trailerDownloadableSize);
            parameters.streamingVideo = new Video(this.validateAndEncodeUrl(json.trailerStreaming, session), session);
        }
        if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
            parameters.videoPortrait = new Video(this.validateAndEncodeUrl(json.trailerPortraitDownloadable, session), session, json.trailerPortraitDownloadableSize);
            parameters.streamingPortraitVideo = new Video(this.validateAndEncodeUrl(json.trailerPortraitStreaming, session), session);
        }
        return Promise.resolve(new XPromoCampaign(parameters));
    }
    validateAndEncodeVideoEventUrls(urls, session) {
        if (urls && urls !== null) {
            for (const urlKey in urls) {
                if (urls.hasOwnProperty(urlKey)) {
                    urls[urlKey] = this.validateAndEncodeUrl(urls[urlKey], session);
                }
            }
        }
        return urls;
    }
}
XPromoCampaignParser.ContentType = 'xpromo/video';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWFByb21vQ2FtcGFpZ25QYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvWFByb21vL1BhcnNlcnMvWFByb21vQ2FtcGFpZ25QYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUloRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUEyQixTQUFTLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RixPQUFPLEVBQW1CLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRS9FLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBSTdDLEtBQUssQ0FBQyxRQUF5QixFQUFFLE9BQWdCO1FBQ3BELE1BQU0sSUFBSSxHQUE0QixRQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFaEUsTUFBTSxhQUFhLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzFFLElBQUksU0FBb0IsQ0FBQztRQUN6QixRQUFRLGFBQWEsRUFBRTtZQUNuQixLQUFLLE9BQU87Z0JBQ1IsU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUM7Z0JBQzVCLE1BQU07WUFDVixLQUFLLFFBQVE7Z0JBQ1QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQzdCLE1BQU07WUFDVixLQUFLLFFBQVE7Z0JBQ1QsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7Z0JBQzdCLE1BQU07WUFDVixLQUFLLG9CQUFvQjtnQkFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1lBQ3JFO2dCQUNJ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