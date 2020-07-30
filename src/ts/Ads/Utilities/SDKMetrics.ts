import { IMetricInstance } from 'Ads/Networking/MetricInstance';
import { BufferedMetricInstance } from 'Ads/Networking/BufferedMetricInstance';

export enum ErrorMetric {
    TooLargeFile = 'too_large_file', // a file 20mb and over are considered too large
    BannerRequestError = 'banner_request_error',
    AdmobTestHttpError = 'admob_video_http_error',
    VastClickWithoutImpressionError = 'vast_click_without_impression',
    AdUnitAlreadyShowing = 'ad_unit_already_showing',
    PlacementWithIdDoesNotExist = 'placement_with_id_does_not_exist',
    CampaignExpired = 'campaign_expired',
    NoConnectionWhenNeeded = 'no_connection_when_needed',
    MissingTrackingUrlsOnShow = 'missing_tracking_urls_on_show',
    AttemptToStreamCampaignWithoutConnection = 'attempt_to_stream_campaign_without_connection'
}

export enum VideoMetric {
    GenericError = 'video_player_generic_error',
    PrepareError = 'video_player_prepare_error',
    PrepareTimeout = 'video_player_prepare_timeout',
    SeekToError = 'video_player_seek_to_error',
    PauseError = 'video_player_pause_error',
    IllegalStateError = 'video_player_illegal_state_error',
    TooLongError = 'video_too_long',
    PlayerStuck = 'video_player_stuck'
}

export enum AdmobMetric {
    AdmobVideoElementMissing = 'admob_video_element_missing',
    AdmobUsedCachedVideo = 'admob_used_cached_video',
    AdmobUsedStreamedVideo = 'admob_used_streamed_video',
    AdmobUserVideoSeeked = 'admob_user_video_seeked',
    AdmobRewardedVideoStart = 'admob_rewarded_video_start',
    AdmobUserWasRewarded = 'admob_user_was_rewarded',
    AdmobUserSkippedRewardedVideo = 'admob_user_skipped_rewarded_video',
    AdmobVideoCanPlay = 'admob_video_canplay',
    AdmobVideoStarted = 'admob_video_started',
    AdmobOMEnabled = 'admob_om_enabled',
    AdmobOMImpression = 'admob_om_impression',
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
    VastVideoImpressionFailed = 'vast_video_impression_failed',
    VastHTMLEndcardShown = 'vast_html_endcard_shown',
    VastHTMLEndcardShownFailed = 'vast_html_endcard_shown_failed'
}

export enum MiscellaneousMetric {
    ImpressionDuplicate = 'impression_duplicate',
    ImpressionDuplicateNonBatching = 'impression_duplicate_non_batching',
    CampaignNotFound = 'campaign_not_found',
    ConsentParagraphLinkClicked = 'consent_paragraph_link_clicked',
    CampaignAttemptedShowInBackground = 'ad_attempted_show_background',
    IOSDeleteStoredGamerToken = 'ios_delete_stored_gamer_token',
    XHRNotAvailable = 'xhr_not_available',
    AuctionRequestFailed = 'auction_request_failed',
    AuctionRequestOk = 'auction_request_ok',
    AuctionRequestCreated = 'auction_request_created',
    GAIDInvestigation = 'gaid_investigation'
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
    CampaignCategoryAlreadyActive = 'campaign_category_already_active',
    CampaignCategoryInactive = 'campaign_category_inactive',
    CampaignInitializationError = 'automated_experiment_manager_initialization_error',
    FailedToCollectStaticFeatures = 'FailedToCollectStaticFeatures',
    FailedToCollectDeviceFeatures = 'failed_to_collect_device_features',
    FailedToFetchAutomatedExperiements = 'failed_to_fetch_automated_experiments',
    FailedToParseExperimentResponse = 'failed_to_parse_automated_experiments_response',
    FailedToPublishOutcome = 'failed_to_publish_experiment_outcome',
    InvalidEndscreenAnimation = 'invalid_endscreen_animation',
    OptimizationResponseApplied = 'campaign_optimization_response_applied',
    AutomatedExperimentManagerInitializationError = 'automated_experiment_manager_initialization_error',
    DecisionNotReady = 'decision_not_ready',
    InvalidEndscreenColorTintSwitches = 'invalid_endscreen_color_tint_switches',
    InvalidEndscreenColorTintTheme = 'invalid_endscreen_color_tint_theme',
    EndscreenColorTintError = 'endscreen_color_tint_error',
    EndscreenColorTintThemingFailed = 'endscreen_color_tint_theming_failed',
    OptimizationResponseIgnored = 'campaign_optimization_response_ignored',
    RequestingCampaignOptimization = 'requesting_campaign_optimization',
    UnknownExperimentName = 'unknown_experiment_name',
    UnknownCategoryProvided = 'unknown_automated_experiment_category_provided',
    InvalidImageAssets = 'invalid_image_assets',
    InvalidCtaText = 'invalid_cta_text',
    InvalidSchemeAndColorCoordination = 'invalid_scheme_and_color_coordination',
    ColorMatchingNotSupported = 'color_matching_not_supported',
    TiltedLayoutNotSupported = 'tilted_layout_not_supported'
}

