import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';
import { CampaignManager } from 'Managers/CampaignManager';
import { Cache } from 'Utilities/Cache';
import { Placement } from 'Models/Placement';
import { Request, INativeResponse } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Platform } from 'Constants/Platform';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { HttpKafka } from 'Utilities/HttpKafka';
import { ConfigError } from 'Errors/ConfigError';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AssetManager } from 'Managers/AssetManager';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { MetaData } from 'Utilities/MetaData';
import { RefreshManager } from 'Managers/RefreshManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { SdkStats } from 'Utilities/SdkStats';
import { Campaign } from 'Models/Campaign';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { IosDeviceInfo } from 'Models/IosDeviceInfo';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { OldCampaignRefreshManager } from 'Managers/OldCampaignRefreshManager';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { MissedImpressionManager } from 'Managers/MissedImpressionManager';
import { GameSessionCounters } from 'Utilities/GameSessionCounters';
import { TimeoutError, Promises } from 'Utilities/Promises';
import { JaegerSpan, JaegerTags } from 'Jaeger/JaegerSpan';
import { JaegerManager } from 'Jaeger/JaegerManager';
import { ProgrammaticOperativeEventManager } from 'Managers/ProgrammaticOperativeEventManager';
import { GdprManager } from 'Managers/GdprManager';

