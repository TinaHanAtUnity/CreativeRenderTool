import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

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

export enum CachingMetric {
    CachingModeForcedToDisabled = 'caching_mode_forced_to_disabled' // Occurs when user has less than 20mb of freespace in cache directory
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
    CampaignAttemptedShowInBackground = 'ad_attempted_show_background'
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

type PTSEvent = AdmobMetric | BannerMetric | CachingMetric | ChinaMetric | VastMetric | MiscellaneousMetric | LoadMetric | ProgrammaticTrackingError;

export interface IProgrammaticTrackingData {
    metrics: IPTSEvent[] | undefined;
}

interface IPTSEvent {
    name: string;
    value: number;
    tags: string[];
}

export class ProgrammaticTrackingService {
    private static productionMetricServiceUrl: string = 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/v1/metrics';
    private static stagingMetricServiceUrl: string = 'https://sdk-diagnostics.stg.mz.internal.unity3d.com/v1/metrics'; // Currently unused

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

    private createMetricTags(event: PTSEvent): string[] {
        return [this.createAdsSdkTag('mevt', event)];
    }

    private createErrorTags(event: PTSEvent, adType: string, seatId?: number): string[] {

        const platform: Platform = this._platform;
        const osVersion: string = this._deviceInfo.getOsVersion();
        const sdkVersion: string = this._clientInfo.getSdkVersionName();

        return [
            this.createAdsSdkTag('eevt', event),
            this.createAdsSdkTag('plt', Platform[platform]),
            this.createAdsSdkTag('osv', osVersion),
            this.createAdsSdkTag('sdv', sdkVersion),
            this.createAdsSdkTag('adt', `${adType}`),
            this.createAdsSdkTag('sid', `${seatId}`)
        ];
    }

    private createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    private postWithTags(event: PTSEvent, value: number, tags: string[]): Promise<INativeResponse> {
        const metricData: IProgrammaticTrackingData = {
            metrics: [
                {
                    name: event,
                    value: value,
                    tags: tags
                }
            ]
        };
        const url: string = ProgrammaticTrackingService.productionMetricServiceUrl;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];

        headers.push(['Content-Type', 'application/json']);

        return this._request.post(url, data, headers);
    }

    public reportMetricEvent(event: PTSEvent): Promise<INativeResponse> {
        return this.postWithTags(event, 1, this.createMetricTags(event));
    }

    public reportErrorEvent(event: PTSEvent, adType: string, seatId?: number) {
        return this.postWithTags(event, 1, this.createErrorTags(event, adType, seatId));
    }

}