export enum ExternalEndScreenMetric {
    IframeTimeout = 'external_end_screen_iframe_timeout',
    GameIconImageMissing = 'external_end_screen_game_icon_missing',
    ImageMissing = 'external_end_screen_image_missing',
    UnableToGetDataUrl = 'external_end_screen_image_unable_to_get_data_url'
}

export enum GeneralTimingMetric {
    AuctionRequest = 'auction_request',
    AuctionHealthGood = 'auction_health_good',
    AuctionHealthBad = 'auction_health_bad',
    AuctionHealthGoodXHR = 'auction_health_good_xhr',
    AuctionHealthBadXHR = 'auction_health_bad_xhr',
    CacheSpeed = 'cache_speed'
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
    AuctionRequestStarted = 'auction_request_start',
    FillLatencyByPlacements = 'fill_latency_by_placements',
    NofillLatencyByPlacements = 'nofill_latency_by_placements',
    InitCompleteByPlacements = 'mediation_init_complete_by_placements'
}

export enum LoadV5 {
    PreloadRequestFailed = 'v5_preload_request_failed',
    PreloadRequestParsingResponse = 'v5_preload_request_parsing_response',
    PreloadRequestStarted = 'v5_preload_request_started',
    PreloadRequestAlreadyActive = 'v5_preload_request_already_active',
    LoadRequestStarted = 'v5_load_request_started',
    LoadRequestParsingResponse = 'v5_load_request_parsing_response',
    LoadRequestFailed = 'v5_load_request_failed',
    LoadRequestWasCanceled = 'v5_load_request_was_canceled',
    LoadRequestFill = 'v5_load_request_fill',
    LoadRequestParseCampaignFailed = 'v5_load_request_parse_campaign_failed',
    ReloadRequestFailed = 'v5_reload_request_failed',
    ReloadRequestParsingResponse = 'v5_reload_request_parsing_response',
    ReloadRequestStarted = 'v5_reload_request_started',
    ReloadRequestParseCampaignFailed = 'v5_reload_request_parse_campaign_failed',
    RefreshManagerCampaignExpired = 'v5_refresh_manager_campaign_expired',
    RefreshManagerCampaignFailedToInvalidate = 'v5_refresh_manager_campaign_failed_to_be_invalidate',
    Show = 'v5_show',
    PlacementInvalidationPending = 'placement_invalidation_pending',
    RefreshManagerForcedToInvalidate = 'v5_refresh_manager_forced_to_invalidate'
}

export enum AuctionV6 {
    FailedToParse = 'v6_failed_to_parse',
    AuctionIdMissing = 'v6_auction_id_missing',
    PlacementsMissing = 'v6_placements_missing',
    TrackingIndicesOutOfBounds = 'v6_tracking_indices_out_of_bounds',
    FailedCreatingAuctionResponse = 'v6_failed_creating_auction_response'
}

export enum ChinaAucionEndpoint {
    AuctionRequest = 'china_user_auction_request',
    AuctionResponse = 'china_user_auction_response'
}

export enum InitializationFailureMetric {
    InitializeFailed = 'webview_fail_to_initialize'
}

export type TimingEvent = InitializationMetric | MediationMetric | GeneralTimingMetric | ChinaAucionEndpoint;

export type PTSEvent = VideoMetric | TimingEvent | AuctionV6 | AdmobMetric | BannerMetric | CachingMetric | ChinaMetric | VastMetric | MraidMetric | MiscellaneousMetric | LoadMetric | ErrorMetric | OMMetric | AUIMetric | LoadV5 | ChinaAucionEndpoint | ExternalEndScreenMetric | InitializationFailureMetric;

export class SDKMetrics {

    // Setting a default value since legacy tests are relying on it.
    private static _metricInstance: IMetricInstance = new BufferedMetricInstance();

    public static initialize(): void {
        this._metricInstance = new BufferedMetricInstance();
    }

    public static setMetricInstance(metricInstance: IMetricInstance): void {
        if (this._metricInstance instanceof BufferedMetricInstance) {
            this._metricInstance.forwardTo(metricInstance);
        }
        this._metricInstance = metricInstance;
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
