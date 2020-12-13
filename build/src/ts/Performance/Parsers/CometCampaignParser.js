import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
export class CometCampaignParser extends CampaignParser {
    constructor(core) {
        super(core.NativeBridge.getPlatform());
        this._requestManager = core.RequestManager;
    }
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
                storeName = StoreName.STANDALONE_ANDROID;
                break;
            default:
                throw new Error('Unknown store value "' + json.store + '"');
        }
        const cacheTTL = response.getCacheTTL();
        const baseCampaignParams = {
            id: json.id,
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: CometCampaignParser.ContentType,
            adType: undefined,
            correlationId: undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: json.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        if (json && json.mraidUrl) {
            const parameters = Object.assign({}, baseCampaignParams, { useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(), resourceAsset: json.mraidUrl ? new HTML(this.validateAndEncodeUrl(json.mraidUrl, session), session, json.creativeId) : undefined, resource: undefined, dynamicMarkup: json.dynamicMarkup, clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, clickUrl: json.clickUrl ? this.validateAndEncodeUrl(json.clickUrl, session) : undefined, videoEventUrls: json.videoEventUrls ? this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session) : undefined, gameName: json.gameName, gameIcon: json.gameIcon ? new Image(this.validateAndEncodeUrl(json.gameIcon, session), session) : undefined, rating: json.rating, ratingCount: json.ratingCount, landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session) : undefined, portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session) : undefined, bypassAppSheet: json.bypassAppSheet, store: storeName, appStoreId: json.appStoreId, playableConfiguration: undefined, targetGameId: json.gameId, isCustomCloseEnabled: response.isCustomCloseEnabled() || false });
            parameters.contentType = CometCampaignParser.ContentTypeMRAID;
            const mraidCampaign = new PerformanceMRAIDCampaign(parameters);
            if (CustomFeatures.isPlayableConfigurationEnabled(json.mraidUrl)) {
                const playableConfigurationUrl = json.mraidUrl.replace(/index\.html/, 'configuration.json');
                this._requestManager.get(playableConfigurationUrl).then(configurationResponse => {
                    try {
                        const playableConfiguration = JSON.parse(configurationResponse.response);
                        mraidCampaign.setPlayableConfiguration(playableConfiguration);
                    }
                    catch (e) {
                        Diagnostics.trigger('playable_configuration_invalid_json', {
                            playableConfigurationUrl: playableConfigurationUrl
                        });
                    }
                }).catch(error => {
                    // ignore failed requests
                });
            }
            return Promise.resolve(mraidCampaign);
        }
        else {
            if (CometCampaignParser._forceEndScreenUrl) {
                json.endScreenUrl = CometCampaignParser._forceEndScreenUrl;
            }
            const parameters = Object.assign({}, baseCampaignParams, { appStoreId: json.appStoreId, gameId: json.gameId, gameName: json.gameName, gameIcon: new Image(this.validateAndEncodeUrl(json.gameIcon, session), session), rating: json.rating, ratingCount: json.ratingCount, landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session) : undefined, portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session) : undefined, squareImage: json.endScreen ? new Image(this.validateAndEncodeUrl(json.endScreen, session), session) : undefined, clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined, clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects, clickUrl: this.validateAndEncodeUrl(json.clickUrl, session), videoEventUrls: this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session), bypassAppSheet: json.bypassAppSheet, store: storeName, adUnitStyle: json.adUnitStyle ? this.parseAdUnitStyle(json.adUnitStyle, session) : undefined, endScreenType: json.endScreenType, endScreen: json.endScreenUrl ? new HTML(this.validateAndEncodeUrl(json.endScreenUrl, session), session, json.creativeId) : undefined, endScreenSettings: json.endScreenSettings });
            if (json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                parameters.video = new Video(this.validateAndEncodeUrl(json.trailerDownloadable, session), session, json.trailerDownloadableSize, json.creativeId);
                parameters.streamingVideo = new Video(this.validateAndEncodeUrl(json.trailerStreaming, session), session, undefined, json.creativeId);
            }
            if (json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                parameters.videoPortrait = new Video(this.validateAndEncodeUrl(json.trailerPortraitDownloadable, session), session, json.trailerPortraitDownloadableSize, json.portraitCreativeId);
                parameters.streamingPortraitVideo = new Video(this.validateAndEncodeUrl(json.trailerPortraitStreaming, session), session, undefined, json.portraitCreativeId);
            }
            if (json.appDownloadUrl) {
                parameters.appDownloadUrl = json.appDownloadUrl;
            }
            return Promise.resolve(new PerformanceCampaign(parameters));
        }
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
    parseAdUnitStyle(adUnitStyleJson, session) {
        let adUnitStyle;
        try {
            adUnitStyle = new AdUnitStyle(adUnitStyleJson);
        }
        catch (error) {
            // do nothing
        }
        return adUnitStyle;
    }
    static setForceEndScreenUrl(value) {
        CometCampaignParser._forceEndScreenUrl = value;
    }
}
CometCampaignParser.ContentType = 'comet/campaign';
CometCampaignParser.ContentTypeVideo = 'comet/video';
CometCampaignParser.ContentTypeMRAID = 'comet/mraid-url';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tZXRDYW1wYWlnblBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9QZXJmb3JtYW5jZS9QYXJzZXJzL0NvbWV0Q2FtcGFpZ25QYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFdBQVcsRUFBZ0IsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDOUMsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUloRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RCxPQUFPLEVBR0gsbUJBQW1CLEVBQ25CLFNBQVMsRUFDWixNQUFNLHdDQUF3QyxDQUFDO0FBQ2hELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBRXZGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxjQUFjO0lBUW5ELFlBQVksSUFBVztRQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMvQyxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQXlCLEVBQUUsT0FBZ0I7UUFDcEQsTUFBTSxJQUFJLEdBQTRCLFFBQVEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUVoRSxNQUFNLGFBQWEsR0FBRyxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FB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