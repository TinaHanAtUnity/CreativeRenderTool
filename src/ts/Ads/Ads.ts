import { AdMob } from 'AdMob/AdMob';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { IAds, IAdsApi } from 'Ads/IAds';
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
import { AdsConfiguration, IRawAdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { IThirdPartyEventManagerFactory, ThirdPartyEventManagerFactory } from 'Ads/Managers/ThirdPartyEventManagerFactory';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
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
import { ICore } from 'Core/ICore';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { CallbackStatus, INativeCallback } from 'Core/Native/Bridge/NativeBridge';
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
import { AbstractParserModule } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { PrivacyUnit } from 'Ads/AdUnits/PrivacyUnit';
import { IStore } from 'Store/IStore';
import { Store } from 'Store/Store';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { LoadApi } from 'Core/Native/LoadApi';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PerPlacementLoadManager } from 'Ads/Managers/PerPlacementLoadManager';
import { Analytics } from 'Analytics/Analytics';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import { Promises } from 'Core/Utilities/Promises';
import { LoadV5, LoadV5NoInvalidation, LoadV5GroupId } from 'Core/Models/ABGroup';
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

export class Ads implements IAds {

    public readonly Api: Readonly<IAdsApi>;

    public readonly AdMobSignalFactory: AdMobSignalFactory;
    public readonly InterstitialWebPlayerContainer: InterstitialWebPlayerContainer;

    public readonly SessionManager: SessionManager;
    public readonly MissedImpressionManager: MissedImpressionManager;
    public readonly ContentTypeHandlerManager: ContentTypeHandlerManager;
    public readonly ThirdPartyEventManagerFactory: IThirdPartyEventManagerFactory;

    public Config: AdsConfiguration;
    public Container: Activity | ViewController;
    public PrivacySDK: PrivacySDK;
    public PrivacyManager: UserPrivacyManager;
    public PlacementManager: PlacementManager;
    public AssetManager: AssetManager;
    public CampaignManager: CampaignManager;
    public RefreshManager: RefreshManager;
    public MediationLoadTrackingManager: MediationLoadTrackingManager;

    private _currentAdUnit: AbstractAdUnit;
    private _showing: boolean = false;
    private _showingPrivacy: boolean = false;
    private _loadApiEnabled: boolean = false;
    private _webViewEnabledLoad: boolean = false;
    private _forceLoadV5: boolean = false;
    private _mediationName: string;
    private _core: ICore;
    private _automatedExperimentManager: AutomatedExperimentManager;

    public BannerModule: BannerModule;
    public Monetization: Monetization;
    public AR: AR;
    public Analytics: Analytics;
    public Store: IStore;
    public AdRequestManager: AdRequestManager;
    public LoadAndFillEventManager: LoadAndFillEventManager;

    constructor(config: unknown, core: ICore) {
        this.PrivacySDK = PrivacyParser.parse(<IRawAdsConfiguration>config, core.ClientInfo, core.DeviceInfo);
        this.Config = AdsConfigurationParser.parse(<IRawAdsConfiguration>config);
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
            this.Container = new Activity(this._core.Api, this.Api, <AndroidDeviceInfo> this._core.DeviceInfo);
        } else if (this._core.NativeBridge.getPlatform() === Platform.IOS) {
            const model = this._core.DeviceInfo.getModel();
            if (model.match(/iphone/i) || model.match(/ipod/i)) {
                document.body.classList.add('iphone');
            } else if (model.match(/ipad/i)) {
                document.body.classList.add('ipad');
            }
            this.Container = new ViewController(this._core.Api, this.Api, <IosDeviceInfo> this._core.DeviceInfo, this._core.FocusManager, this._core.ClientInfo);
        }
        this.SessionManager = new SessionManager(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this.MissedImpressionManager = new MissedImpressionManager(this._core.Api);
        this.ContentTypeHandlerManager = new ContentTypeHandlerManager();
        this.ThirdPartyEventManagerFactory = new ThirdPartyEventManagerFactory(this._core.Api, this._core.RequestManager, this._core.StorageBridge);
        this._automatedExperimentManager = new AutomatedExperimentManager();
    }

