import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export enum ProgrammaticTrackingError {
    TooLargeFile = 'too_large_file', // a file 20mb and over are considered too large
    BannerRequestError = 'banner_request_error',
    AdmobTestHttpError = 'admob_video_http_error',
    VastClickWithoutImpressionError = 'vast_click_without_impression',
    AdUnitAlreadyShowing = 'ad_unit_already_showing',
    PlacementWithIdDoesNotExist = 'placement_with_id_does_not_exist',
    PromoWithoutCreatives = 'promo_without_creatives',
    CampaignExpired = 'campaign_expired',
    NoConnectionWhenNeeded = 'no_connection_when_needed',
    MissingTrackingUrlsOnShow = 'missing_tracking_urls_on_show'
}

export enum AdmobMetric {
    AdmobUsedCachedVideo = 'admob_used_cached_video',
    AdmobUsedStreamedVideo = 'admob_used_streamed_video',
    AdmobUserVideoSeeked = 'admob_user_video_seeked',
    AdmobRewardedVideoStart = 'admob_rewarded_video_start',
    AdmobUserWasRewarded = 'admob_user_was_rewarded',
    AdmobUserSkippedRewardedVideo = 'admob_user_skipped_rewarded_video'
}

export enum BannerMetric {
    BannerAdRequest = 'banner_ad_request',
    BannerAdImpression = 'banner_ad_impression',
    BannerAdRequestWithLimitedAdTracking = 'banner_ad_request_with_limited_ad_tracking'
}

export enum ChinaMetric {
    ChineseUserInitialized = 'chinese_user_intialized',
    ChineseUserIdentifiedCorrectlyByNetworkOperator = 'chinese_user_identified_correctly_by_network_operator',
    ChineseUserIdentifiedIncorrectlyByNetworkOperator = 'chinese_user_identified_incorrectly_by_network_operator',
    ChineseUserIdentifiedCorrectlyByLocale = 'chinese_user_identified_correctly_by_locale',
    ChineseUserIdentifiedIncorrectlyByLocale = 'chinese_user_identified_incorrectly_by_locale'
}

export enum VastMetric {
    VastVideoImpressionFailed = 'vast_video_impression_failed'
}

export enum MiscellaneousMetric {
    CampaignNotFound = 'campaign_not_found',
    ConsentParagraphLinkClicked = 'consent_paragraph_link_clicked',
    CampaignAttemptedToShowAdInBackground = 'ad_attempted_showad_background',
    CampaignAboutToShowAdInBackground = 'ad_aboutto_showad_background'
}

export enum LoadMetric {
    LoadEnabledAuctionRequest = 'load_enabled_auction_request',
    LoadEnabledFill = 'load_enabled_fill',
    LoadEnabledNoFill = 'load_enabled_no_fill',
    LoadEnabledShow = 'load_enabled_show',
    LoadEnabledInitializationSuccess = 'load_enabled_initialization_success',
    LoadEnabledInitializationFailure = 'load_enabled_initialization_failure',
    LoadAuctionRequestBlocked = 'load_auction_request_blocked'
}

export enum PurchasingMetric {
    PurchasingAppleStoreStarted = 'purchasing_apple_store_started',
    PurchasingGoogleStoreStarted = 'purchasing_google_store_started'
}

export enum WebviewLifeCycleMetric {
    WebviewInitializationTimeTaken = 'webview_initialization_time_taken'
}

type ProgrammaticTrackingMetric = AdmobMetric | BannerMetric | ChinaMetric | VastMetric | MiscellaneousMetric | LoadMetric | PurchasingMetric | WebviewLifeCycleMetric;

export interface IProgrammaticTrackingData {
    metrics: IProgrammaticTrackingMetric[] | undefined;
}

interface IProgrammaticTrackingMetric {
    name: string;
    value: number;
    tags: string[];
}

export class ProgrammaticTrackingService {
    private static newProductionMetricServiceUrl: string = 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics';
    private static stagingMetricServiceUrl: string = 'https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics';

    private _platform: Platform;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;

    constructor(platform: Platform, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._platform = platform;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
    }

    private createErrorTag(tagValue: string): string {
        return this.createAdsSdkTag('eevt', tagValue);
    }

    private createMetricTag(tagValue: string): string {
        return this.createAdsSdkTag('mevt', tagValue);
    }

    private createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    public reportError(error: ProgrammaticTrackingError, adType: string, seatId?: number | undefined): Promise<INativeResponse> {
        const platform: Platform = this._platform;
        const osVersion: string = this._deviceInfo.getOsVersion();
        const sdkVersion: string = this._clientInfo.getSdkVersionName();
        const metricData: IProgrammaticTrackingData = {
            metrics: [
                {
                    name: error,
                    value: 1,
                    tags: [
                        this.createErrorTag(error),
                        this.createAdsSdkTag('plt', Platform[platform]),
                        this.createAdsSdkTag('osv', osVersion),
                        this.createAdsSdkTag('sdv', sdkVersion),
                        this.createAdsSdkTag('adt', adType),
                        this.createAdsSdkTag('sid', `${seatId}`)
                    ]
                }
            ]
        };
        const url: string = ProgrammaticTrackingService.newProductionMetricServiceUrl;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

    public reportMetricWithTags(event: ProgrammaticTrackingMetric, value: number, tags: string[]): Promise<INativeResponse> {
        const isLoadMetric = Object.values(LoadMetric).includes(event);
        const isZyngaFreeCellSolitareUsingLoad = CustomFeatures.isTrackedGameUsingLoadApi(this._clientInfo.getGameId());
        if (isLoadMetric && !isZyngaFreeCellSolitareUsingLoad) {
            return Promise.resolve(<INativeResponse>{});
        }
        const metricData: IProgrammaticTrackingData = {
            metrics: [
                {
                    name: event,
                    value: value,
                    tags: tags
                }
            ]
        };
        const url: string = ProgrammaticTrackingService.newProductionMetricServiceUrl;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers).then((res) => {
            if (CustomFeatures.sampleAtGivenPercent(1)) {
                return this._request.post(ProgrammaticTrackingService.newProductionMetricServiceUrl, data, headers);
            }
            return res;
        });
    }

    public reportMetric(event: ProgrammaticTrackingMetric): Promise<INativeResponse> {
        return this.reportMetricWithTags(event, 1, [this.createMetricTag(event)]);
    }

}
