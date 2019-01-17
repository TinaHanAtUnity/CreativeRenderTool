import { AdUnitStyle, IAdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ICore } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IMRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import {
    IPerformanceCampaign,
    IRawPerformanceCampaign,
    PerformanceCampaign,
    StoreName
} from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';

// Events marked with // are currently sent, but are unused - waiting for BI to confirm if they want them sent
export enum ICometTrackingUrlEvents {
    START = 'start',
    CLICK = 'click',
    ENDCARD_CLICK = 'videoEndCardClick', //
    FIRST_QUARTILE = 'firstQuartile',
    MIDPOINT = 'midpoint',
    THIRD_QUARTILE = 'thirdQuartile',
    ERROR = 'error',
    STALLED = 'stalled', //
    LOADED_IMPRESSION = 'loaded',
    SHOW = 'show', //
    COMPLETE = 'complete',
    SKIP = 'skip'
}

export class CometCampaignParser extends CampaignParser {
    public static ContentType = 'comet/campaign';
    public static ContentTypeVideo = 'comet/video';
    public static ContentTypeMRAID = 'comet/mraid-url';

    private _requestManager: RequestManager;

    constructor(core: ICore) {
        super(core.NativeBridge.getPlatform());
        this._requestManager = core.RequestManager;
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        const json = <IRawPerformanceCampaign>response.getJsonContent();

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
                storeName = StoreName.STANDALONE_ANDROID;
                break;
            default:
                throw new Error('Unknown store value "' + json.store + '"');
        }

        const baseCampaignParams: ICampaign = {
            id: json.id,
            willExpireAt: undefined,
            contentType: CometCampaignParser.ContentType,
            adType: undefined,
            correlationId: undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: json.meta,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            backupCampaign: false
        };

        if(json && json.mraidUrl) {
            const parameters: IMRAIDCampaign = {
                ... baseCampaignParams,
                useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
                resourceAsset: json.mraidUrl ? new HTML(this.validateAndEncodeUrl(json.mraidUrl, session), session, json.creativeId) : undefined,
                resource: undefined,
                dynamicMarkup: json.dynamicMarkup,
                clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: json.clickUrl ? this.validateAndEncodeUrl(json.clickUrl, session) : undefined,
                videoEventUrls: json.videoEventUrls ? this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session) : undefined,
                gameName: json.gameName,
                gameIcon: json.gameIcon ? new Image(this.validateAndEncodeUrl(json.gameIcon, session), session) : undefined,
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session) : undefined,
                portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session) : undefined,
                bypassAppSheet: json.bypassAppSheet,
                store: storeName,
                appStoreId: json.appStoreId,
                playableConfiguration: undefined
            };
            parameters.contentType = CometCampaignParser.ContentTypeMRAID;

            const mraidCampaign = new PerformanceMRAIDCampaign(parameters);

            if (CustomFeatures.isPlayableConfigurationEnabled(json.mraidUrl)) {
                const playableConfigurationUrl = json.mraidUrl.replace(/index\.html/, 'configuration.json');
                this._requestManager.get(playableConfigurationUrl).then(configurationResponse => {
                    try {
                        const playableConfiguration = JSON.parse(configurationResponse.response);
                        mraidCampaign.setPlayableConfiguration(playableConfiguration);
                    } catch (e) {
                        Diagnostics.trigger('playable_configuration_invalid_json', {
                            playableConfigurationUrl: playableConfigurationUrl
                        });
                    }
                }).catch(error => {
                    // ignore failed requests
                });
            }
            return Promise.resolve(mraidCampaign);
        } else {
            const parameters: IPerformanceCampaign = {
                ... baseCampaignParams,
                appStoreId: json.appStoreId,
                gameId: json.gameId,
                gameName: json.gameName,
                gameIcon: new Image(this.validateAndEncodeUrl(json.gameIcon, session), session),
                rating: json.rating,
                ratingCount: json.ratingCount,
                landscapeImage: json.endScreenLandscape ? new Image(this.validateAndEncodeUrl(json.endScreenLandscape, session), session) : undefined,
                portraitImage: json.endScreenPortrait ? new Image(this.validateAndEncodeUrl(json.endScreenPortrait, session), session) : undefined,
                squareImage: json.endScreen ? new Image(this.validateAndEncodeUrl(json.endScreen, session), session) : undefined,
                clickAttributionUrl: json.clickAttributionUrl ? this.validateAndEncodeUrl(json.clickAttributionUrl, session) : undefined,
                clickAttributionUrlFollowsRedirects: json.clickAttributionUrlFollowsRedirects,
                clickUrl: this.validateAndEncodeUrl(json.clickUrl, session),
                videoEventUrls: this.validateAndEncodeVideoEventUrls(json.videoEventUrls, session),
                bypassAppSheet: json.bypassAppSheet,
                store: storeName,
                adUnitStyle: json.adUnitStyle ? this.parseAdUnitStyle(json.adUnitStyle, session) : undefined
            };

            if(json.trailerDownloadable && json.trailerDownloadableSize && json.trailerStreaming) {
                parameters.video = new Video(this.validateAndEncodeUrl(json.trailerDownloadable, session), session, json.trailerDownloadableSize, json.creativeId);
                parameters.streamingVideo = new Video(this.validateAndEncodeUrl(json.trailerStreaming, session), session, undefined, json.creativeId);
            }

            if(json.trailerPortraitDownloadable && json.trailerPortraitDownloadableSize && json.trailerPortraitStreaming) {
                parameters.videoPortrait = new Video(this.validateAndEncodeUrl(json.trailerPortraitDownloadable, session), session, json.trailerPortraitDownloadableSize, json.portraitCreativeId);
                parameters.streamingPortraitVideo = new Video(this.validateAndEncodeUrl(json.trailerPortraitStreaming, session), session, undefined, json.portraitCreativeId);
            }

            if(json.appDownloadUrl) {
                parameters.appDownloadUrl = json.appDownloadUrl;
            }
            return Promise.resolve(new PerformanceCampaign(parameters));
        }
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

    private parseAdUnitStyle(adUnitStyleJson: IAdUnitStyle, session: Session): AdUnitStyle | undefined {
        let adUnitStyle: AdUnitStyle | undefined;
        try {
            adUnitStyle = new AdUnitStyle(adUnitStyleJson);
        } catch(error) {
            // do nothing
        }
        return adUnitStyle;
    }
}
