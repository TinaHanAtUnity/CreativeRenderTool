import { IMetricInstance } from 'Ads/Networking/MetricInstance';

export enum ErrorMetric {
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
    DoubleClickOMImpressions = 'doubleclick_om_impressions',
    DoubleClickInstanceCreated = 'doubleclick_om_instance_created',
    AdmobOMVideoStart = 'admob_om_video_start'
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
    ImpressionDuplicate = 'impression_duplicate',
    CampaignNotFound = 'campaign_not_found',
    ConsentParagraphLinkClicked = 'consent_paragraph_link_clicked',
    CampaignAttemptedShowInBackground = 'ad_attempted_show_background',
    IOSDeleteStoredGamerToken = 'ios_delete_stored_gamer_token',
    XHRNotAvailable = 'xhr_not_available',
    AuctionRequestFailed = 'auction_request_failed',
    AuctionRequestOk = 'auction_request_ok',
    AuctionRequestCreated = 'auction_request_created'
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
    IASVerificatonInjectionFailed = 'ias_verification_injection_failed',
    OMEnabledLiftOff = 'om_enabled_liftoff',
    OMInjectionFailure = 'om_injection_failure'
}

export enum InitializationMetric {
    NativeInitialization = 'native_init',
    WebviewInitialization = 'webview_init',
    WebviewInitializationPhases = 'webview_init_phases',
    WebviewLoad = 'webview_load'
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
    AutomatedExperimentManagerInitializationError = 'automated_experiment_manager_initialization_error',
    DecisionNotReady = 'decision_not_ready',
    InvalidEndscreenColorTintSwitches = 'invalid_endscreen_color_tint_switches',
    InvalidEndscreenColorTintTheme = 'invalid_endscreen_color_tint_theme',
    EndscreenColorTintError = 'endscreen_color_tint_error',
    EndscreenColorTintThemingFailed = 'endscreen_color_tint_theming_failed'
}

export enum GeneralTimingMetric {
    AuctionRequest = 'auction_request',
    CampaignParsing = 'campaign_parsing',
    CacheLatency = 'cache_latency',
    AuctionHealthGood = 'auction_health_good',
    AuctionHealthBad = 'auction_health_bad',
    AuctionHealthGoodXHR = 'auction_health_good_xhr',
    AuctionHealthBadXHR = 'auction_health_bad_xhr'
}

export enum MediationMetric {
    AdShow = 'ad_show',
    InitializationComplete = 'mediation_init_complete',
    LoadRequest = 'load_request',
    LoadRequestNativeMeasured = 'load_request_native_measured',
    LoadRequestFill = 'load_request_fill_time',
    LoadRequestNofill = 'load_request_nofill_time',
    LoadRequestTimeout = 'load_request_timeout',
    LoadRequestTimeoutNativeMeasured = 'load_request_timeout_native_measured',
    PlacementCount = 'placement_count',
    MediaCount = 'media_count',
    AuctionRequest = 'auction_request_time',
    AdCaching = 'ad_caching_time',
    AuctionRequestStarted = 'auction_request_start'
}

export type TimingEvent = InitializationMetric | MediationMetric | GeneralTimingMetric;

export type PTSEvent = TimingEvent | AdmobMetric | BannerMetric | CachingMetric | ChinaMetric | VastMetric | MraidMetric | MiscellaneousMetric | LoadMetric | ErrorMetric | OMMetric | AUIMetric;

export class SDKMetrics {

    private static _metricInstance: IMetricInstance;

    public static initialize(metricInstance: IMetricInstance): void {
        if (!this._metricInstance) {
            this._metricInstance = metricInstance;
        }
    }

    public static isMetricInstanceInitialized(): boolean {
        return !!this._metricInstance;
    }

    public static reportMetricEvent(event: PTSEvent): void {
        this._metricInstance.reportMetricEventWithTags(event, {});
    }

    public static reportMetricEventWithTags(event: PTSEvent, tags: { [key: string]: string }): void {
        this._metricInstance.reportMetricEventWithTags(event, tags);
    }

    public static reportTimingEvent(event: TimingEvent, value: number): void {
        this._metricInstance.reportTimingEvent(event, value);
    }

    public static reportTimingEventWithTags(event: TimingEvent, value: number, tags: { [key: string]: string }): void {
        this._metricInstance.reportTimingEventWithTags(event, value, tags);
    }

    public static sendBatchedEvents(): void {
        this._metricInstance.sendBatchedEvents();
    }
}
