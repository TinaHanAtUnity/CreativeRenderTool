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
    MissingTrackingUrlsOnShow = 'missing_tracking_urls_on_show',
    TimingValueNegative = 'timing_value_negative'
}

export enum AdmobMetric {
    AdmobUsedCachedVideo = 'admob_used_cached_video',
    AdmobUsedStreamedVideo = 'admob_used_streamed_video',
    AdmobUserVideoSeeked = 'admob_user_video_seeked',
    AdmobRewardedVideoStart = 'admob_rewarded_video_start',
    AdmobUserWasRewarded = 'admob_user_was_rewarded',
    AdmobUserSkippedRewardedVideo = 'admob_user_skipped_rewarded_video',
    AdmobDBMRewardedCanPlay = 'admob_dbm_rewarded_canplay',
    AdmobDBMRewardedStarted = 'admob_dbm_rewarded_started',
    AdmobDBMNonRewardedCanPlay = 'admob_dbm_nonrewarded_canplay',
    AdmobDBMNonRewardedStarted = 'admob_dbm_nonrewarded_started',
    AdmobNonDBMRewardedCanPlay = 'admob_nondbm_rewarded_canplay',
    AdmobNonDBMRewardedStarted = 'admob_nondbm_rewarded_started',
    AdmobNonDBMNonRewardedCanPlay = 'admob_nondbm_nonrewarded_canplay',
    AdmobNonDBMNonRewardedStarted = 'admob_nondbm_nonrewarded_started',
    AdmobVideoCanPlay = 'admob_video_canplay',
    AdmobVideoStarted = 'admob_video_started',
    AdmobOMEnabled = 'admob_om_enabled',
    AdmobOMInjected = 'admob_om_injected',
    AdmobOMSessionStart = 'admob_om_session_start',
    AdmobOMSessionFinish = 'admob_om_session_finish',
    AdmobOMImpression = 'admob_om_impression',
    AdmobOMRegisteredImpression = 'admob_om_registered_impression'
}

export enum BannerMetric {
    BannerAdLoad = 'banner_ad_load',
    BannerAdUnitLoaded = 'banner_ad_unit_loaded',
    BannerAdRequest = 'banner_ad_request',
    BannerAdImpression = 'banner_ad_impression',
    BannerAdFill = 'banner_ad_fill',
    BannerAdNoFill = 'banner_ad_no_fill',
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
    LoadAuctionRequestBlocked = 'load_auction_request_blocked',
    LoadCometRefreshRequest = 'load_comet_refresh_request',
    LoadCometRefreshFill = 'load_comet_refresh_fill',
    LoadCometRefreshNoFill = 'load_comet_refresh_no_fill',
    LoadProgrammaticRefreshRequest = 'load_programmatic_refresh_request',
    LoadProgrammaticFill = 'load_programmatic_fill',
    LoadProgrammaticUsedPreviousFill = 'load_programmatic_used_previous_fill'
}

export enum OMMetric {
    IASVASTVerificationParsed = 'ias_vast_verification_parsed',
    IASNestedVastTagHackApplied = 'ias_nested_vast_tag_hack_applied',
    IASVerificatonInjected = 'ias_verification_injected',
    IASVerificationSessionStarted = 'ias_verification_session_started',
    IASVerificationSessionFinished = 'ias_verification_session_finished',
    IASVerificatonInjectionFailed = 'ias_verification_injection_failed'
}

export enum TimingMetric {
    TotalWebviewInitializationTime = 'webview_initialization_time',
    InitializeCallToWebviewLoadTime = 'initialization_call_to_webview_load_time',
    WebviewLoadToConfigurationCompleteTime = 'webview_load_to_configuration_complete_time',
    AuctionRequestTime = 'auction_request_round_trip_time',
    AuctionToFillStatusTime = 'auction_request_to_fill_status_time',
    CoreInitializeTime = 'uads_core_initialize_time',
    AdsInitializeTime = 'uads_ads_initialize_time'
}

export enum MraidMetric {
    UseCustomCloseCalled = 'mraid_use_custom_close_called',
    CloseMovedToLeft = 'mraid_close_graphic_moved_to_left',
    CloseHidden = 'mraid_close_graphic_hidden',
    ClosedByAdUnit = 'mraid_closed_by_ad_unit',
    ClosedByUnityAds = 'mraid_closed_by_unity_ads'
}

export enum AUIMetric {
    InvalidEndscreenAnimation = 'invalid_endscreen_animation',
    AutomatedExperimentManagerInitializationError = 'automated_experiment_manager_initialization_error'
}

