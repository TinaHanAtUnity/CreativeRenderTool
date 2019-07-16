import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ICore } from 'Core/ICore';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { IMRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import {
    IPerformanceCampaign,
    IRawPerformanceCampaign,
    PerformanceCampaign,
    StoreName
} from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { ABGroup } from 'Core/Models/ABGroup';
import { SliderPerformanceCampaign } from 'Performance/Models/SliderPerformanceCampaign';

const SLIDER_SCREENSHOT_BASE_URL = 'https://cdn-aui-experiments-data.unityads.unity3d.com/ec/';

export class CometCampaignParserWithSliderSupport extends CometCampaignParser {
    protected _abGroup: ABGroup;
    protected _core: ICore;

    constructor(core: ICore) {
        super(core);

        this._abGroup = core.Config.getAbGroup();
        this._core = core;
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        const json = <IRawPerformanceCampaign>response.getJsonContent();

        const campaignStore = typeof json.store !== 'undefined' ? json.store : '';
        let storeName: StoreName;
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
            isLoadEnabled: false
        };

        if (json && json.mraidUrl) {
            const parameters: IMRAIDCampaign = {
                ...baseCampaignParams,
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
                playableConfiguration: undefined,
                targetGameId: json.gameId
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
                ...baseCampaignParams,
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

            const osVersion = this._core.DeviceInfo.getOsVersion();
            const platform = this._core.NativeBridge.getPlatform();

            if (!CustomFeatures.isSliderEndScreenEnabled(this._abGroup, parameters.appStoreId, osVersion, platform)) {
                return Promise.resolve(new PerformanceCampaign(parameters));
            }

            const orientation = CustomFeatures.getSliderEndScreenImageOrientation(parameters.appStoreId);
            parameters.screenshotsOrientation = orientation;
            parameters.screenshots = Array.from([1, 2, 3], i => {
                const url = this.validateAndEncodeUrl(`${SLIDER_SCREENSHOT_BASE_URL}${parameters.appStoreId}/${i}.png`, session);
                return new Image(url, session);
            });

            return Promise.resolve(new SliderPerformanceCampaign(parameters));
        }
    }
}
