import { MetricInstance } from 'Ads/Networking/MetricInstance';

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
    AdmobOMRegisteredImpression = 'admob_om_registered_impression',
    AdmobOMSessionStartObserverCalled = 'admob_om_session_start_observer_called',
    DoubleClickOMInjections = 'doubleclick_om_injections',
    DoubleClickOMStarts = 'doubleclick_om_starts',
    DoubleClickOMImpressions = 'doubleclick_om_impressions'
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
    CampaignAttemptedShowInBackground = 'ad_attempted_show_background',
    IOSDeleteStoredGamerToken = 'ios_delete_stored_gamer_token'
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

export type PTSEvent = AdmobMetric | BannerMetric | CachingMetric | ChinaMetric | VastMetric | MraidMetric | MiscellaneousMetric | LoadMetric | ProgrammaticTrackingError | OMMetric | TimingMetric | AUIMetric;

export class ProgrammaticTrackingService {

    private static _metricInstance: MetricInstance;

    public static initialize(metricInstance: MetricInstance): void {
        if (!this._metricInstance) {
            this._metricInstance = metricInstance;
        }
    }

    public static createAdsSdkTag(suffix: string, tagValue: string): string {
        return this._metricInstance.createAdsSdkTag(suffix, tagValue);
    }

    public static reportMetricEvent(event: PTSEvent): void {
        this._metricInstance.reportMetricEventWithTags(event, []);
    }

    public static reportMetricEventWithTags(event: PTSEvent, tags: string[]): void {
        this._metricInstance.reportMetricEventWithTags(event, tags);
    }

    public static reportErrorEvent(event: PTSEvent, adType: string, seatId?: number): void {
        this._metricInstance.reportErrorEvent(event, adType, seatId);
    }

    public static reportTimingEvent(event: TimingMetric, value: number): void {
        this._metricInstance.reportTimingEvent(event, value);
    }

    public static batchEvent(metric: TimingMetric, value: number): void {
        this._metricInstance.batchEvent(metric, value);
    }

    public static sendBatchedEvents(): void {
        this._metricInstance.sendBatchedEvents();
    }
}