import CreativeUrlConfiguration from 'json/CreativeUrlConfiguration.json';
import CreativeUrlResponseAndroid from 'json/CreativeUrlResponseAndroid.json';
import CreativeUrlResponseIos from 'json/CreativeUrlResponseIos.json';
import { ABGroupBuilder } from 'Models/ABGroup';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _configuration: Configuration;

    private _campaignManager: CampaignManager;
    private _refreshManager: RefreshManager;
    private _assetManager: AssetManager;
    private _cache: Cache;
    private _cacheBookkeeping: CacheBookkeeping;
    private _container: AdUnitContainer;

    private _currentAdUnit: AbstractAdUnit;

    private _sessionManager: SessionManager;
    private _wakeUpManager: WakeUpManager;
    private _focusManager: FocusManager;
    private _analyticsManager: AnalyticsManager;
    private _adMobSignalFactory: AdMobSignalFactory;
    private _missedImpressionManager: MissedImpressionManager;
    private _gdprManager: GdprManager;
    private _jaegerManager: JaegerManager;
    private _programmaticTrackingService: ProgrammaticTrackingService;

    private _showing: boolean = false;
    private _initialized: boolean = false;
    private _initializedAt: number;

    private _metadataManager: MetaDataManager;

    private _creativeUrl?: string;
    private _requestDelay: number;
    private _wasRealtimePlacement: boolean = false;

    private _cachedCampaignResponse: INativeResponse | undefined;

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

            this._focusManager = new FocusManager(this._nativeBridge);
            this._wakeUpManager = new WakeUpManager(this._nativeBridge, this._focusManager);
            this._request = new Request(this._nativeBridge, this._wakeUpManager);
            this._cacheBookkeeping = new CacheBookkeeping(this._nativeBridge);
            this._programmaticTrackingService = new ProgrammaticTrackingService(this._request, this._clientInfo, this._deviceInfo);
            this._cache = new Cache(this._nativeBridge, this._wakeUpManager, this._request, this._cacheBookkeeping, this._programmaticTrackingService);
            this._resolve = new Resolve(this._nativeBridge);
            this._metadataManager = new MetaDataManager(this._nativeBridge);
            this._adMobSignalFactory = new AdMobSignalFactory(this._nativeBridge, this._clientInfo, this._deviceInfo, this._focusManager);
            this._jaegerManager = new JaegerManager(this._request);
            this._jaegerManager.addOpenSpan(jaegerInitSpan);

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
            this._sessionManager = new SessionManager(this._nativeBridge, this._request);

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
                configPromise = Promise.resolve(ConfigurationParser.parse(JsonParser.parse(CreativeUrlConfiguration)));
            } else {
                configPromise = ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, configSpan);
            }
            configPromise.then((configuration) => {
                this._jaegerManager.stop(configSpan);
                return configuration;
            }).catch((error) => {
                this._jaegerManager.stop(configSpan);
                throw new Error(error);
            });

            const cachePromise = this._cacheBookkeeping.cleanCache().catch(error => {
                // don't fail init due to cache cleaning issues, instead just log and report diagnostics
                this._nativeBridge.Sdk.logError('Unity Ads cleaning cache failed: ' + error);
                Diagnostics.trigger('cleaning_cache_failed', error);
            });

            const cachedCampaignResponsePromise = this._cacheBookkeeping.getCachedCampaignResponse();

            return Promise.all([configPromise, cachedCampaignResponsePromise, cachePromise]);
        }).then(([configuration, cachedCampaignResponse]) => {
            this._gdprManager = new GdprManager(this._nativeBridge, this._deviceInfo, this._clientInfo, configuration, this._request);
            this._configuration = configuration;
            this._cachedCampaignResponse = cachedCampaignResponse;
            HttpKafka.setConfiguration(this._configuration);
            this._jaegerManager.setJaegerTracingEnabled(this._configuration.isJaegerTracingEnabled());

            PurchasingUtilities.initialize(this._clientInfo, this._configuration, this._nativeBridge);
            PurchasingUtilities.sendPurchaseInitializationEvent();

            if (!this._configuration.isEnabled()) {
                const error = new Error('Game with ID ' + this._clientInfo.getGameId() +  ' is not enabled');
                error.name = 'DisabledGame';
                throw error;
            }

            let analyticsPromise;
            if(this._configuration.isAnalyticsEnabled() || CustomFeatures.isExampleGameId(this._clientInfo.getGameId())) {
                this._analyticsManager = new AnalyticsManager(this._nativeBridge, this._wakeUpManager, this._request, this._clientInfo, this._deviceInfo, this._configuration, this._focusManager);
                analyticsPromise = this._analyticsManager.init().then(() => {
                    this._sessionManager.setGameSessionId(this._analyticsManager.getGameSessionId());
                });
            } else {
                const analyticsStorage: AnalyticsStorage = new AnalyticsStorage(this._nativeBridge);
                analyticsPromise = analyticsStorage.getSessionId(this._clientInfo.isReinitialized()).then(gameSessionId => {
                    analyticsStorage.setSessionId(gameSessionId);
                    this._sessionManager.setGameSessionId(gameSessionId);
                });
            }
            const gdprConsentPromise = this._gdprManager.getConsentAndUpdateConfiguration().catch((error) => {
                // do nothing
                // error happens when consent value is undefined
            });
            return Promise.all([analyticsPromise, gdprConsentPromise]);
        }).then(() => {
            if(this._sessionManager.getGameSessionId() % 10000 === 0) {
                this._cache.setDiagnostics(true);
            }

            const defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());

            this._assetManager = new AssetManager(this._cache, this._configuration.getCacheMode(), this._deviceInfo, this._cacheBookkeeping, this._nativeBridge);
            this._campaignManager = new CampaignManager(this._nativeBridge, this._configuration, this._assetManager, this._sessionManager, this._adMobSignalFactory, this._request, this._clientInfo, this._deviceInfo, this._metadataManager, this._cacheBookkeeping, this._jaegerManager);

            this._refreshManager = new OldCampaignRefreshManager(this._nativeBridge, this._wakeUpManager, this._campaignManager, this._configuration, this._focusManager, this._sessionManager, this._clientInfo, this._request, this._cache);

            SdkStats.initialize(this._nativeBridge, this._request, this._configuration, this._sessionManager, this._campaignManager, this._metadataManager, this._clientInfo);

            const refreshSpan = this._jaegerManager.startSpan('Refresh', jaegerInitSpan.id, jaegerInitSpan.traceId);
            refreshSpan.addTag(JaegerTags.DeviceType, Platform[this._nativeBridge.getPlatform()]);
            let refreshPromise;
            if (this._cachedCampaignResponse !== undefined) {
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
                this._nativeBridge.setAutoBatchEnabled(false);
                this._nativeBridge.Request.Android.setMaximumPoolSize(1);
            } else {
                this._nativeBridge.Request.setConcurrentRequestCount(1);
            }
        }).catch(error => {
            jaegerInitSpan.addAnnotation(error.message);
            jaegerInitSpan.addTag(JaegerTags.Error, 'true');
            jaegerInitSpan.addTag(JaegerTags.ErrorMessage, error.message);
            this._jaegerManager.stop(jaegerInitSpan);

            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error && error.name === 'DisabledGame') {
                return;
            }

            this._nativeBridge.Sdk.logError(JSON.stringify(error));
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

        const placement: Placement = this._configuration.getPlacement(placementId);
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
            Diagnostics.trigger('campaign_expired', error, campaign.getSession());
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
                    Diagnostics.trigger('realtime_no_fill', {}, campaign.getSession());
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

    private showAd(placement: Placement, campaign: Campaign, options: any) {
        const testGroup = this._configuration.getAbGroup();
        const start = Date.now();

        this._showing = true;

        if(this._configuration.getCacheMode() !== CacheMode.DISABLED) {
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
                Diagnostics.trigger('mraid_no_connection', error, campaign.getSession());
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
                    configuration: this._configuration,
                    campaign: campaign
                }),
                placement: placement,
                campaign: campaign,
                configuration: this._configuration,
                request: this._request,
                options: options,
                gdprManager: this._gdprManager,
                adMobSignalFactory: this._adMobSignalFactory,
                programmaticTrackingService: this._programmaticTrackingService
            });
            this._refreshManager.setCurrentAdUnit(this._currentAdUnit);
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
                            this._nativeBridge.AppSheet.destroy(appSheetOptions);
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
            this._nativeBridge.setAutoBatchEnabled(false);
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
                    CampaignManager.setAbGroup(abGroup);
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

            if(TestEnvironment.get('creativeUrl')) {
                const creativeUrl = this._creativeUrl = TestEnvironment.get('creativeUrl');
                if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    CampaignManager.setCampaignResponse(CreativeUrlResponseAndroid.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl));
                } else if(this._nativeBridge.getPlatform() === Platform.IOS) {
                    CampaignManager.setCampaignResponse(CreativeUrlResponseIos.replace('{CREATIVE_URL_PLACEHOLDER}', creativeUrl));
                }
            }
        });
    }
}