    public initialize(): Promise<void> {
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
        }).then((gameSessionId: number) => {
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

            const parserModules: AbstractParserModule[] = [
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
            measurements.stopAndSend(
                InitializationMetric.WebviewInitializationPhases, {
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

    private configureCampaignManager() {
        if (this._loadApiEnabled && this._webViewEnabledLoad) {
            if (this.isLoadV5Enabled()) {
                const useGroupIds = this.useGroupIdSupport();

                let experiment = LoadV5ExperimentType.None;

                if (LoadV5NoInvalidation.isValid(this._core.Config.getAbGroup())) {
                    experiment = LoadV5ExperimentType.NoInvalidation;
                } else if (useGroupIds) {
                    experiment = LoadV5ExperimentType.GroupId;
                }

                this.AdRequestManager = new AdRequestManager(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager, experiment);
                this.CampaignManager = this.AdRequestManager;
                return;
            }
        }

        this.CampaignManager = new LegacyCampaignManager(this._core.NativeBridge.getPlatform(), this._core, this._core.Config, this.Config, this.AssetManager, this.SessionManager, this.AdMobSignalFactory, this._core.RequestManager, this._core.ClientInfo, this._core.DeviceInfo, this._core.MetaDataManager, this._core.CacheBookkeeping, this.ContentTypeHandlerManager, this.PrivacySDK, this.PrivacyManager, this.MediationLoadTrackingManager, this.isLoadV5Supported());
    }

    private configureAutomatedExperimentManager() {
        if (AutomatedExperimentManager.isAutomationAvailable(this.Config, this._core.Config)) {
            this._automatedExperimentManager.initialize(this._core, this.CampaignManager.onCampaign);
        }
    }

    private configureRefreshManager(): void {
        // AdRequestManager will be set only if Load V5 is enabled.
        if (this.AdRequestManager) {
            if (LoadV5NoInvalidation.isValid(this._core.Config.getAbGroup())) {
                this.RefreshManager = new PerPlacementLoadManagerV5NoInvalidation(this.Api, this.Config, this._core.Config, this.AdRequestManager, this._core.ClientInfo, this._core.FocusManager, false);
            } else {
                const useGroupIds = this.useGroupIdSupport();
                this.RefreshManager = new PerPlacementLoadManagerV5(this.Api, this.Config, this._core.Config, this.AdRequestManager, this._core.ClientInfo, this._core.FocusManager, useGroupIds);
            }
            return;
        }

        if (this._loadApiEnabled && this._webViewEnabledLoad) {
            this.RefreshManager = new PerPlacementLoadManager(this.Api, this.Config, this._core.Config, this.CampaignManager, this._core.ClientInfo, this._core.FocusManager);
        } else if (this._loadApiEnabled) {
            this.RefreshManager = new PerPlacementLoadAdapter(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);
        } else {
            this.RefreshManager = new CampaignRefreshManager(this._core.NativeBridge.getPlatform(), this._core.Api, this._core.Config, this.Api, this._core.WakeUpManager, this.CampaignManager, this.Config, this._core.FocusManager, this.SessionManager, this._core.ClientInfo, this._core.RequestManager, this._core.CacheManager);
        }
    }

    private configureLoadAndFillEventManager(): Promise<void> {
        return this._core.MetaDataManager.fetch(FrameworkMetaData).then((framework) => {
            this.LoadAndFillEventManager = new LoadAndFillEventManager(
                this._core.Api,
                this._core.RequestManager,
                this._core.NativeBridge.getPlatform(),
                this._core.ClientInfo,
                this._core.Config,
                this._core.StorageBridge,
                this.PrivacySDK,
                this.Config,
                framework
            );
        });
    }

    private setupMediationTrackingManager(): Promise<void> {

        if (this.MediationLoadTrackingManager) {
            return Promise.resolve();
        }

        // tslint:disable-next-line:no-any
        let nativeInitTime: number | undefined = (<number>(<any>window).initTimestamp) - this._core.ClientInfo.getInitTimestamp();
        const nativeInitTimeAcceptable = (nativeInitTime > 0 && nativeInitTime <= 30000);
        nativeInitTime = nativeInitTimeAcceptable ? nativeInitTime : undefined;
        if (this._loadApiEnabled) {
            return this._core.MetaDataManager.fetch(MediationMetaData).then((mediation) => {
                if (mediation && mediation.getName() && performance && performance.now) {

                    let experimentType = MediationExperimentType.None;

                    if (this.isLoadV5Enabled() && this._webViewEnabledLoad) {
                        experimentType = MediationExperimentType.LoadV5;
                    } else {
                        // Set CacheMode for Mediation to Allowed for initial request if not on V5
                        this.Config.set('cacheMode', CacheMode.ALLOWED);
                    }

                    this._mediationName = mediation.getName()!;
                    this.MediationLoadTrackingManager = new MediationLoadTrackingManager(this.Api.LoadApi, this.Api.Listener, mediation.getName()!, this._webViewEnabledLoad, experimentType, nativeInitTime, this.Config.getPlacementCount());
                    this.MediationLoadTrackingManager.reportPlacementCount(this.Config.getPlacementCount());
                }
            }).catch();
        }
        return Promise.resolve();
    }

    private showPrivacyIfNeeded(options: unknown): Promise<void> {
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

        let privacyAdUnit: PrivacySDKUnit | PrivacyUnit;
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
        } else {
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

    public show(placementId: string, options: unknown, callback: INativeCallback): void {
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

        const placement: Placement = this.Config.getPlacement(placementId);
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
        } else {
            SDKMetrics.reportMetricEvent(ErrorMetric.MissingTrackingUrlsOnShow);
        }

        this.showPrivacyIfNeeded(options).then(() => {
            this._showingPrivacy = false;
            this.showAd(placement, campaign, options);
        });
    }

    private showAd(placement: Placement, campaign: Campaign, options: unknown) {

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
            let playerMetadataServerId: string | undefined;
            if (playerMetadata) {
                playerMetadataServerId = playerMetadata.getServerId();
            }

            const isAttemptingToStreamAssets: boolean = !CampaignAssetInfo.isCached(campaign) || campaign.isConnectionNeeded();
            const hasNoConnection: boolean = connectionType === 'none';

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
                    this.Store.Api.iOS!.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this.Store.Api.iOS!.AppSheet.onClose.subscribe(() => {
                            this.Store.Api.iOS!.AppSheet.prepare(appSheetOptions);
                        });
                        this._currentAdUnit.onClose.subscribe(() => {
                            this.Store.Api.iOS!.AppSheet.onClose.unsubscribe(onCloseObserver);
                            if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._core.ClientInfo.getGameId())) {
                                // app sheet is not closed properly if the user opens or downloads the game. Reset the app sheet.
                                this.Store.Api.iOS!.AppSheet.destroy();
                            } else {
                                this.Store.Api.iOS!.AppSheet.destroy(appSheetOptions);
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

    private isAttemptingToShowInBackground(): boolean {
        const isAppBackgrounded = !this._core.FocusManager.isAppForeground();
        const isAppWhitelistedToShowInBackground = CustomFeatures.isWhitelistedToShowInBackground(this._core.ClientInfo.getGameId());
        return isAppBackgrounded && !isAppWhitelistedToShowInBackground;
    }

    private getAdUnitFactory(campaign: Campaign) {
        const contentType = campaign.getContentType();
        return this.ContentTypeHandlerManager.getFactory(contentType);
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._core.Api.Sdk.logError('Show invocation failed: ' + errorMsg);
        this.Api.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if (sendFinish) {
            this.Api.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private onAdUnitClose(): void {
        this._showing = false;
    }

    private setupTestEnvironment(): void {
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

            const creativeUrl = TestEnvironment.get<string>('creativeUrl');
            let response: string = '';
            const platform = this._core.NativeBridge.getPlatform();
            if (platform === Platform.ANDROID) {
                response = JSON.stringify(CreativeUrlResponseAndroid).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            } else if (platform === Platform.IOS) {
                response = JSON.stringify(CreativeUrlResponseIos).replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
            }

            if (forcedARMRAID) {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID_AR');
            } else {
                response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID');
            }

            CampaignManager.setCampaignResponse(response);
        }

        const creativePack: string = TestEnvironment.get('creativePack');
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

    private setupPrivacyTestEnvironment(): Promise<void> {
        return PrivacyTestEnvironment.setup(new MetaData(this._core.Api)).catch(() => {
            this._core.Api.Sdk.logDebug('Error setting metadata env for privacy');
        });
    }

    private logChinaMetrics() {
        const isChineseUser = this._core.Config.getCountry() === 'CN';
        if (isChineseUser) {
            SDKMetrics.reportMetricEvent(ChinaMetric.ChineseUserInitialized);
        }
        this.identifyUser(isChineseUser);
    }

    private identifyUser(isChineseUser: boolean) {
        this.isUsingChineseNetworkOperator().then(isAChineseNetwork => {
            if (isAChineseNetwork) {
                const networkMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByNetworkOperator : ChinaMetric.ChineseUserIdentifiedIncorrectlyByNetworkOperator;
                SDKMetrics.reportMetricEvent(networkMetric);
            } else {
                const localeMetric = isChineseUser ? ChinaMetric.ChineseUserIdentifiedCorrectlyByLocale : ChinaMetric.ChineseUserIdentifiedIncorrectlyByLocale;
                this.logChinaLocalizationOptimizations(localeMetric);
            }
        });
    }

    private isUsingChineseNetworkOperator(): Promise<boolean> {
        return this._core.DeviceInfo.getNetworkOperator().then(networkOperator => {
            return !!(networkOperator && networkOperator.length >= 3 && networkOperator.substring(0, 3) === '460');
        });
    }

    private logChinaLocalizationOptimizations(metric: ChinaMetric) {
        const deviceLanguage = this._core.DeviceInfo.getLanguage().toLowerCase();
        const chineseLanguage = !!(deviceLanguage.match(/zh[-_]cn/) || deviceLanguage.match(/zh[-_]hans/) || deviceLanguage.match(/zh(((_#?hans)?(_\\D\\D)?)|((_\\D\\D)?(_#?hans)?))$/));
        const chineseTimeZone = this._core.DeviceInfo.getTimeZone() === 'GMT+08:00';
        if (chineseLanguage && chineseTimeZone) {
            SDKMetrics.reportMetricEvent(metric);
        }
    }

    private setupLoadApiEnabled(): void {
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

    private isLoadV5Enabled(): boolean {
        const loadV5Test = LoadV5.isValid(this._core.Config.getAbGroup());
        const loadV5Game = CustomFeatures.isLoadV5Game(this._core.ClientInfo.getGameId());

        return (loadV5Test && loadV5Game) || this._forceLoadV5;
    }

    private isLoadV5Supported(): boolean {
        const loadV5Game = CustomFeatures.isLoadV5Game(this._core.ClientInfo.getGameId());

        return (this._loadApiEnabled && loadV5Game) || this._forceLoadV5;
    }

    private useGroupIdSupport(): boolean {
        return LoadV5GroupId.isValid(this._core.Config.getAbGroup());
    }
}
