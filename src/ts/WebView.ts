import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { AdUnitFactory } from 'Ads/AdUnits/AdUnitFactory';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { MissedImpressionManager } from 'Ads/Managers/MissedImpressionManager';
import { OldCampaignRefreshManager } from 'Ads/Managers/OldCampaignRefreshManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { BannerWebPlayerContainer } from 'Ads/Utilities/WebPlayer/BannerWebPlayerContainer';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Overlay } from 'Ads/Views/Overlay';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { BannerAdContext } from 'Banners/Context/BannerAdContext';
import { BannerCampaignManager } from 'Banners/Managers/BannerCampaignManager';
import { BannerPlacementManager } from 'Banners/Managers/BannerPlacementManager';
import { AuctionRequest } from 'Banners/Utilities/AuctionRequest';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { UnityAdsError } from 'Core/Constants/UnityAdsError';
import { ConfigError } from 'Core/Errors/ConfigError';
import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { JaegerManager } from 'Core/Jaeger/JaegerManager';
import { JaegerSpan, JaegerTags } from 'Core/Jaeger/JaegerSpan';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ABGroupBuilder, BackupCampaignTest } from 'Core/Models/ABGroup';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CacheMode, CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IosDeviceInfo } from 'Core/Models/IosDeviceInfo';
import { CallbackStatus, INativeCallback, NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { Cache } from 'Core/Utilities/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { MetaData } from 'Core/Utilities/MetaData';
import { Promises, TimeoutError } from 'Core/Utilities/Promises';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import { Resolve } from 'Core/Utilities/Resolve';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import CreativeUrlConfiguration from 'json/CreativeUrlConfiguration.json';
import CreativeUrlResponseAndroid from 'json/CreativeUrlResponseAndroid.json';
import CreativeUrlResponseIos from 'json/CreativeUrlResponseIos.json';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { PlacementContentManager } from 'Monetization/Managers/PlacementContentManager';
import { NativePromoPlacementContentEventManager } from 'Monetization/Managers/NativePromoPlacementContentManager';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { PromoEvents } from 'Promo/Utilities/PromoEvents';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;

    private _campaignManager: CampaignManager;
    private _backupCampaignManager: BackupCampaignManager;
    private _refreshManager: RefreshManager;
    private _assetManager: AssetManager;
    private _cache: Cache;
    private _cacheBookkeeping: CacheBookkeeping;
    private _container: AdUnitContainer;
    private _storageBridge: StorageBridge;

    private _currentAdUnit: AbstractAdUnit;

    private _sessionManager: SessionManager;
    private _wakeUpManager: WakeUpManager;
    private _focusManager: FocusManager;
    private _analyticsManager: AnalyticsManager | undefined;
    private _promoEvents: PromoEvents;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _missedImpressionManager: MissedImpressionManager;
    private _gdprManager: GdprManager;
    private _jaegerManager: JaegerManager;
    private _interstitialWebPlayerContainer: WebPlayerContainer;
    private _programmaticTrackingService: ProgrammaticTrackingService;
    private _placementContentManager: PlacementContentManager;
    private _nativePromoPlacementContentEventManager: NativePromoPlacementContentEventManager;
    private _nativePromoEventHandler: NativePromoEventHandler;

    private _showing: boolean = false;
    private _initialized: boolean = false;
    private _initializedAt: number;
    private _metadataManager: MetaDataManager;

    private _creativeUrl?: string;
    private _requestDelay: number;
    private _wasRealtimePlacement: boolean = false;

    private _cachedCampaignResponse: INativeResponse | undefined;
    private _bannerAdContext: BannerAdContext;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(event), false);
        }
    }

    public initialize(): Promise<void | any[]> {
        const jaegerInitSpan = new JaegerSpan('Initialize'); // start a span
        return this._nativeBridge.Sdk.loadComplete().then((data) => {
            jaegerInitSpan.addAnnotation('nativeBridge loadComplete');
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);

            if(!/^\d+$/.test(this._clientInfo.getGameId())) {
                const message = `Provided Game ID '${this._clientInfo.getGameId()}' is invalid. Game ID may contain only digits (0-9).`;
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], message);
                return Promise.reject(message);
            }

            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                this._deviceInfo = new AndroidDeviceInfo(this._nativeBridge);
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                this._deviceInfo = new IosDeviceInfo(this._nativeBridge);
            }

            this._cachedCampaignResponse = undefined;

            this._storageBridge = new StorageBridge(this._nativeBridge);
            this._focusManager = new FocusManager(this._nativeBridge);
            this._wakeUpManager = new WakeUpManager(this._nativeBridge, this._focusManager);
            this._request = new Request(this._nativeBridge, this._wakeUpManager);
            this._cacheBookkeeping = new CacheBookkeeping(this._nativeBridge);
            this._programmaticTrackingService = new ProgrammaticTrackingService(this._request, this._clientInfo, this._deviceInfo);
            this._cache = new Cache(this._nativeBridge, this._wakeUpManager, this._request, this._cacheBookkeeping);
            this._resolve = new Resolve(this._nativeBridge);
            this._metadataManager = new MetaDataManager(this._nativeBridge);
            this._adMobSignalFactory = new AdMobSignalFactory(this._nativeBridge, this._clientInfo, this._deviceInfo, this._focusManager);
            this._jaegerManager = new JaegerManager(this._request);
            this._jaegerManager.addOpenSpan(jaegerInitSpan);
            this._interstitialWebPlayerContainer = new InterstitialWebPlayerContainer(this._nativeBridge);

            HttpKafka.setRequest(this._request);
            HttpKafka.setClientInfo(this._clientInfo);
            SdkStats.setInitTimestamp();
            GameSessionCounters.init();

            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                this._nativeBridge.Request.Android.setMaximumPoolSize(8);
                this._nativeBridge.Request.Android.setKeepAliveTime(10000);
            } else {
                this._nativeBridge.Request.setConcurrentRequestCount(8);
            }

            return Promise.all([this._deviceInfo.fetch(), this.setupTestEnvironment()]);
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID && this._deviceInfo instanceof AndroidDeviceInfo) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
                this._container = new Activity(this._nativeBridge, this._deviceInfo);
            } else if(this._clientInfo.getPlatform() === Platform.IOS && this._deviceInfo instanceof IosDeviceInfo) {
                const model = this._deviceInfo.getModel();
                if(model.match(/iphone/i) || model.match(/ipod/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
                this._container = new ViewController(this._nativeBridge, this._deviceInfo, this._focusManager, this._clientInfo);
            }
            HttpKafka.setDeviceInfo(this._deviceInfo);
            this._sessionManager = new SessionManager(this._nativeBridge, this._request, this._storageBridge);

            this._initializedAt = Date.now();
            this._nativeBridge.Sdk.initComplete();

            this._missedImpressionManager = new MissedImpressionManager(this._nativeBridge);

            this._wakeUpManager.setListenConnectivity(true);
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._focusManager.setListenAppForeground(true);
                this._focusManager.setListenAppBackground(true);
            } else {
                this._focusManager.setListenScreen(true);
                this._focusManager.setListenAndroidLifecycle(true);
            }

            const configSpan = this._jaegerManager.startSpan('FetchConfiguration', jaegerInitSpan.id, jaegerInitSpan.traceId);
            let configPromise;
            if(this._creativeUrl) {
                configPromise = Promise.resolve(JsonParser.parse(CreativeUrlConfiguration));
            } else {
                configPromise = ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, configSpan);
            }

            configPromise.then(() => {
                this._jaegerManager.stop(configSpan);
            }).catch(() => {
                this._jaegerManager.stop(configSpan);
            });

            configPromise = configPromise.then((configJson): [CoreConfiguration, AdsConfiguration] => {
                const coreConfig = CoreConfigurationParser.parse(configJson);
                const adsConfig = AdsConfigurationParser.parse(configJson);
                this._nativeBridge.Sdk.logInfo('Received configuration with ' + adsConfig.getPlacementCount() + ' placements for token ' + coreConfig.getToken() + ' (A/B group ' + coreConfig.getAbGroup() + ')');
                if(this._nativeBridge.getPlatform() === Platform.IOS && this._deviceInfo.getLimitAdTracking()) {
                    ConfigManager.storeGamerToken(this._nativeBridge, configJson.token);
                }
                return [coreConfig, adsConfig];
            }).catch((error) => {
                configSpan.addTag(JaegerTags.Error, 'true');
                configSpan.addTag(JaegerTags.ErrorMessage, error.message);
                configSpan.addAnnotation(error.message);
                throw new Error(error);
            });

            const cachePromise = this._cacheBookkeeping.cleanCache().catch(error => {
                // don't fail init due to cache cleaning issues, instead just log and report diagnostics
                this._nativeBridge.Sdk.logError('Unity Ads cleaning cache failed: ' + error);
                Diagnostics.trigger('cleaning_cache_failed', error);
            });

            const cachedCampaignResponsePromise = this._cacheBookkeeping.getCachedCampaignResponse();
            const monetizationEnabledPromise = this._nativeBridge.Monetization.Listener.isMonetizationEnabled();

            return Promise.all([configPromise, cachedCampaignResponsePromise, monetizationEnabledPromise, cachePromise]);
        }).then(([[coreConfig, adsConfig], cachedCampaignResponse, monetizationEnabled]) => {
            this._coreConfig = coreConfig;
            this._adsConfig = adsConfig;
            this._clientInfo.setMonetizationInUse(monetizationEnabled);
            this._gdprManager = new GdprManager(this._nativeBridge, this._deviceInfo, this._clientInfo, this._coreConfig, this._adsConfig, this._request);
            this._cachedCampaignResponse = cachedCampaignResponse;
            HttpKafka.setConfiguration(this._coreConfig);
            this._jaegerManager.setJaegerTracingEnabled(this._coreConfig.isJaegerTracingEnabled());

            if (!this._coreConfig.isEnabled()) {
                const error = new Error('Game with ID ' + this._clientInfo.getGameId() +  ' is not enabled');
                error.name = 'DisabledGame';
                throw error;
            }

            let analyticsPromise;
            if(this._coreConfig.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this._clientInfo.getGameId())) {
                const analyticsManager = new AnalyticsManager(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, this._coreConfig, this._focusManager);
                this._analyticsManager = analyticsManager;
                analyticsPromise = this._analyticsManager.init().then(() => {
                    this._sessionManager.setGameSessionId(analyticsManager.getGameSessionId());
                });
            } else {
                const analyticsStorage: AnalyticsStorage = new AnalyticsStorage(this._nativeBridge);
                analyticsPromise = analyticsStorage.getSessionId(this._clientInfo.isReinitialized()).then(gameSessionId => {
                    analyticsStorage.setSessionId(gameSessionId);
                    this._sessionManager.setGameSessionId(gameSessionId);
                });
            }
            this._promoEvents = new PromoEvents(this._coreConfig, this._adsConfig, this._nativeBridge, this._clientInfo, this._deviceInfo);
            const gdprConsentPromise = this._gdprManager.getConsentAndUpdateConfiguration().catch((error) => {
                // do nothing
                // error happens when consent value is undefined
            });
            return Promise.all([analyticsPromise, gdprConsentPromise]);
        }).then(() => {
            const defaultPlacement = this._adsConfig.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());

            this._backupCampaignManager = new BackupCampaignManager(this._nativeBridge, this._coreConfig);
            this._assetManager = new AssetManager(this._cache, this._adsConfig.getCacheMode(), this._deviceInfo, this._cacheBookkeeping, this._programmaticTrackingService, this._nativeBridge, this._backupCampaignManager);
            if(this._sessionManager.getGameSessionId() % 10000 === 0) {
                this._assetManager.setCacheDiagnostics(true);
            }

            this._campaignManager = new CampaignManager(this._nativeBridge, this._coreConfig, this._adsConfig, this._assetManager, this._sessionManager, this._adMobSignalFactory, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, this._cacheBookkeeping, this._jaegerManager, this._backupCampaignManager);
            this._refreshManager = new OldCampaignRefreshManager(this._nativeBridge, this._wakeUpManager, this._campaignManager, this._adsConfig, this._focusManager, this._sessionManager, this._clientInfo, this._request, this._cache);
            const placementManager = new PlacementManager(this._nativeBridge, this._adsConfig);

            if (this._clientInfo.isMonetizationInUse()) {
                this._placementContentManager = new PlacementContentManager(this._nativeBridge, this._adsConfig, this._campaignManager, placementManager);
                this._nativePromoEventHandler = new NativePromoEventHandler(this._nativeBridge, this._clientInfo, this._request);
                this._refreshManager.subscribeNativePromoEvents(this._nativePromoEventHandler);
                this._nativePromoPlacementContentEventManager = new NativePromoPlacementContentEventManager(this._nativeBridge, this._adsConfig, this._nativePromoEventHandler);
            }

            const bannerPlacementManager = new BannerPlacementManager(this._nativeBridge, this._adsConfig);
            bannerPlacementManager.sendBannersReady();

            const bannerCampaignManager = new BannerCampaignManager(this._nativeBridge, this._coreConfig, this._adsConfig, this._assetManager, this._sessionManager, this._adMobSignalFactory, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, this._jaegerManager);
            const bannerWebPlayerContainer = new BannerWebPlayerContainer(this._nativeBridge);
            const bannerAdUnitParametersFactory = new BannerAdUnitParametersFactory(this._nativeBridge, this._request, this._metadataManager, this._coreConfig, this._adsConfig, this._container, this._deviceInfo, this._clientInfo, this._sessionManager, this._focusManager, this._analyticsManager, this._adMobSignalFactory, this._gdprManager, bannerWebPlayerContainer, this._programmaticTrackingService, this._storageBridge);
            this._bannerAdContext = new BannerAdContext(this._nativeBridge, bannerAdUnitParametersFactory, bannerCampaignManager, bannerPlacementManager, this._focusManager, this._deviceInfo);

            SdkStats.initialize(this._nativeBridge, this._request, this._coreConfig, this._adsConfig, this._sessionManager, this._campaignManager, this._metadataManager, this._clientInfo, this._cache);
            PurchasingUtilities.initialize(this._clientInfo, this._coreConfig, this._adsConfig, this._nativeBridge, placementManager, this._campaignManager, this._analyticsManager, this._promoEvents, this._request);

            const refreshSpan = this._jaegerManager.startSpan('Refresh', jaegerInitSpan.id, jaegerInitSpan.traceId);
            refreshSpan.addTag(JaegerTags.DeviceType, Platform[this._nativeBridge.getPlatform()]);
            let refreshPromise;
            if(BackupCampaignTest.isValid(this._coreConfig.getAbGroup())) {
                refreshPromise = this._refreshManager.refreshWithBackupCampaigns(this._backupCampaignManager);
            } else if(this._cachedCampaignResponse !== undefined) {
                refreshPromise = this._refreshManager.refreshFromCache(this._cachedCampaignResponse, refreshSpan);
            } else {
                refreshPromise = this._refreshManager.refresh();
            }
            return refreshPromise.then((resp) => {
                this._jaegerManager.stop(refreshSpan);
                return resp;
            }).catch((error) => {
                refreshSpan.addTag(JaegerTags.Error, 'true');
                refreshSpan.addTag(JaegerTags.ErrorMessage, error.message);
                this._jaegerManager.stop(refreshSpan);
                throw error;
            });
        }).then(() => {
            this._initialized = true;
            this._jaegerManager.stop(jaegerInitSpan);

            return this._sessionManager.sendUnsentSessions();
        }).then(() => {
            if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                if(!CustomFeatures.isAlwaysAutobatching(this._clientInfo.getGameId())) {
                    this._nativeBridge.setAutoBatchEnabled(false);
                }
                this._nativeBridge.Request.Android.setMaximumPoolSize(1);
            } else {
                this._nativeBridge.Request.setConcurrentRequestCount(1);
            }
        }).catch(error => {
            jaegerInitSpan.addAnnotation(error.message);
            jaegerInitSpan.addTag(JaegerTags.Error, 'true');
            jaegerInitSpan.addTag(JaegerTags.ErrorMessage, error.message);
            if (this._jaegerManager) {
                this._jaegerManager.stop(jaegerInitSpan);
            }

            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error && error.name === 'DisabledGame') {
                return;
            }

            this._nativeBridge.Sdk.logError(`Init error: ${JSON.stringify(error)}`);
            Diagnostics.trigger('initialization_error', error);
        });
    }

    /*
     PUBLIC API EVENT HANDLERS
     */

    public show(placementId: string, options: any, callback: INativeCallback): void {
        callback(CallbackStatus.OK);

        if(this._showing) {
            // do not send finish event because there will be a finish event from currently open ad unit
            this.showError(false, placementId, 'Can\'t show a new ad unit when ad unit is already open');
            return;
        }

        const placement: Placement = this._adsConfig.getPlacement(placementId);
        if(!placement) {
            this.showError(true, placementId, 'No such placement: ' + placementId);
            return;
        }

        const campaign = this._refreshManager.getCampaign(placementId);

        if(!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        SdkStats.sendShowEvent(placementId);

        if(campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this._refreshManager.refresh();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                willExpireAt: campaign.getWillExpireAt()
            });
            SessionDiagnostics.trigger('campaign_expired', error, campaign.getSession());
            return;
        }

        this._cacheBookkeeping.deleteCachedCampaignResponse();

        if (placement.getRealtimeData()) {
            this._nativeBridge.Sdk.logInfo('Unity Ads is requesting realtime fill for placement ' + placement.getId());
            const start = Date.now();

            const realtimeTimeoutInMillis = 1500;
            Promises.withTimeout(this._campaignManager.requestRealtime(placement, campaign.getSession()), realtimeTimeoutInMillis).then(realtimeCampaign => {
                this._requestDelay = Date.now() - start;
                this._nativeBridge.Sdk.logInfo(`Unity Ads received a realtime request in ${this._requestDelay} ms.`);

                if(realtimeCampaign) {
                    this._nativeBridge.Sdk.logInfo('Unity Ads received new fill for placement ' + placement.getId() + ', streaming new ad unit');
                    this._wasRealtimePlacement = true;
                    placement.setCurrentCampaign(realtimeCampaign);
                    this.showAd(placement, realtimeCampaign, options);
                } else {
                    SessionDiagnostics.trigger('realtime_no_fill', {}, campaign.getSession());
                    this._nativeBridge.Sdk.logInfo('Unity Ads received no new fill for placement ' + placement.getId() + ', opening old ad unit');
                    this.showAd(placement, campaign, options);
                }
            }).catch((e) => {
                if (e instanceof TimeoutError) {
                    Diagnostics.trigger('realtime_network_timeout', {
                        auctionId: campaign.getSession().getId()
                    });
                }
                Diagnostics.trigger('realtime_error', {
                    error: e
                });
                this._nativeBridge.Sdk.logInfo('Unity Ads realtime fill request for placement ' + placement.getId() + ' failed, opening old ad unit');
                this.showAd(placement, campaign, options);
            });
        } else {
            this.showAd(placement, campaign, options);
        }
    }

    public showBanner(placementId: string, callback: INativeCallback) {
        callback(CallbackStatus.OK);

        const context = this._bannerAdContext;
        context.load(placementId).catch((e) => {
            this._nativeBridge.Sdk.logWarning(`Could not show banner due to ${e.message}`);
        });
    }

    public hideBanner(callback: INativeCallback) {
        callback(CallbackStatus.OK);

        const context = this._bannerAdContext;
        context.hide();
    }

    private showAd(placement: Placement, campaign: Campaign, options: any) {
        const testGroup = this._coreConfig.getAbGroup();
        const start = Date.now();

        this._showing = true;

        if(this._adsConfig.getCacheMode() !== CacheMode.DISABLED) {
            this._assetManager.stopCaching();
        }

        Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight(),
            this._deviceInfo.getConnectionType()
        ]).then(([screenWidth, screenHeight, connectionType]) => {
            if(campaign.isConnectionNeeded() && connectionType === 'none') {
                this._showing = false;
                this.showError(true, placement.getId(), 'No connection');

                const error = new DiagnosticError(new Error('No connection is available'), {
                    id: campaign.getId()
                });
                SessionDiagnostics.trigger('mraid_no_connection', error, campaign.getSession());
                return;
            }

            const orientation = screenWidth >= screenHeight ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
            this._currentAdUnit = AdUnitFactory.createAdUnit(this._nativeBridge, {
                forceOrientation: orientation,
                focusManager: this._focusManager,
                container: this._container,
                deviceInfo: this._deviceInfo,
                clientInfo: this._clientInfo,
                thirdPartyEventManager: new ThirdPartyEventManager(this._nativeBridge, this._request, {
                    '%ZONE%': placement.getId(),
                    '%SDK_VERSION%': this._clientInfo.getSdkVersion().toString()
                }),
                operativeEventManager: OperativeEventManagerFactory.createOperativeEventManager({
                    nativeBridge: this._nativeBridge,
                    request: this._request,
                    metaDataManager: this._metadataManager,
                    sessionManager: this._sessionManager,
                    clientInfo: this._clientInfo,
                    deviceInfo: this._deviceInfo,
                    coreConfig: this._coreConfig,
                    adsConfig: this._adsConfig,
                    storageBridge: this._storageBridge,
                    campaign: campaign
                }),
                placement: placement,
                campaign: campaign,
                coreConfig: this._coreConfig,
                adsConfig: this._adsConfig,
                request: this._request,
                options: options,
                gdprManager: this._gdprManager,
                adMobSignalFactory: this._adMobSignalFactory,
                programmaticTrackingService: this._programmaticTrackingService,
                webPlayerContainer: this._interstitialWebPlayerContainer,
                gameSessionId: this._sessionManager.getGameSessionId()
            });
            this._refreshManager.setCurrentAdUnit(this._currentAdUnit);
            if (this._clientInfo.isMonetizationInUse()) {
                this._placementContentManager.setCurrentAdUnit(placement.getId(), this._currentAdUnit);
            }
            this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());

            if(this._nativeBridge.getPlatform() === Platform.IOS && (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign)) {
                if(!IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion(), this._deviceInfo.getModel()) && !campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(campaign.getAppStoreId(), 10)
                    };
                    this._nativeBridge.AppSheet.prepare(appSheetOptions).then(() => {
                        const onCloseObserver = this._nativeBridge.AppSheet.onClose.subscribe(() => {
                            this._nativeBridge.AppSheet.prepare(appSheetOptions);
                        });
                        this._currentAdUnit.onClose.subscribe(() => {
                            this._nativeBridge.AppSheet.onClose.unsubscribe(onCloseObserver);
                            if(CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
                                // app sheet is not closed properly if the user opens or downloads the game. Reset the app sheet.
                                this._nativeBridge.AppSheet.destroy();
                            } else {
                                this._nativeBridge.AppSheet.destroy(appSheetOptions);
                            }
                        });
                    });
                }
            }

            OperativeEventManager.setPreviousPlacementId(this._campaignManager.getPreviousPlacementId());
            this._campaignManager.setPreviousPlacementId(placement.getId());

            // Temporary for realtime testing purposes
            if (this._wasRealtimePlacement) {
                this._currentAdUnit.onStart.subscribe(() => {
                    const startDelay = Date.now() - start;
                    Diagnostics.trigger('realtime_delay', {
                        requestDelay: this._requestDelay,
                        startDelay: startDelay,
                        totalDelay: this._requestDelay + startDelay,
                        auctionId: campaign.getSession().getId(),
                        adUnitDescription: this._currentAdUnit.description()
                    });
                });
            }
            this._wasRealtimePlacement = false;

            this._currentAdUnit.show().then(() => {
                if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._nativeBridge.setAutoBatchEnabled(true);
                    this._nativeBridge.Request.Android.setMaximumPoolSize(8);
                } else {
                    this._nativeBridge.Request.setConcurrentRequestCount(8);
                }
            });
        });
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._nativeBridge.Sdk.logError('Show invocation failed: ' + errorMsg);
        this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if(sendFinish) {
            this._nativeBridge.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private onAdUnitClose(): void {
        this._showing = false;

        if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            if(!CustomFeatures.isAlwaysAutobatching(this._clientInfo.getGameId())) {
                this._nativeBridge.setAutoBatchEnabled(false);
            }
            this._nativeBridge.Request.Android.setMaximumPoolSize(1);
        } else {
            this._nativeBridge.Request.setConcurrentRequestCount(1);
        }
    }

    private isShowing(): boolean {
        return this._showing;
    }

    /*
     GENERIC ONERROR HANDLER
     */
    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger('js_error', {
            'message': event.message,
            'url': event.filename,
            'line': event.lineno,
            'column': event.colno,
            'object': event.error
        });
        return true; // returning true from window.onerror will suppress the error (in theory)
    }

    /*
     TEST HELPERS
     */

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this._nativeBridge)).then(() => {
            if(TestEnvironment.get('serverUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                ProgrammaticOperativeEventManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                CampaignManager.setBaseUrl(TestEnvironment.get('serverUrl'));
                AuctionRequest.setBaseUrl(TestEnvironment.get('serverUrl'));
            }

            if(TestEnvironment.get('configUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('configUrl'));
            }

            if(TestEnvironment.get('kafkaUrl')) {
                HttpKafka.setTestBaseUrl(TestEnvironment.get('kafkaUrl'));
            }

            if(TestEnvironment.get('abGroup')) {
                // needed in both due to placement level control support
                const abGroupNumber: number = Number(TestEnvironment.get('abGroup'));
                if (!isNaN(abGroupNumber)) { // if it is a number get the group
                    const abGroup = ABGroupBuilder.getAbGroup(abGroupNumber);
                    ConfigManager.setAbGroup(abGroup);
                }
            }

            if(TestEnvironment.get('campaignId')) {
                CampaignManager.setCampaignId(TestEnvironment.get('campaignId'));
            }

            if(TestEnvironment.get('sessionId')) {
                CampaignManager.setSessionId(TestEnvironment.get('sessionId'));
            }

            if(TestEnvironment.get('country')) {
                CampaignManager.setCountry(TestEnvironment.get('country'));
            }

            if(TestEnvironment.get('autoSkip')) {
                Overlay.setAutoSkip(TestEnvironment.get('autoSkip'));
            }

            if(TestEnvironment.get('autoClose')) {
                AbstractAdUnit.setAutoClose(TestEnvironment.get('autoClose'));
            }

            if(TestEnvironment.get('autoCloseDelay')) {
                AbstractAdUnit.setAutoCloseDelay(TestEnvironment.get('autoCloseDelay'));
            }

            if(TestEnvironment.get('forcedOrientation')) {
                AdUnitContainer.setForcedOrientation(TestEnvironment.get('forcedOrientation'));
            }

            if(TestEnvironment.get('forcedPlayableMRAID')) {
                AdUnitFactory.setForcedPlayableMRAID(TestEnvironment.get('forcedPlayableMRAID'));
            }

            if(TestEnvironment.get('forceAuthorization')) {
                const value = TestEnvironment.get('forceAuthorization');
                const params = value.split('|');

                if (params.length % 2 === 0) {
                    for (let i = 0; i < params.length; i += 2) {
                        Request.setAuthorizationHeaderForHost(params[i + 0], params[i + 1]);
                    }
                }
            }

            if(TestEnvironment.get('forcedGDPRBanner')) {
                AdUnitFactory.setForcedGDPRBanner(TestEnvironment.get('forcedGDPRBanner'));
            }

            let forcedARMRAID = false;
            if (TestEnvironment.get('forcedARMRAID')) {
                forcedARMRAID = TestEnvironment.get('forcedARMRAID');
                AdUnitFactory.setForcedARMRAID(forcedARMRAID);
            }

            if(TestEnvironment.get('creativeUrl')) {
                const creativeUrl = this._creativeUrl = TestEnvironment.get('creativeUrl');
                let response: string = '';
                if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    response = CreativeUrlResponseAndroid.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
                } else if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    response = CreativeUrlResponseIos.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl);
                }

                if (forcedARMRAID) {
                    response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID_AR');
                } else {
                    response = response.replace('{AD_TYPE_PLACEHOLDER}', 'MRAID');
                }

                CampaignManager.setCampaignResponse(response);
            }
        });
    }
}
