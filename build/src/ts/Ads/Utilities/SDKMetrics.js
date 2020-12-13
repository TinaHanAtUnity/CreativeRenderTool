import { BufferedMetricInstance } from 'Ads/Networking/BufferedMetricInstance';
export var ErrorMetric;
(function (ErrorMetric) {
    ErrorMetric["TooLargeFile"] = "too_large_file";
    ErrorMetric["BannerRequestError"] = "banner_request_error";
    ErrorMetric["AdmobTestHttpError"] = "admob_video_http_error";
    ErrorMetric["VastClickWithoutImpressionError"] = "vast_click_without_impression";
    ErrorMetric["AdUnitAlreadyShowing"] = "ad_unit_already_showing";
    ErrorMetric["PlacementWithIdDoesNotExist"] = "placement_with_id_does_not_exist";
    ErrorMetric["CampaignExpired"] = "campaign_expired";
    ErrorMetric["NoConnectionWhenNeeded"] = "no_connection_when_needed";
    ErrorMetric["MissingTrackingUrlsOnShow"] = "missing_tracking_urls_on_show";
    ErrorMetric["AttemptToStreamCampaignWithoutConnection"] = "attempt_to_stream_campaign_without_connection";
})(ErrorMetric || (ErrorMetric = {}));
export var VideoMetric;
(function (VideoMetric) {
    VideoMetric["GenericError"] = "video_player_generic_error";
    VideoMetric["PrepareError"] = "video_player_prepare_error";
    VideoMetric["PrepareTimeout"] = "video_player_prepare_timeout";
    VideoMetric["SeekToError"] = "video_player_seek_to_error";
    VideoMetric["PauseError"] = "video_player_pause_error";
    VideoMetric["IllegalStateError"] = "video_player_illegal_state_error";
    VideoMetric["TooLongError"] = "video_too_long";
    VideoMetric["PlayerStuck"] = "video_player_stuck";
})(VideoMetric || (VideoMetric = {}));
export var AdmobMetric;
(function (AdmobMetric) {
    AdmobMetric["AdmobVideoElementMissing"] = "admob_video_element_missing";
    AdmobMetric["AdmobUsedCachedVideo"] = "admob_used_cached_video";
    AdmobMetric["AdmobUsedStreamedVideo"] = "admob_used_streamed_video";
    AdmobMetric["AdmobUserVideoSeeked"] = "admob_user_video_seeked";
    AdmobMetric["AdmobRewardedVideoStart"] = "admob_rewarded_video_start";
    AdmobMetric["AdmobUserWasRewarded"] = "admob_user_was_rewarded";
    AdmobMetric["AdmobUserSkippedRewardedVideo"] = "admob_user_skipped_rewarded_video";
    AdmobMetric["AdmobVideoCanPlay"] = "admob_video_canplay";
    AdmobMetric["AdmobVideoStarted"] = "admob_video_started";
    AdmobMetric["AdmobOMEnabled"] = "admob_om_enabled";
    AdmobMetric["AdmobOMImpression"] = "admob_om_impression";
    AdmobMetric["DoubleClickOMInjections"] = "doubleclick_om_injections";
    AdmobMetric["DoubleClickOMStarts"] = "doubleclick_om_starts";
    AdmobMetric["DoubleClickOMImpressions"] = "doubleclick_om_impressions";
    AdmobMetric["DoubleClickInstanceCreated"] = "doubleclick_om_instance_created";
    AdmobMetric["AdmobOMVideoStart"] = "admob_om_video_start";
})(AdmobMetric || (AdmobMetric = {}));
export var BannerMetric;
(function (BannerMetric) {
    BannerMetric["BannerAdLoad"] = "banner_ad_load";
    BannerMetric["BannerAdUnitLoaded"] = "banner_ad_unit_loaded";
    BannerMetric["BannerAdRequest"] = "banner_ad_request";
    BannerMetric["BannerAdImpression"] = "banner_ad_impression";
    BannerMetric["BannerAdFill"] = "banner_ad_fill";
    BannerMetric["BannerAdNoFill"] = "banner_ad_no_fill";
    BannerMetric["BannerAdRequestWithLimitedAdTracking"] = "banner_ad_request_with_limited_ad_tracking";
})(BannerMetric || (BannerMetric = {}));
export var CachingMetric;
(function (CachingMetric) {
    CachingMetric["CachingModeForcedToDisabled"] = "caching_mode_forced_to_disabled"; // Occurs when user has less than 20mb of freespace in cache directory
})(CachingMetric || (CachingMetric = {}));
export var ChinaMetric;
(function (ChinaMetric) {
    ChinaMetric["ChineseUserInitialized"] = "chinese_user_intialized";
    ChinaMetric["ChineseUserIdentifiedCorrectlyByNetworkOperator"] = "chinese_user_identified_correctly_by_network_operator";
    ChinaMetric["ChineseUserIdentifiedIncorrectlyByNetworkOperator"] = "chinese_user_identified_incorrectly_by_network_operator";
    ChinaMetric["ChineseUserIdentifiedCorrectlyByLocale"] = "chinese_user_identified_correctly_by_locale";
    ChinaMetric["ChineseUserIdentifiedIncorrectlyByLocale"] = "chinese_user_identified_incorrectly_by_locale";
})(ChinaMetric || (ChinaMetric = {}));
export var VastMetric;
(function (VastMetric) {
    VastMetric["VastVideoImpressionFailed"] = "vast_video_impression_failed";
    VastMetric["VastHTMLEndcardShown"] = "vast_html_endcard_shown";
    VastMetric["VastHTMLEndcardShownFailed"] = "vast_html_endcard_shown_failed";
})(VastMetric || (VastMetric = {}));
export var MiscellaneousMetric;
(function (MiscellaneousMetric) {
    MiscellaneousMetric["ImpressionDuplicate"] = "impression_duplicate";
    MiscellaneousMetric["ImpressionDuplicateNonBatching"] = "impression_duplicate_non_batching";
    MiscellaneousMetric["CampaignNotFound"] = "campaign_not_found";
    MiscellaneousMetric["ConsentParagraphLinkClicked"] = "consent_paragraph_link_clicked";
    MiscellaneousMetric["CampaignAttemptedShowInBackground"] = "ad_attempted_show_background";
    MiscellaneousMetric["IOSDeleteStoredGamerToken"] = "ios_delete_stored_gamer_token";
    MiscellaneousMetric["XHRNotAvailable"] = "xhr_not_available";
    MiscellaneousMetric["AuctionRequestFailed"] = "auction_request_failed";
    MiscellaneousMetric["AuctionRequestOk"] = "auction_request_ok";
    MiscellaneousMetric["AuctionRequestCreated"] = "auction_request_created";
    MiscellaneousMetric["GAIDInvestigation"] = "gaid_investigation";
})(MiscellaneousMetric || (MiscellaneousMetric = {}));
export var LoadMetric;
(function (LoadMetric) {
    LoadMetric["LoadEnabledAuctionRequest"] = "load_enabled_auction_request";
    LoadMetric["LoadEnabledFill"] = "load_enabled_fill";
    LoadMetric["LoadEnabledNoFill"] = "load_enabled_no_fill";
    LoadMetric["LoadEnabledShow"] = "load_enabled_show";
    LoadMetric["LoadEnabledInitializationSuccess"] = "load_enabled_initialization_success";
    LoadMetric["LoadEnabledInitializationFailure"] = "load_enabled_initialization_failure";
    LoadMetric["LoadAuctionRequestBlocked"] = "load_auction_request_blocked";
    LoadMetric["LoadCometRefreshRequest"] = "load_comet_refresh_request";
    LoadMetric["LoadCometRefreshFill"] = "load_comet_refresh_fill";
    LoadMetric["LoadCometRefreshNoFill"] = "load_comet_refresh_no_fill";
    LoadMetric["LoadProgrammaticRefreshRequest"] = "load_programmatic_refresh_request";
    LoadMetric["LoadProgrammaticFill"] = "load_programmatic_fill";
    LoadMetric["LoadProgrammaticUsedPreviousFill"] = "load_programmatic_used_previous_fill";
})(LoadMetric || (LoadMetric = {}));
export var OMMetric;
(function (OMMetric) {
    OMMetric["IASVASTVerificationParsed"] = "ias_vast_verification_parsed";
    OMMetric["IASNestedVastTagHackApplied"] = "ias_nested_vast_tag_hack_applied";
    OMMetric["IASVerificatonInjected"] = "ias_verification_injected";
    OMMetric["IASVerificationSessionStarted"] = "ias_verification_session_started";
    OMMetric["IASVerificationSessionFinished"] = "ias_verification_session_finished";
    OMMetric["IASVerificatonInjectionFailed"] = "ias_verification_injection_failed";
    OMMetric["OMEnabledLiftOff"] = "om_enabled_liftoff";
    OMMetric["OMInjectionFailure"] = "om_injection_failure";
})(OMMetric || (OMMetric = {}));
export var InitializationMetric;
(function (InitializationMetric) {
    InitializationMetric["NativeInitialization"] = "native_init";
    InitializationMetric["WebviewInitialization"] = "webview_init";
    InitializationMetric["WebviewInitializationPhases"] = "webview_init_phases";
    InitializationMetric["WebviewLoad"] = "webview_load";
})(InitializationMetric || (InitializationMetric = {}));
export var MraidMetric;
(function (MraidMetric) {
    MraidMetric["UseCustomCloseCalled"] = "mraid_use_custom_close_called";
    MraidMetric["CloseMovedToLeft"] = "mraid_close_graphic_moved_to_left";
    MraidMetric["CloseHidden"] = "mraid_close_graphic_hidden";
    MraidMetric["ClosedByAdUnit"] = "mraid_closed_by_ad_unit";
    MraidMetric["ClosedByUnityAds"] = "mraid_closed_by_unity_ads";
})(MraidMetric || (MraidMetric = {}));
export var AUIMetric;
(function (AUIMetric) {
    AUIMetric["CampaignCategoryAlreadyActive"] = "campaign_category_already_active";
    AUIMetric["CampaignCategoryInactive"] = "campaign_category_inactive";
    AUIMetric["CampaignInitializationError"] = "automated_experiment_manager_initialization_error";
    AUIMetric["FailedToCollectStaticFeatures"] = "FailedToCollectStaticFeatures";
    AUIMetric["FailedToCollectDeviceFeatures"] = "failed_to_collect_device_features";
    AUIMetric["FailedToFetchAutomatedExperiements"] = "failed_to_fetch_automated_experiments";
    AUIMetric["FailedToParseExperimentResponse"] = "failed_to_parse_automated_experiments_response";
    AUIMetric["FailedToPublishOutcome"] = "failed_to_publish_experiment_outcome";
    AUIMetric["InvalidEndscreenAnimation"] = "invalid_endscreen_animation";
    AUIMetric["OptimizationResponseApplied"] = "campaign_optimization_response_applied";
    AUIMetric["AutomatedExperimentManagerInitializationError"] = "automated_experiment_manager_initialization_error";
    AUIMetric["DecisionNotReady"] = "decision_not_ready";
    AUIMetric["InvalidEndscreenColorTintSwitches"] = "invalid_endscreen_color_tint_switches";
    AUIMetric["InvalidEndscreenColorTintTheme"] = "invalid_endscreen_color_tint_theme";
    AUIMetric["EndscreenColorTintError"] = "endscreen_color_tint_error";
    AUIMetric["EndscreenColorTintThemingFailed"] = "endscreen_color_tint_theming_failed";
    AUIMetric["OptimizationResponseIgnored"] = "campaign_optimization_response_ignored";
    AUIMetric["RequestingCampaignOptimization"] = "requesting_campaign_optimization";
    AUIMetric["UnknownExperimentName"] = "unknown_experiment_name";
    AUIMetric["UnknownCategoryProvided"] = "unknown_automated_experiment_category_provided";
    AUIMetric["InvalidImageAssets"] = "invalid_image_assets";
    AUIMetric["InvalidCtaText"] = "invalid_cta_text";
    AUIMetric["InvalidSchemeAndColorCoordination"] = "invalid_scheme_and_color_coordination";
    AUIMetric["ColorMatchingNotSupported"] = "color_matching_not_supported";
    AUIMetric["TiltedLayoutNotSupported"] = "tilted_layout_not_supported";
})(AUIMetric || (AUIMetric = {}));
export var ExternalEndScreenMetric;
(function (ExternalEndScreenMetric) {
    ExternalEndScreenMetric["GameIconImageMissing"] = "external_end_screen_game_icon_missing";
    ExternalEndScreenMetric["ImageMissing"] = "external_end_screen_image_missing";
    ExternalEndScreenMetric["UnableToGetDataUrl"] = "external_end_screen_image_unable_to_get_data_url";
    ExternalEndScreenMetric["NotReadyInTime"] = "external_end_screen_not_ready_in_time";
    ExternalEndScreenMetric["StartInitIframe"] = "external_end_screen_start_init_iframe";
    ExternalEndScreenMetric["ShowIframe"] = "external_end_screen_show_iframe";
    ExternalEndScreenMetric["UseOriginalUrl"] = "external_end_screen_use_original_url";
    ExternalEndScreenMetric["DefaultRouteUsed"] = "external_end_screen_default_route_used";
    ExternalEndScreenMetric["AutoCloseInvoked"] = "external_end_screen_auto_close_invoked";
    ExternalEndScreenMetric["BadIframeContent"] = "external_end_screen_iframe_bad_content";
})(ExternalEndScreenMetric || (ExternalEndScreenMetric = {}));
export var ExternalMRAIDEndScreenMetric;
(function (ExternalMRAIDEndScreenMetric) {
    ExternalMRAIDEndScreenMetric["Initialize"] = "external_mraid_end_screen_initialize";
    ExternalMRAIDEndScreenMetric["IframeInitialize"] = "external_mraid_end_screen_iframe_initialize";
    ExternalMRAIDEndScreenMetric["CreateMRAID"] = "external_mraid_end_screen_create_mraid";
    ExternalMRAIDEndScreenMetric["Show"] = "external_mraid_end_screen_show";
    ExternalMRAIDEndScreenMetric["Hide"] = "external_mraid_end_screen_hide";
    ExternalMRAIDEndScreenMetric["Close"] = "external_mraid_end_screen_close";
    ExternalMRAIDEndScreenMetric["Click"] = "external_mraid_end_screen_click";
    ExternalMRAIDEndScreenMetric["ShowNotReady"] = "external_mraid_end_screen_show_not_ready";
    ExternalMRAIDEndScreenMetric["MRAIDEventBridgeReady"] = "external_mraid_end_screen_mraid_event_bridge_ready";
    ExternalMRAIDEndScreenMetric["MRAIDEventBridgeLoaded"] = "external_mraid_end_screen_mraid_event_bridge_loaded";
    ExternalMRAIDEndScreenMetric["FetchMRAID"] = "external_mraid_end_screen_fetch_mraid";
    ExternalMRAIDEndScreenMetric["MRAIDFailed"] = "external_mraid_end_screen_mraid_failed";
    ExternalMRAIDEndScreenMetric["MRAIDWarning"] = "external_mraid_end_screen_mraid_warning";
    ExternalMRAIDEndScreenMetric["UnknownMRAIDEvent"] = "external_mraid_end_screen_unknown_mraid_event";
    ExternalMRAIDEndScreenMetric["GDPR"] = "external_mraid_end_screen_gdpr";
})(ExternalMRAIDEndScreenMetric || (ExternalMRAIDEndScreenMetric = {}));
export var GeneralTimingMetric;
(function (GeneralTimingMetric) {
    GeneralTimingMetric["AuctionRequest"] = "auction_request";
    GeneralTimingMetric["AuctionHealthGood"] = "auction_health_good";
    GeneralTimingMetric["AuctionHealthBad"] = "auction_health_bad";
    GeneralTimingMetric["AuctionHealthGoodXHR"] = "auction_health_good_xhr";
    GeneralTimingMetric["AuctionHealthBadXHR"] = "auction_health_bad_xhr";
    GeneralTimingMetric["CacheSpeed"] = "cache_speed";
})(GeneralTimingMetric || (GeneralTimingMetric = {}));
export var MediationMetric;
(function (MediationMetric) {
    MediationMetric["AdShow"] = "ad_show";
    MediationMetric["InitializationComplete"] = "mediation_init_complete";
    MediationMetric["LoadRequest"] = "load_request";
    MediationMetric["LoadRequestNativeMeasured"] = "load_request_native_measured";
    MediationMetric["LoadRequestFill"] = "load_request_fill_time";
    MediationMetric["LoadRequestNofill"] = "load_request_nofill_time";
    MediationMetric["LoadRequestTimeout"] = "load_request_timeout";
    MediationMetric["LoadRequestTimeoutNativeMeasured"] = "load_request_timeout_native_measured";
    MediationMetric["PlacementCount"] = "placement_count";
    MediationMetric["MediaCount"] = "media_count";
    MediationMetric["AuctionRequest"] = "auction_request_time";
    MediationMetric["AdCaching"] = "ad_caching_time";
    MediationMetric["AuctionRequestStarted"] = "auction_request_start";
    MediationMetric["FillLatencyByPlacements"] = "fill_latency_by_placements";
    MediationMetric["NofillLatencyByPlacements"] = "nofill_latency_by_placements";
    MediationMetric["InitCompleteByPlacements"] = "mediation_init_complete_by_placements";
})(MediationMetric || (MediationMetric = {}));
export var LoadV5;
(function (LoadV5) {
    LoadV5["PreloadRequestFailed"] = "v5_preload_request_failed";
    LoadV5["PreloadRequestParsingResponse"] = "v5_preload_request_parsing_response";
    LoadV5["PreloadRequestStarted"] = "v5_preload_request_started";
    LoadV5["PreloadRequestAlreadyActive"] = "v5_preload_request_already_active";
    LoadV5["LoadRequestStarted"] = "v5_load_request_started";
    LoadV5["LoadRequestParsingResponse"] = "v5_load_request_parsing_response";
    LoadV5["LoadRequestFailed"] = "v5_load_request_failed";
    LoadV5["LoadRequestFrequencyCap"] = "v5_load_request_frequency_cap";
    LoadV5["LoadRequestWasCanceled"] = "v5_load_request_was_canceled";
    LoadV5["LoadRequestFill"] = "v5_load_request_fill";
    LoadV5["LoadRequestParseCampaignFailed"] = "v5_load_request_parse_campaign_failed";
    LoadV5["ReloadRequestFailed"] = "v5_reload_request_failed";
    LoadV5["ReloadRequestParsingResponse"] = "v5_reload_request_parsing_response";
    LoadV5["ReloadRequestStarted"] = "v5_reload_request_started";
    LoadV5["ReloadRequestParseCampaignFailed"] = "v5_reload_request_parse_campaign_failed";
    LoadV5["RefreshManagerCampaignExpired"] = "v5_refresh_manager_campaign_expired";
    LoadV5["RefreshManagerCampaignFailedToInvalidate"] = "v5_refresh_manager_campaign_failed_to_be_invalidate";
    LoadV5["Show"] = "v5_show";
    LoadV5["PlacementInvalidationPending"] = "placement_invalidation_pending";
    LoadV5["RefreshManagerForcedToInvalidate"] = "v5_refresh_manager_forced_to_invalidate";
})(LoadV5 || (LoadV5 = {}));
export var AuctionV6;
(function (AuctionV6) {
    AuctionV6["FailedToParse"] = "v6_failed_to_parse";
    AuctionV6["AuctionIdMissing"] = "v6_auction_id_missing";
    AuctionV6["PlacementsMissing"] = "v6_placements_missing";
    AuctionV6["TrackingIndicesOutOfBounds"] = "v6_tracking_indices_out_of_bounds";
    AuctionV6["FailedCreatingAuctionResponse"] = "v6_failed_creating_auction_response";
})(AuctionV6 || (AuctionV6 = {}));
export var ChinaAucionEndpoint;
(function (ChinaAucionEndpoint) {
    ChinaAucionEndpoint["AuctionRequest"] = "china_user_auction_request";
    ChinaAucionEndpoint["AuctionResponse"] = "china_user_auction_response";
})(ChinaAucionEndpoint || (ChinaAucionEndpoint = {}));
export var InitializationFailureMetric;
(function (InitializationFailureMetric) {
    InitializationFailureMetric["InitializeFailed"] = "webview_fail_to_initialize";
})(InitializationFailureMetric || (InitializationFailureMetric = {}));
export var VideoLengthMetric;
(function (VideoLengthMetric) {
    VideoLengthMetric["LengthOverreported"] = "dsp_video_length_overreported";
    VideoLengthMetric["LengthUnderreported"] = "dsp_video_length_underreported";
})(VideoLengthMetric || (VideoLengthMetric = {}));
export var MraidWebplayerMetric;
(function (MraidWebplayerMetric) {
    MraidWebplayerMetric["MraidClickSent"] = "mraid_ad_clicked";
    MraidWebplayerMetric["MraidClickReceived"] = "mraid_click_received";
})(MraidWebplayerMetric || (MraidWebplayerMetric = {}));
export class SDKMetrics {
    static initialize() {
        this._metricInstance = new BufferedMetricInstance();
    }
    static setMetricInstance(metricInstance) {
        if (this._metricInstance instanceof BufferedMetricInstance) {
            this._metricInstance.forwardTo(metricInstance);
        }
        this._metricInstance = metricInstance;
    }
    static reportMetricEvent(event) {
        this._metricInstance.reportMetricEventWithTags(event, {});
    }
    static reportMetricEventWithTags(event, tags) {
        this._metricInstance.reportMetricEventWithTags(event, tags);
    }
    static reportTimingEvent(event, value) {
        this._metricInstance.reportTimingEvent(event, value);
    }
    static reportTimingEventWithTags(event, value, tags) {
        this._metricInstance.reportTimingEventWithTags(event, value, tags);
    }
    static sendBatchedEvents() {
        this._metricInstance.sendBatchedEvents();
    }
}
// Setting a default value since legacy tests are relying on it.
SDKMetrics._metricInstance = new BufferedMetricInstance();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0RLTWV0cmljcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL1NES01ldHJpY3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFL0UsTUFBTSxDQUFOLElBQVksV0FXWDtBQVhELFdBQVksV0FBVztJQUNuQiw4Q0FBK0IsQ0FBQTtJQUMvQiwwREFBMkMsQ0FBQTtJQUMzQyw0REFBNkMsQ0FBQTtJQUM3QyxnRkFBaUUsQ0FBQTtJQUNqRSwrREFBZ0QsQ0FBQTtJQUNoRCwrRUFBZ0UsQ0FBQTtJQUNoRSxtREFBb0MsQ0FBQTtJQUNwQyxtRUFBb0QsQ0FBQTtJQUNwRCwwRUFBMkQsQ0FBQTtJQUMzRCx5R0FBMEYsQ0FBQTtBQUM5RixDQUFDLEVBWFcsV0FBVyxLQUFYLFdBQVcsUUFXdEI7QUFFRCxNQUFNLENBQU4sSUFBWSxXQVNYO0FBVEQsV0FBWSxXQUFXO0lBQ25CLDBEQUEyQyxDQUFBO0lBQzNDLDBEQUEyQyxDQUFBO0lBQzNDLDhEQUErQyxDQUFBO0lBQy9DLHlEQUEwQyxDQUFBO0lBQzFDLHNEQUF1QyxDQUFBO0lBQ3ZDLHFFQUFzRCxDQUFBO0lBQ3RELDhDQUErQixDQUFBO0lBQy9CLGlEQUFrQyxDQUFBO0FBQ3RDLENBQUMsRUFUVyxXQUFXLEtBQVgsV0FBVyxRQVN0QjtBQUVELE1BQU0sQ0FBTixJQUFZLFdBaUJYO0FBakJELFdBQVksV0FBVztJQUNuQix1RUFBd0QsQ0FBQTtJQUN4RCwrREFBZ0QsQ0FBQTtJQUNoRCxtRUFBb0QsQ0FBQTtJQUNwRCwrREFBZ0QsQ0FBQTtJQUNoRCxxRUFBc0QsQ0FBQTtJQUN0RCwrREFBZ0QsQ0FBQTtJQUNoRCxrRkFBbUUsQ0FBQTtJQUNuRSx3REFBeUMsQ0FBQTtJQUN6Qyx3REFBeUMsQ0FBQTtJQUN6QyxrREFBbUMsQ0FBQTtJQUNuQyx3REFBeUMsQ0FB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