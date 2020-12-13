import { AdMob } from 'AdMob/AdMob';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { AdsPropertiesApi } from 'Ads/Native/AdsProperties';
import { AndroidAdUnitApi } from 'Ads/Native/Android/AdUnit';
import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosAdUnitApi } from 'Ads/Native/iOS/AdUnit';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { ListenerApi } from 'Ads/Native/Listener';
import { PausableListenerApi } from 'Ads/Native/PausableListener';
import { PlacementApi } from 'Ads/Native/Placement';
import { VideoPlayerApi } from 'Ads/Native/VideoPlayer';
import { WebPlayerApi } from 'Ads/Native/WebPlayer';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { ChinaMetric, ErrorMetric, MiscellaneousMetric, LoadMetric, SDKMetrics, InitializationMetric, GeneralTimingMetric, LoadV5 as LoadV5Metrics } from 'Ads/Utilities/SDKMetrics';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { BannerModule } from 'Banners/BannerModule';
import { AuctionRequest } from 'Ads/Networking/AuctionRequest';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CallbackStatus } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import { Display } from 'Display/Display';
import { Monetization } from 'Monetization/Monetization';
import { MRAID } from 'MRAID/MRAID';
import { MRAIDView } from 'MRAID/Views/MRAIDView';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Performance } from 'Performance/Performance';
import { VAST } from 'VAST/VAST';
import { VPAID } from 'VPAID/VPAID';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { XPromo } from 'XPromo/XPromo';
import { AR } from 'AR/AR';
import CreativeUrlResponseAndroid from 'json/CreativeUrlResponseAndroid.json';
import CreativeUrlResponseIos from 'json/CreativeUrlResponseIos.json';
import { CampaignResponseUtils } from 'Ads/Utilities/CampaignResponseUtils';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { PermissionsUtil, PermissionTypes } from 'Core/Utilities/Permissions';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PrivacyUnit } from 'Ads/AdUnits/PrivacyUnit';
import { Store } from 'Store/Store';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { LoadApi } from 'Core/Native/LoadApi';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { Analytics } from 'Analytics/Analytics';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Promises } from 'Core/Utilities/Promises';
import { LoadV5, LoadV5NoInvalidation, LoadV5AuctionV6 } from 'Core/Models/ABGroup';
import { PrivacyMetrics } from 'Privacy/PrivacyMetrics';
import { PrivacySDKUnit } from 'Ads/AdUnits/PrivacySDKUnit';
import { PerPlacementLoadAdapter } from 'Ads/Managers/PerPlacementLoadAdapter';
import { PrivacyDataRequestHelper } from 'Privacy/PrivacyDataRequestHelper';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';
import { MediationLoadTrackingManager, MediationExperimentType } from 'Ads/Managers/MediationLoadTrackingManager';
import { createStopwatch } from 'Core/Utilities/Stopwatch';
import { XHRequest } from 'Core/Utilities/XHRequest';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
import { MetaData } from 'Core/Utilities/MetaData';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { AdRequestManager, LoadV5ExperimentType } from 'Ads/Managers/AdRequestManager';
import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { PerPlacementLoadManagerV5NoInvalidation } from 'Ads/Managers/PerPlacementLoadManagerV5NoInvalidation';
import { LoadAndFillEventManager } from 'Ads/Managers/LoadAndFillEventManager';
import { FrameworkMetaData } from 'Core/Models/MetaData/FrameworkMetaData';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { AdRequestManagerV6 } from 'Ads/Managers/AdRequestManagerV6';
export class Ads {
    constructor(config, core) {
        this._showing = false;
        this._showingPrivacy = false;
        this._loadApiEnabled = false;
        this._webViewEnabledLoad = false;
        this._forceLoadV5 = false;
        this.PrivacySDK = PrivacyParser.parse(config, core.ClientInfo, core.DeviceInfo);
        this.Config = AdsConfigurationParser.parse(config);
        this._core = core;
        this.Analytics = new Analytics(core, this.PrivacySDK);
        this.Store = new Store(core, this.Analytics.AnalyticsManager);
        const platform = core.NativeBridge.getPlatform();
        this.Api = {
            AdsProperties: new AdsPropertiesApi(core.NativeBridge),
            Listener: CustomFeatures.pauseEventsSupported(core.ClientInfo.getGameId()) ? new PausableListenerApi(core.NativeBridge) : new ListenerApi(core.NativeBridge),
            Placement: new PlacementApi(core.NativeBridge),
            VideoPlayer: new VideoPlayerApi(core.NativeBridge),
            WebPlayer: new WebPlayerApi(core.NativeBridge),
            Android: platform === Platform.ANDROID ? {
                AdUnit: new AndroidAdUnitApi(core.NativeBridge),
                VideoPlayer: new AndroidVideoPlayerApi(core.NativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
                AdUnit: new IosAdUnitApi(core.NativeBridge),
                VideoPlayer: new IosVideoPlayerApi(core.NativeBridge)
            } : undefined,
            LoadApi: new LoadApi(core.NativeBridge)
        };
        this.AdMobSignalFactory = new AdMobSignalFactory(this._core.NativeBridge.getPlatform(), this._core.Api, this.Api, this._core.ClientInfo, this._core.DeviceInfo, this._core.FocusManager);
        this.InterstitialWebPlayerContainer = new InterstitialWebPlayerContainer(this._core.NativeBridge.getPlatform(), this.Api);
        if (this._core.NativeBridge.getPlatform() === Platform.ANDROID) {
            document.body.classList.add('android');
            this.Container = new Activity(this._core.Api, this.Api, this._core.DeviceInfo);
        }
        else if (this._core.NativeBridge.getPlatform() === Platform.IOS) {
            const model = this._core.DeviceInfo.getModel();
            if (model.match(/iphone/i) || model.match(/ipod/i)) {
                document.body.classList.add('iphone');
            }
            else if (model.match(/ipad/i)) {
                document.body.classList.add('ipad');
            }
            this.Container = new ViewController(this._core.Api, this.Api, this._core.DeviceInfo, this._core.FocusManager, this._core.ClientInfo);
        }
        this.SessionManager = new SessionManager(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this.MissedImpressionManager = new MissedImpressionManager(this._core.Api);
        this.ContentTypeHandlerManager = new ContentTypeHandlerManager();
        this.ThirdPartyEventManagerFactory = new ThirdPartyEventManagerFactory(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this._automatedExperimentManager = new AutomatedExperimentManager();
    }
    initialize() {
        const measurements = createStopwatch();
        return Promise.resolve().then(() => {
            SdkStats.setInitTimestamp();
            GameSessionCounters.init();
            return this.setupTestEnvironment();
        }).then(() => {
            this.setupPrivacyTestEnvironment();
        }).then(() => {
            this.setupLoadApiEnabled();
        }).then(() => {
            return this.Analytics.initialize();
        }).then((gameSessionId) => {
            this.SessionManager.setGameSessionId(gameSessionId);
            this.PrivacyManager = new UserPrivacyManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Config, this._core.ClientInfo, this._core.DeviceInfo, this._core.RequestManager, this.PrivacySDK);
            this.PlacementManager = new PlacementManager(this.Api, this.Config);
            PrivacyMetrics.setGameSessionId(gameSessionId);
            PrivacyMetrics.setPrivacy(this.PrivacySDK);
            PrivacyMetrics.setAbGroup(this._core.Config.getAbGroup());
            PrivacyMetrics.setSubdivision(this._core.Config.getSubdivision());
            PrivacyDataRequestHelper.init(this._core, this.PrivacyManager, this.PrivacySDK);
        }).then(() => {
            return this.setupMediationTrackingManager();
        }).then(() => {
            return this.configureLoadAndFillEventManager();
        }).then(() => {
            return this.PrivacyManager.getConsentAndUpdateConfiguration().catch(() => {
                // do nothing since it's normal to have undefined developer consent
            });
        }).then(() => {
            const defaultPlacement = this.Config.getDefaultPlacement();
            this.Api.Placement.setDefaultPlacement(defaultPlacement.getId());
            this.AssetManager = new AssetManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.CacheManager, this.Config.getCacheMode(), this._core.DeviceInfo, this._core.CacheBookkeeping);
            if (this.SessionManager.getGameSessionId() % 10000 === 0) {
                this.AssetManager.setCacheDiagnostics(true);
            }
            this.BannerModule = new BannerModule(this._core, this);
            this.Monetization = new Monetization(this._core, this);
            this.AR = new AR(this._core);
            if (this.SessionManager.getGameSessionId() % 1000 === 0) {
                Promise.all([
                    ARUtil.isARSupported(this.AR.Api),
                    PermissionsUtil.checkPermissionInManifest(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA),
                    PermissionsUtil.checkPermissions(this._core.NativeBridge.getPlatform(), this._core.Api, PermissionTypes.CAMERA)
                ]).then(([arSupported, permissionInManifest, permissionResult]) => {
                    Diagnostics.trigger('ar_device_support', { arSupported, permissionInManifest, permissionResult });
                }).catch((error) => {
                    Diagnostics.trigger('ar_device_support_check_error', error);
                });
            }
            this.logChinaMetrics();
            const parserModules = [
                new AdMob(this._core, this),
                new Display(this._core, this),
                new MRAID(this.AR.Api, this._core, this._automatedExperimentManager, this),
                new Performance(this.AR.Api, this._core, this._automatedExperimentManager, this),
                new VAST(this._core, this),
                new VPAID(this._core, this),
                new XPromo(this._core, this)
            ];
            parserModules.forEach(module => {
                const contentTypeHandlerMap = module.getContentTypeHandlerMap();
                for (const contentType in contentTypeHandlerMap) {
                    if (contentTypeHandlerMap.hasOwnProperty(contentType)) {
                        this.ContentTypeHandlerManager.addHandler(contentType, contentTypeHandlerMap[contentType]);
                    }
                }
            });
            RequestManager.configureAuctionProtocol(this._core.Config.getTestMode());
            this.configureCampaignManager();
            this.configureAutomatedExperimentManager();
            this.configureRefreshManager();
            SdkStats.initialize(this._core.Api, this._core.RequestManager, this._core.Config, this.Config, this.SessionManager, this.CampaignManager, this._core.MetaDataManager, this._core.ClientInfo, this._core.CacheManager);
            this.Monetization.Api.Listener.isMonetizationEnabled().then((enabled) => {
                if (enabled) {
                    this.Monetization.initialize();
                }
            });
        }).then(() => {
            return this._core.Api.Sdk.initComplete();
        }).then(() => {
            if (this.MediationLoadTrackingManager) {
                this.MediationLoadTrackingManager.setInitComplete();
            }
            return Promises.voidResult(this.RefreshManager.initialize());
        }).then(() => {
            measurements.stopAndSend(InitializationMetric.WebviewInitializationPhases, {
                'wel': `${this._webViewEnabledLoad}`,
                'stg': 'request_on_init'
            });
            return Promises.voidResult(this.SessionManager.sendUnsentSessions());
        }).then(() => {
            if (performance && performance.now) {
                const webviewInitTime = performance.now();
                SDKMetrics.reportTimingEventWithTags(InitializationMetric.WebviewInitialization, webviewInitTime, {
                    'wel': `${this._webViewEnabledLoad}`
                });
            }
            if (performance && performance.now && CustomFeatures.sampleAtGivenPercent(5)) {
                const startTime = performance.now();
                this._core.RequestManager.get('https://auction.unityads.unity3d.com/check')
                    .then(() => {
                    SDKMetrics.reportTimingEvent(GeneralTimingMetric.AuctionHealthGood, performance.now() - startTime);
                }).catch(() => {
                    SDKMetrics.reportTimingEvent(GeneralTimingMetric.AuctionHealthBad, performance.now() - startTime);
                });
            }
            if (performance && performance.now && XHRequest.isAvailable() && CustomFeatures.sampleAtGivenPercent(5)) {
                const startTime = performance.now();
                XHRequest.get('https://auction.unityads.unity3d.com/check')
                    .then(() => {
                    SDKMetrics.reportTimingEvent(GeneralTimingMetric.AuctionHealthGoodXHR, performance.now() - startTime);
                }).catch(() => {
                    SDKMetrics.reportTimingEvent(GeneralTimingMetric.AuctionHealthBadXHR, performance.now() - startTime);
                });
            }
        });
    }
    configureCampaignManager() {
        if (this._loadApiEnabled && this._webViewEnabledLoad) {
            if (this.isLoadV5Enabled()) {
                let experiment = LoadV5ExperimentType.None;
                if (LoadV5NoInvalidation.isValid(this._core.Config.getAbGroup())) {
                    experiment = LoadV5ExperimentType.NoInvalidation;
                }
                if (LoadV5AuctionV6.isValid(this._core.Config.getAbGroup())) {
                    this.AdRequestManager = new AdRequestManagerV6(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager, experiment);
                }
                else {
                    this.AdRequestManager = new AdRequestManager(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager, experiment);
                }
                this.CampaignManager = this.AdRequestManager;
                return;
            }
        }
        this.CampaignManager = new LegacyCampaignManager(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager, this.MediationLoadTrackingManager, this.isLoadV5Supported());
    }
    configureAutomatedExperimentManager() {
        if (AutomatedExperimentManager.isAutomationAvailable(this.Config, this._core.Config)) {
            this._automatedExperimentManager.initialize(this._core, this.CampaignManager.onCampaign);
        }
    }
    configureRefreshManager() {
        // AdRequestManager will be set only if Load V5 is enabled.
        if (this.AdRequestManager) {
            if (LoadV5NoInvalidation.isValid(this._core.Config.getAbGroup())) {
                this.RefreshManager = new PerPlacementLoadManagerV5NoInvalidation(this.Api, this.Config, this._core.Config, this.AdRequestManager, this._core.ClientInfo, this._core.FocusManager, false, this.LoadAndFillEventManager);
            }
            else {
                this.RefreshManager = new PerPlacementLoadManagerV5(this.Api, this.Config, this._core.Config, this.AdRequestManager, this._core.ClientInfo, this._core.FocusManager, false, this.LoadAndFillEventManager);
            }
            return;
        }
        if (this._loadApiEnabled && this._webViewEnabledLoad) {
            this.RefreshManager = new PerPlacementLoadManager(this.Api, this.Config, this._core.Config, this.CampaignManager, this._core.ClientInfo, this._core.FocusManager, this.LoadAndFillEventManager);
        }
        else if (this._loadApiEnabled) {
            this.RefreshManager = new PerPlacementLoadAdapter(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager, this.LoadAndFillEventManager);
        }
        else {
            this.RefreshManager = new CampaignRefreshManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);
        }
    }
    configureLoadAndFillEventManager() {
        return this._core.MetaDataManager.fetch(FrameworkMetaData).then((framework) => {
            this.LoadAndFillEventManager = new LoadAndFillEventManager(this._core.Api, this._core.RequestManager, this._core.NativeBridge.getPlatform(), this._core.ClientInfo, this._core.Config, this._core.StorageBridge, this.PrivacySDK, this.Config, framework);
        });
    }
    setupMediationTrackingManager() {
        if (this.MediationLoadTrackingManager) {
            return Promise.resolve();
        }
        // tslint:disable-next-line:no-any
        let nativeInitTime = window.initTimestamp - this._core.ClientInfo.getInitTimestamp();
        const nativeInitTimeAcceptable = (nativeInitTime > 0 && nativeInitTime <= 30000);
        nativeInitTime = nativeInitTimeAcceptable ? nativeInitTime : undefined;
        if (this._loadApiEnabled) {
            return this._core.MetaDataManager.fetch(MediationMetaData).then((mediation) => {
                if (mediation && mediation.getName() && performance && performance.now) {
                    let experimentType = MediationExperimentType.None;
                    if (this.isLoadV5Enabled() && this._webViewEnabledLoad) {
                        experimentType = MediationExperimentType.LoadV5;
                    }
                    else {
                        // Set CacheMode for Mediation to Allowed for initial request if not on V5
                        this.Config.set('cacheMode', CacheMode.ALLOWED);
                    }
                    this._mediationName = mediation.getName();
                    this.MediationLoadTrackingManager = new MediationLoadTrackingManager(this.Api.LoadApi, this.Api.Listener, mediation.getName(), this._webViewEnabledLoad, experimentType, nativeInitTime, this.Config.getPlacementCount());
                    this.MediationLoadTrackingManager.reportPlacementCount(this.Config.getPlacementCount());
                }
            }).catch();
        }
        return Promise.resolve();
    }
    showPrivacyIfNeeded(options) {
        this.PrivacyManager.applyDeveloperAgeGate();
        if (!this.PrivacyManager.isPrivacyShowRequired()) {
            return Promise.resolve();
        }
        if (CustomFeatures.sampleAtGivenPercent(1)) {
            Diagnostics.trigger('consent_show', { adsConfig: JSON.stringify(this.Config.getDTO()) });
        }
        if (this._core.Config.isCoppaCompliant()) {
            Diagnostics.trigger('consent_with_coppa', {
                coreConfig: this._core.Config.getDTO(),
                adsConfig: this.Config.getDTO()
            });
            return Promise.resolve();
        }
        this._showingPrivacy = true;
        let privacyAdUnit;
        if (this.PrivacyManager.isPrivacySDKTestActive()) {
            const privacyAdUnitParams = {
                requestManager: this._core.RequestManager,
                abGroup: this._core.Config.getAbGroup(),
                platform: this._core.NativeBridge.getPlatform(),
                privacyManager: this.PrivacyManager,
                adUnitContainer: this.Container,
                adsConfig: this.Config,
                core: this._core.Api,
                deviceInfo: this._core.DeviceInfo,
                privacySDK: this.PrivacySDK
            };
            privacyAdUnit = new PrivacySDKUnit(privacyAdUnitParams);
        }
        else {
            const consentAdUnitParams = {
                abGroup: this._core.Config.getAbGroup(),
                platform: this._core.NativeBridge.getPlatform(),
                privacyManager: this.PrivacyManager,
                adUnitContainer: this.Container,
                adsConfig: this.Config,
                core: this._core.Api,
                deviceInfo: this._core.DeviceInfo,
                privacySDK: this.PrivacySDK
            };
            privacyAdUnit = new PrivacyUnit(consentAdUnitParams);
        }
        return privacyAdUnit.show(options);
    }
    show(placementId, options, callback) {
        callback(CallbackStatus.OK);
        if (this.isAttemptingToShowInBackground()) {
            SDKMetrics.reportMetricEvent(MiscellaneousMetric.CampaignAttemptedShowInBackground);
            return;
        }
        const campaign = this.RefreshManager.getCampaign(placementId);
        if (!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            SDKMetrics.reportMetricEvent(MiscellaneousMetric.CampaignNotFound);
            return;
        }
        if (this._showing || this._showingPrivacy) {
            // do not send finish event because there will be a finish event from currently open ad unit
            this.showError(false, placementId, 'Can\'t show a new ad unit when ad unit is already open');
            SDKMetrics.reportMetricEvent(ErrorMetric.AdUnitAlreadyShowing);
            return;
        }
        const placement = this.Config.getPlacement(placementId);
        if (!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            SDKMetrics.reportMetricEvent(ErrorMetric.PlacementWithIdDoesNotExist);
            return;
        }
        // AdRequestManager is only if Load V5 is enabled.
        // isInvalidationPending is valid only when Load V5 is in use.
        if (this.AdRequestManager && placement.isInvalidationPending()) {
            this.showError(true, placementId, 'Invalidation pending for a placement');
            this.AdRequestManager.reportMetricEvent(LoadV5Metrics.PlacementInvalidationPending);
            return;
        }
        SdkStats.sendShowEvent(placementId);
        if (campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this.RefreshManager.refresh();
            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                willExpireAt: campaign.getWillExpireAt(),
                contentType: campaign.getContentType()
            });
            SessionDiagnostics.trigger('campaign_expired', error, campaign.getSession());
            SDKMetrics.reportMetricEvent(ErrorMetric.CampaignExpired);
            return;
        }
        const trackingUrls = placement.getCurrentTrackingUrls();
        if (trackingUrls) {
            // Do not remove: Removing will currently break all tracking
            campaign.setTrackingUrls(trackingUrls);
        }
        else {
            SDKMetrics.reportMetricEvent(ErrorMetric.MissingTrackingUrlsOnShow);
        }
        this.showPrivacyIfNeeded(options).then(() => {
            this._showingPrivacy = false;
            this.showAd(placement, campaign, options);
        });
    }
    showAd(placement, campaign, options) {
        this._showing = true;
        if (this.Api.Listener instanceof PausableListenerApi) {
            this.Api.Listener.pauseEvents();
        }
        if (this.Config.getCacheMode() !== CacheMode.DISABLED) {
            this.AssetManager.stopCaching();
        }
        if (this.MediationLoadTrackingManager) {
            this.AssetManager.overrideCacheMode(CacheMode.FORCED);
            // This change is not necessary for the experiment, but it aligns the field for anything which accesses it after this point
            this.Config.set('cacheMode', CacheMode.FORCED);
        }
        Promise.all([
            this._core.DeviceInfo.getScreenWidth(),
            this._core.DeviceInfo.getScreenHeight(),
            this._core.DeviceInfo.getConnectionType(),
            this._core.MetaDataManager.fetch(PlayerMetaData, false)
        ]).then(([screenWidth, screenHeight, connectionType, playerMetadata]) => {
            let playerMetadataServerId;
            if (playerMetadata) {
                playerMetadataServerId = playerMetadata.getServerId();
            }
            const isAttemptingToStreamAssets = !CampaignAssetInfo.isCached(campaign) || campaign.isConnectionNeeded();
            const hasNoConnection = connectionType === 'none';
            if (isAttemptingToStreamAssets && hasNoConnection) {
                // Track to understand impact before blocking show by new criteria
                SDKMetrics.reportMetricEventWithTags(ErrorMetric.AttemptToStreamCampaignWithoutConnection, {
                    'cnt': campaign.getContentType()
                });
            }
            if (campaign.isConnectionNeeded() && connectionType === 'none') {
                this._showing = false;
                this.showError(true, placement.getId(), 'No connection');
                SDKMetrics.reportMetricEvent(ErrorMetric.NoConnectionWhenNeeded);
                return;
            }
            const orientation = screenWidth >= screenHeight ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
            AbstractPrivacy.createBuildInformation(this._core.NativeBridge.getPlatform(), this._core.ClientInfo, this._core.DeviceInfo, campaign, this._core.Config);
            this._currentAdUnit = this.getAdUnitFactory(campaign).create(campaign, placement, orientation, playerMetadataServerId || '', options, this.isLoadV5Supported());
            this.RefreshManager.setCurrentAdUnit(this._currentAdUnit, placement);
            if (this.Monetization.isInitialized()) {
                this.Monetization.PlacementContentManager.setCurrentAdUnit(placement.getId(), this._currentAdUnit);
            }
            this._currentAdUnit.onClose.subscribe(() => {
                this.onAdUnitClose();
                SDKMetrics.sendBatchedEvents();
            });
            this._currentAdUnit.onFinish.subscribe(() => SDKMetrics.sendBatchedEvents());
            this._currentAdUnit.onError.subscribe(() => SDKMetrics.sendBatchedEvents());
            if (this._core.NativeBridge.getPlatform() === Platform.IOS && (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign)) {
                if (!IosUtils.isAppSheetBroken(this._core.DeviceInfo.getOsVersion(), this._core.DeviceInfo.getModel(), orientation) && !campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(campaign.getAppStoreId(), 10)
                    };
                    this.Store.Api.iOS.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this.Store.Api.iOS.AppSheet.onClose.subscribe(() => {
                            this.Store.Api.iOS.AppSheet.prepare(appSheetOptions);
                        });
                        this._currentAdUnit.onClose.subscribe(() => {
                            this.Store.Api.iOS.AppSheet.onClose.unsubscribe(onCloseObserver);
                            if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._core.ClientInfo.getGameId())) {
                                // app sheet is not closed properly if the user opens or downloads the game. Reset the app sheet.
                                this.Store.Api.iOS.AppSheet.destroy();
                            }
                            else {
                                this.Store.Api.iOS.AppSheet.destroy(appSheetOptions);
                            }
                        });
                    });
                }
            }
            OperativeEventManager.setPreviousPlacementId(this.CampaignManager.getPreviousPlacementId());
            this.CampaignManager.setPreviousPlacementId(placement.getId());
            this._currentAdUnit.show().then(() => {
                if (this._loadApiEnabled && this._webViewEnabledLoad) {
                    SDKMetrics.reportMetricEvent(LoadMetric.LoadEnabledShow);
                }
                // AdRequestManager is valid only if Load V5 is enabled
                if (this.AdRequestManager) {
                    this.AdRequestManager.reportMetricEvent(LoadV5Metrics.Show);
                }
                if (this.MediationLoadTrackingManager) {
                    this.MediationLoadTrackingManager.reportAdShown(CampaignAssetInfo.isCached(campaign));
                }
            });
        });
    }
    isAttemptingToShowInBackground() {
        const isAppBackgrounded = !this._core.FocusManager.isAppForeground();
        const isAppWhitelistedToShowInBackground = CustomFeatures.isWhitelistedToShowInBackground(this._core.ClientInfo.getGameId());
        return isAppBackgrounded && !isAppWhitelistedToShowInBackground;
    }
    getAdUnitFactory(campaign) {
        const contentType = campaign.getContentType();
        return this.ContentTypeHandlerManager.getFactory(contentType);
    }
    showError(sendFinish, placementId, errorMsg) {
        this._core.Api.Sdk.logError('Show invocation failed: ' + errorMsg);
        this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if (sendFinish) {
            this.Api.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }
    onAdUnitClose() {
        this._showing = false;
    }
    setupTestEnvironment() {
        if (TestEnvironment.get('serverUrl')) {
            ProgrammaticOperativeEventManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
            CampaignManager.setBaseUrl(TestEnvironment.get('serverUrl'));
            AuctionRequest.setBaseUrl(TestEnvironment.get('serverUrl'));
        }
        if (TestEnvironment.get('campaignId')) {
            CampaignManager.setCampaignId(TestEnvironment.get('campaignId'));
        }
        if (TestEnvironment.get('sessionId')) {
            CampaignManager.setSessionId(TestEnvironment.get('sessionId'));
            AuctionRequest.setSessionId(TestEnvironment.get('sessionId'));
        }
        if (TestEnvironment.get('country')) {
            CampaignManager.setCountry(TestEnvironment.get('country'));
        }
        if (TestEnvironment.get('autoSkip')) {
            VideoOverlay.setAutoSkip(TestEnvironment.get('autoSkip'));
        }
        if (TestEnvironment.get('autoClose')) {
            AbstractAdUnit.setAutoClose(TestEnvironment.get('autoClose'));
        }
        if (TestEnvironment.get('autoCloseDelay')) {
            AbstractAdUnit.setAutoCloseDelay(TestEnvironment.get('autoCloseDelay'));
        }
        if (TestEnvironment.get('forcedOrientation')) {
            AdUnitContainer.setForcedOrientation(TestEnvironment.get('forcedOrientation'));
        }
        if (TestEnvironment.get('forcedPlayableMRAID')) {
            MRAIDAdUnitParametersFactory.setForcedExtendedMRAID(TestEnvironment.get('forcedPlayableMRAID'));
        }
        let forcedARMRAID = false;
        if (TestEnvironment.get('forcedARMRAID')) {
            forcedARMRAID = TestEnvironment.get('forcedARMRAID');
            MRAIDAdUnitParametersFactory.setForcedARMRAID(forcedARMRAID);
        }
        if (TestEnvironment.get('creativeUrl')) {
            RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
            const creativeUrl = TestEnvironment.get('creativeUrl');
            let response = '';
            const platform = this._core.NativeBridge.getPlatform();
            if (platform === Platform.ANDROID) {
                response = JSON.stringify(CreativeUrlResponseAndroid).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            }
            else if (platform === Platform.IOS) {
                response = JSON.stringify(CreativeUrlResponseIos).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            }
            if (forcedARMRAID) {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID_AR');
            }
            else {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID');
            }
            CampaignManager.setCampaignResponse(response);
        }
        const creativePack = TestEnvironment.get('creativePack');
        if (creativePack) {
            RequestManager.setTestAuctionProtocol(AuctionProtocol.V5);
            const platform = this._core.NativeBridge.getPlatform();
            const response = CampaignResponseUtils.getVideoCreativePackResponse(platform, creativePack);
            CampaignManager.setCampaignResponse(response);
        }
        if (TestEnvironment.get('debugJsConsole')) {
            MRAIDView.setDebugJsConsole(TestEnvironment.get('debugJsConsole'));
        }
        if (TestEnvironment.get('forceLoadV5')) {
            this._forceLoadV5 = true;
        }
        if (TestEnvironment.get('forceEndScreenUrl')) {
            CometCampaignParser.setForceEndScreenUrl(TestEnvironment.get('forceEndScreenUrl'));
        }
    }
    setupPrivacyTestEnvironment() {
        return PrivacyTestEnvironment.setup(new MetaData(this._core.Api)).catch(() => {
            this._core.Api.Sdk.logDebug('Error setting metadata env for privacy');
        });
    }
    logChinaMetrics() {
        const isChineseUser = this._core.Config.getCountry() === 'CN';
        if (isChineseUser) {
            SDKMetrics.reportMetricEvent(ChinaMetric.ChineseUserInitialized);
        }
        this.identifyUser(isChineseUser);
    }
    identifyUser(isChineseUser) {
        this.isUsingChineseNetworkOperator().then(isAChineseNetwork => {
            if (isAChineseNetwork) {
                const networkMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByNetworkOperator : ChinaMetric.ChineseUserIdentifiedIncorrectlyByNetworkOperator;
                SDKMetrics.reportMetricEvent(networkMetric);
            }
            else {
                const localeMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByLocale : ChinaMetric.ChineseUserIdentifiedIncorrectlyByLocale;
                this.logChinaLocalizationOptimizations(localeMetric);
            }
        });
    }
    isUsingChineseNetworkOperator() {
        return this._core.DeviceInfo.getNetworkOperator().then(networkOperator => {
            return !!(networkOperator && networkOperator.length >= 3 && networkOperator.substring(0, 3) === '460');
        });
    }
    logChinaLocalizationOptimizations(metric) {
        const deviceLanguage = this._core.DeviceInfo.getLanguage().toLowerCase();
        const chineseLanguage = !!(deviceLanguage.match(/zh[-_]cn/) || deviceLanguage.match(/zh[-_]hans/) || deviceLanguage.match(/zh(((_#?hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?hans)?))$/));
        const chineseTimeZone = this._core.DeviceInfo.getTimeZone() === 'GMT+08:00';
        if (chineseLanguage && chineseTimeZone) {
            SDKMetrics.reportMetricEvent(metric);
        }
    }
    setupLoadApiEnabled() {
        this._loadApiEnabled = this._core.ClientInfo.getUsePerPlacementLoad();
        HttpKafka.sendEvent('ads.sdk.loadApiEnabled.v1.json', KafkaCommonObjectType.ANONYMOUS, {
            'v': 1,
            loadApiEnabled: this._loadApiEnabled
        });
        const loadV5 = this.isLoadV5Enabled();
        const isPSPTestApp = CustomFeatures.isPSPTestAppGame(this._core.ClientInfo.getGameId());
        if (loadV5 || isPSPTestApp) {
            this._webViewEnabledLoad = true;
        }
    }
    isLoadV5Enabled() {
        const loadV5Test = LoadV5.isValid(this._core.Config.getAbGroup());
        const loadV5Game = this.Config.isLoadV5Enabled();
        return (loadV5Test && loadV5Game) || this._forceLoadV5;
    }
    isLoadV5Supported() {
        const loadV5Game = this.Config.isLoadV5Enabled();
        return (this._loadApiEnabled && loadV5Game) || this._forceLoadV5;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9BZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN4RSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQzNELE9BQU8sRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDdEYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRXZFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDbkYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDckUsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDL0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDakUsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTdELE9BQU8sRUFBa0MsNkJBQTZCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUczSCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFB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QUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ2xDLGlDQUFpQyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbkYsZUFBZSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0QsY0FBYyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDL0Q7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDbkMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDbEMsZUFBZSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDL0QsY0FBYyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDakU7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDaEMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDOUQ7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDakMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7U0FDN0Q7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDbEMsY0FBYyxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDakU7UUFFRCxJQUFJLGVBQWUsQ0FBQyxHQUFH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