export enum AdUnitTracking {
    ShowCall = 'ad_unit_showcall',
    DuplicateLoadForPlacement = 'ad_unit_duplicate_load_for_placement',
    PossibleDuplicateLoadForPlacement = 'ad_unit_possible_duplicate_load_for_placement',
    InitialLoadRequest = 'ad_unit_initial_load_request',
    AttemptToShowAd = 'ad_unit_attempt_to_show',
    FailedToInvalidate = 'ad_unit_failed_to_invalidate'
}

type PTSEvent = AdmobMetric | BannerMetric | CachingMetric | ChinaMetric | VastMetric | MraidMetric | MiscellaneousMetric | LoadMetric | ProgrammaticTrackingError | OMMetric | TimingMetric | AUIMetric | AdUnitTracking;

export interface IProgrammaticTrackingData {
    metrics: IPTSEvent[];
}

interface IPTSEvent {
    name: string;
    value: number;
    tags: string[];
}

export class ProgrammaticTrackingService {
    // Used for manual verification of PRs merged to ads-sdk-diagnostics that are not yet deployed
    private stagingBaseUrl: string = 'https://sdk-diagnostics.stg.mz.internal.unity3d.com/';

    private metricPath = 'v1/metrics';
    private timingPath = 'v1/timing';

    private _platform: Platform;
    private _request: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _countryIso: string;
    private _batchedEvents: IPTSEvent[];

    constructor(platform: Platform, request: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, country: string) {
        this._platform = platform;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._countryIso = country;
        this._batchedEvents = [];
    }

    protected getBaseUrl(): string {
        return 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/';
    }

    private createMetricTags(event: PTSEvent, tags: string[]): string[] {
        const sdkVersion: string = this._clientInfo.getSdkVersionName();
        return [this.createAdsSdkTag('mevt', event),
                this.createAdsSdkTag('sdv', sdkVersion),
                this.createAdsSdkTag('plt', Platform[this._platform])].concat(tags);
    }

    private createTimingTags(): string[] {
        return [
            this.createAdsSdkTag('sdv', this._clientInfo.getSdkVersionName()),
            this.createAdsSdkTag('iso', this._countryIso),
            this.createAdsSdkTag('plt', Platform[this._platform])
        ];
    }

    private createErrorTags(event: PTSEvent, adType?: string, seatId?: number): string[] {

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

    private createData(event: PTSEvent, value: number, tags: string[]): IProgrammaticTrackingData {
        return {
            metrics: [
                {
                    name: event,
                    value: value,
                    tags: tags
                }
            ]
        };
    }

    private postToDatadog(metricData: IProgrammaticTrackingData, path: string): Promise<INativeResponse> {
        const url: string = this.getBaseUrl() + path;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];
        headers.push(['Content-Type', 'application/json']);
       // TODO: uncomment once privacy uses own html container instead of MRAID, that gives PTS error
        //return this._request.post(url, data, headers);
        return Promise.resolve(<INativeResponse>{});
    }

    public createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    public reportMetricEvent(event: PTSEvent): Promise<INativeResponse> {
        return this.reportMetricEventWithTags(event, []);
    }

    public reportMetricEventWithTags(event: PTSEvent, tags: string[]) {
        const metricData = this.createData(event, 1, this.createMetricTags(event, tags));
        return this.postToDatadog(metricData, this.metricPath);
    }

    public reportErrorEvent(event: PTSEvent, adType: string, seatId?: number): Promise<INativeResponse> {
        const errorData = this.createData(event, 1, this.createErrorTags(event, adType, seatId));
        return this.postToDatadog(errorData, this.metricPath);
    }

    public reportTimingEvent(event: TimingMetric, value: number): Promise<INativeResponse> {
        // Gate Negative Values
        if (value > 0) {
            const timingData = this.createData(event, value, this.createTimingTags());
            return this.postToDatadog(timingData, this.timingPath);
        } else {
            const metricData = this.createData(ProgrammaticTrackingError.TimingValueNegative, 1, this.createMetricTags(event, []));
            return this.postToDatadog(metricData, this.metricPath);
        }
    }

    // TODO: Extend this to all events
    public batchEvent(metric: TimingMetric, value: number): void {
        // Curently ignore additional negative time values
        if (value > 0) {
            this._batchedEvents = this._batchedEvents.concat(this.createData(metric, value, this.createTimingTags()).metrics);
        }

        // Failsafe so we aren't storing too many events at once
        if (this._batchedEvents.length >= 10) {
            this.sendBatchedEvents();
        }
    }

    public async sendBatchedEvents(): Promise<void> {
        if (this._batchedEvents.length > 0) {
            const data = {
                metrics: this._batchedEvents
            };
            await this.postToDatadog(data, this.timingPath);
            this._batchedEvents = [];
            return;
        }
        return Promise.resolve();
    }

}
