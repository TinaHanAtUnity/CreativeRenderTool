import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { Cache } from 'Utilities/Cache';
import { Placement } from 'Models/Placement';
import { Request, INativeResponse } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { EventManager } from 'Managers/EventManager';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Platform } from 'Constants/Platform';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { VastParser } from 'Utilities/VastParser';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { HttpKafka } from 'Utilities/HttpKafka';
import { ConfigError } from 'Errors/ConfigError';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AssetManager } from 'Managers/AssetManager';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { MetaData } from 'Utilities/MetaData';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { StorageType } from 'Native/Api/Storage';
import { AuctionCampaignManager } from 'Managers/AuctionCampaignManager';
import { LegacyCampaignManager } from 'Managers/LegacyCampaignManager';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _configuration: Configuration;

    private _campaignManager: CampaignManager;
    private _campaignRefreshManager: CampaignRefreshManager;
    private _assetManager: AssetManager;
    private _cache: Cache;
    private _container: AdUnitContainer;

    private _currentAdUnit: AbstractAdUnit;

    private _sessionManager: SessionManager;
    private _eventManager: EventManager;
    private _wakeUpManager: WakeUpManager;
    private _analyticsManager: AnalyticsManager;

    private _showing: boolean = false;
    private _initialized: boolean = false;
    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    private _metadataManager: MetaDataManager;

    // constant value that determines the delay for refreshing ads after backend has processed a start event
    // set to five seconds because backend should usually process start event in less than one second but
    // we want to be safe in case of error situations on the backend and mistimings on the device
    // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
    private _startRefreshMagicConstant: number = 5000;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(<ErrorEvent>event), false);
        }
    }

    public initialize(): Promise<void | any[]> {
        return this._nativeBridge.Sdk.loadComplete().then((data) => {
            this._deviceInfo = new DeviceInfo(this._nativeBridge);
            this._wakeUpManager = new WakeUpManager(this._nativeBridge);
            this._request = new Request(this._nativeBridge, this._wakeUpManager);
            this._cache = new Cache(this._nativeBridge, this._wakeUpManager, this._request);
            this._resolve = new Resolve(this._nativeBridge);
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);
            this._eventManager = new EventManager(this._nativeBridge, this._request);
            this._metadataManager = new MetaDataManager(this._nativeBridge);

            HttpKafka.setRequest(this._request);
            HttpKafka.setClientInfo(this._clientInfo);

            return this._deviceInfo.fetch();
        }).then(() => {
            return this._cache.cleanCache().catch(error => {
                // don't fail init due to cache cleaning issues, instead just log and report diagnostics
                this._nativeBridge.Sdk.logError('Unity Ads cleaning cache failed: ' + error);
                Diagnostics.trigger('cleaning_cache_failed', error);
            });
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
                this._container = new Activity(this._nativeBridge, this._deviceInfo);
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                const model = this._deviceInfo.getModel();
                if(model.match(/iphone/i) || model.match(/ipod/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
                this._container = new ViewController(this._nativeBridge, this._deviceInfo);
            }
            HttpKafka.setDeviceInfo(this._deviceInfo);
            this._sessionManager = new SessionManager(this._nativeBridge, this._clientInfo, this._deviceInfo, this._eventManager, this._metadataManager);

            this._initializedAt = this._configJsonCheckedAt = Date.now();
            this._nativeBridge.Sdk.initComplete();

            this._wakeUpManager.setListenConnectivity(true);
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._wakeUpManager.setListenAppForeground(true);
            } else {
                this._wakeUpManager.setListenScreen(true);
            }

            return this.setupTestEnvironment();
        }).then(() => {
            return ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo, this._metadataManager);
        }).then((configuration) => {
            this._configuration = configuration;
            HttpKafka.setConfiguration(this._configuration);

            if (!this._configuration.isEnabled()) {
                const error = new Error('Game with ID ' + this._clientInfo.getGameId() +  ' is not enabled');
                error.name = 'DisabledGame';
                throw error;
            }

            if(this._configuration.isAnalyticsEnabled()) {
                if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this._wakeUpManager.setListenAndroidLifecycle(true);
                }

                this._analyticsManager = new AnalyticsManager(this._nativeBridge, this._wakeUpManager, this._request, this._clientInfo, this._deviceInfo);
                return this._analyticsManager.init().then(() => {
                    this._sessionManager.setGameSessionId(this._analyticsManager.getGameSessionId());
                    return this._sessionManager.create();
                });
            } else {
                const analyticsStorage: AnalyticsStorage = new AnalyticsStorage(this._nativeBridge);
                return analyticsStorage.getSessionId(this._clientInfo.isReinitialized()).then(gameSessionId => {
                    analyticsStorage.setSessionId(gameSessionId);
                    this._sessionManager.setGameSessionId(gameSessionId);
                    return this._sessionManager.create();
                });
            }
        }).then(() => {
            if(this._sessionManager.getGameSessionId() % 10000 === 0) {
                this._cache.setDiagnostics(true);
            }

            const defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());

            this._assetManager = new AssetManager(this._cache, this._configuration.getCacheMode(), this._deviceInfo);
            if(this._configuration.isAuction()) {
                this._campaignManager = new AuctionCampaignManager(this._nativeBridge, this._configuration, this._assetManager, this._sessionManager, this._request, this._clientInfo, this._deviceInfo, new VastParser(), this._metadataManager);
            } else {
                this._campaignManager = new LegacyCampaignManager(this._nativeBridge, this._configuration, this._assetManager, this._sessionManager, this._request, this._clientInfo, this._deviceInfo, new VastParser(), this._metadataManager);
            }
            this._campaignRefreshManager = new CampaignRefreshManager(this._nativeBridge, this._wakeUpManager, this._campaignManager, this._configuration);
            return this._campaignRefreshManager.refresh();
        }).then(() => {
            this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
            } else {
                this._wakeUpManager.onScreenOn.subscribe(() => this.onScreenOn());
            }

            this._initialized = true;

            return this._eventManager.sendUnsentSessions();
        }).catch(error => {
            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error && error.name === 'DisabledGame') {
                return;
            } else if(error instanceof Error) {
                error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
                if(error.message === UnityAdsError[UnityAdsError.INVALID_ARGUMENT]) {
                    this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], 'Game ID is not valid');
                }
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

        const campaign = this._campaignRefreshManager.getCampaign(placementId);

        if(!campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        if(campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this._campaignRefreshManager.refresh();

            const error = new DiagnosticError(new Error('Campaign expired'), {
                id: campaign.getId(),
                timeoutInSeconds: campaign.getTimeout()
            });
            Diagnostics.trigger('campaign_expired', error);
            return;
        }

        this._showing = true;

        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
        });

        if(this._configuration.getCacheMode() !== CacheMode.DISABLED) {
            this._assetManager.stopCaching();
        }

        Promise.all([
            this._deviceInfo.getScreenWidth(),
            this._deviceInfo.getScreenHeight()
        ]).then(([screenWidth, screenHeight]) => {
            const orientation = screenWidth >= screenHeight ? ForceOrientation.LANDSCAPE : ForceOrientation.PORTRAIT;
            this._currentAdUnit = AdUnitFactory.createAdUnit(this._nativeBridge, orientation, this._container, this._deviceInfo, this._sessionManager, placement, campaign, this._configuration, this._clientInfo, options);
            this._campaignRefreshManager.setCurrentAdUnit(this._currentAdUnit);
            this._currentAdUnit.onStartProcessed.subscribe(() => this.onAdUnitStartProcessed());
            this._currentAdUnit.onFinish.subscribe(() => this.onAdUnitFinish());
            this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());

            if(this._nativeBridge.getPlatform() === Platform.IOS && campaign instanceof PerformanceCampaign) {
                if(!IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()) && !campaign.getBypassAppSheet()) {
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

            this._sessionManager.setPreviousPlacementId(this._campaignManager.getPreviousPlacementId());
            this._campaignManager.setPreviousPlacementId(placementId);
            this._currentAdUnit.show();
        });
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._nativeBridge.Sdk.logError('Show invocation failed: ' + errorMsg);
        this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if(sendFinish) {
            this._nativeBridge.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private onAdUnitStartProcessed(): void {
        if(this._currentAdUnit) {
            setTimeout(() => {
                if(!this._mustReinitialize && this._currentAdUnit && this._currentAdUnit.isCached()) {
                    this._campaignRefreshManager.refresh();
                }
            }, this._startRefreshMagicConstant);
        }
    }

    private onAdUnitFinish(): void {
        if(!this._mustReinitialize) {
            this._campaignRefreshManager.refresh();
        }
    }

    private onAdUnitClose(): void {
        this._nativeBridge.Sdk.logInfo('Closing Unity Ads ad unit');
        this._showing = false;
        if(this._mustReinitialize) {
            this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
            this.reinitialize();
        } else {
            this._sessionManager.create();
            this._campaignRefreshManager.refresh();
        }
    }

    private isShowing(): boolean {
        return this._showing;
    }

    /*
     CONNECTIVITY AND USER ACTIVITY EVENT HANDLERS
     */

    private onNetworkConnected() {
        if(!this.isShowing() && this._initialized) {
            this.shouldReinitialize().then((reinitialize) => {
                if(reinitialize) {
                    if(this.isShowing()) {
                        this._mustReinitialize = true;
                    } else {
                        this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
                        this.reinitialize();
                    }
                } else {
                    this._campaignRefreshManager.refresh();
                    this._eventManager.sendUnsentSessions();
                }
            });
        }
    }

    private onScreenOn(): void {
        this._campaignRefreshManager.refresh();
    }

    private onAppForeground(): void {
        this._campaignRefreshManager.refresh();
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
     REINITIALIZE LOGIC
     */

    private reinitialize() {
        // save caching pause state in case of reinit
        if(this._cache.isPaused()) {
            Promise.all([this._nativeBridge.Storage.set(StorageType.PUBLIC, 'caching.pause.value', true), this._nativeBridge.Storage.write(StorageType.PUBLIC)]).then(() => {
                this._nativeBridge.Sdk.reinitialize();
            }).catch(() => {
                this._nativeBridge.Sdk.reinitialize();
            });
        } else {
            this._nativeBridge.Sdk.reinitialize();
        }
    }

    private getConfigJson(): Promise<INativeResponse> {
        return this._request.get(this._clientInfo.getConfigUrl() + '?ts=' + Date.now() + '&sdkVersion=' + this._clientInfo.getSdkVersion());
    }

    private shouldReinitialize(): Promise<boolean> {
        if(!this._clientInfo.getWebviewHash()) {
            return Promise.resolve(false);
        }
        if(Date.now() - this._configJsonCheckedAt <= 15 * 60 * 1000) {
            return Promise.resolve(false);
        }
        return this.getConfigJson().then(response => {
            this._configJsonCheckedAt = Date.now();
            const configJson = JsonParser.parse(response.response);
            return configJson.hash !== this._clientInfo.getWebviewHash();
        }).catch((error) => {
            return false;
        });
    }

    /*
     TEST HELPERS
     */

    private setupTestEnvironment(): Promise<void> {
        return TestEnvironment.setup(new MetaData(this._nativeBridge)).then(() => {
            if(TestEnvironment.get('serverUrl')) {
                ConfigManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                LegacyCampaignManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                SessionManager.setTestBaseUrl(TestEnvironment.get('serverUrl'));
                AuctionCampaignManager.setAuctionBaseUrl(TestEnvironment.get('serverUrl'));
            }

            if(TestEnvironment.get('kafkaUrl')) {
                HttpKafka.setTestBaseUrl(TestEnvironment.get('kafkaurl'));
            }

            if(TestEnvironment.get('abGroup')) {
                // needed in both due to placement level control support
                ConfigManager.setAbGroup(TestEnvironment.get('abGroup'));
                CampaignManager.setAbGroup(TestEnvironment.get('abGroup'));
            }

            if(TestEnvironment.get('campaignId')) {
                CampaignManager.setCampaignId(TestEnvironment.get('campaignId'));
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

            if (TestEnvironment.get('forcedOrientation')) {
                AdUnitContainer.setForcedOrientation(TestEnvironment.get('forcedOrientation'));
            }
            return;
        });
    }
}
