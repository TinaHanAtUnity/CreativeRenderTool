import { NativeBridge, INativeCallback, CallbackStatus } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ConfigManager } from 'Managers/ConfigManager';
import { Configuration, CacheMode } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { Cache } from 'Utilities/Cache';
import { Placement, PlacementState } from 'Models/Placement';
import { Request, INativeResponse } from 'Utilities/Request';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { Diagnostics } from 'Utilities/Diagnostics';
import { EventManager } from 'Managers/EventManager';
import { FinishState } from 'Constants/FinishState';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { Platform } from 'Constants/Platform';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Resolve } from 'Utilities/Resolve';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { VastParser } from 'Utilities/VastParser';
import { JsonParser } from 'Utilities/JsonParser';
import { MetaData } from 'Utilities/MetaData';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Overlay } from 'Views/Overlay';
import { IosUtils } from 'Utilities/IosUtils';
import { HttpKafka } from 'Utilities/HttpKafka';
import { ConfigError } from 'Errors/ConfigError';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { AssetManager } from 'Managers/AssetManager';
import { WebViewError } from 'Errors/WebViewError';
import { AdUnit } from 'Utilities/AdUnit';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';
import { IosAdUnit } from 'Utilities/IosAdUnit';

export class WebView {

    private _nativeBridge: NativeBridge;

    private _deviceInfo: DeviceInfo;
    private _clientInfo: ClientInfo;

    private _request: Request;
    private _resolve: Resolve;
    private _configuration: Configuration;

    private _campaignManager: CampaignManager;
    private _cache: Cache;
    private _adUnit: AdUnit;

    private _currentAdUnit: AbstractAdUnit;
    private _campaign: Campaign;

    private _sessionManager: SessionManager;
    private _eventManager: EventManager;
    private _wakeUpManager: WakeUpManager;

    private _showing: boolean = false;
    private _initialized: boolean = false;
    private _initializedAt: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;

        if(window && window.addEventListener) {
            window.addEventListener('error', (event) => this.onError(<ErrorEvent>event), false);
        }
    }

    public initialize(): Promise<void> {
        return this._nativeBridge.Sdk.loadComplete().then((data) => {
            this._deviceInfo = new DeviceInfo(this._nativeBridge);
            this._wakeUpManager = new WakeUpManager(this._nativeBridge);
            this._cache = new Cache(this._nativeBridge, this._wakeUpManager);
            this._cache.cleanCache();
            this._request = new Request(this._nativeBridge, this._wakeUpManager);
            this._resolve = new Resolve(this._nativeBridge);
            this._clientInfo = new ClientInfo(this._nativeBridge.getPlatform(), data);
            this._eventManager = new EventManager(this._nativeBridge, this._request);
            HttpKafka.setRequest(this._request);
            HttpKafka.setClientInfo(this._clientInfo);

            return this._deviceInfo.fetch();
        }).then(() => {
            if(this._clientInfo.getPlatform() === Platform.ANDROID) {
                document.body.classList.add('android');
                this._nativeBridge.setApiLevel(this._deviceInfo.getApiLevel());
                this._adUnit = new AndroidAdUnit(this._nativeBridge, this._deviceInfo);
            } else if(this._clientInfo.getPlatform() === Platform.IOS) {
                const model = this._deviceInfo.getModel();
                if(model.match(/iphone/i) || model.match(/ipod/i)) {
                    document.body.classList.add('iphone');
                } else if(model.match(/ipad/i)) {
                    document.body.classList.add('ipad');
                }
                this._adUnit = new IosAdUnit(this._nativeBridge, this._deviceInfo);
            }
            HttpKafka.setDeviceInfo(this._deviceInfo);
            this._sessionManager = new SessionManager(this._nativeBridge, this._clientInfo, this._deviceInfo, this._eventManager);

            this._initializedAt = this._configJsonCheckedAt = Date.now();
            this._nativeBridge.Sdk.initComplete();

            this._wakeUpManager.setListenConnectivity(true);
            this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());

            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                this._wakeUpManager.setListenAppForeground(true);
                this._wakeUpManager.onAppForeground.subscribe(() => this.onAppForeground());
            } else {
                this._wakeUpManager.setListenScreen(true);
                this._wakeUpManager.onScreenOn.subscribe(() => this.onScreenOn());
            }

            return this.setupTestEnvironment();
        }).then(() => {
            return ConfigManager.fetch(this._nativeBridge, this._request, this._clientInfo, this._deviceInfo);
        }).then((configuration) => {
            this._configuration = configuration;
            HttpKafka.setConfiguration(this._configuration);
            return this._sessionManager.create();
        }).then(() => {
            const defaultPlacement = this._configuration.getDefaultPlacement();
            this._nativeBridge.Placement.setDefaultPlacement(defaultPlacement.getId());
            this.setPlacementStates(PlacementState.NOT_AVAILABLE);
            this._campaignManager = new CampaignManager(this._nativeBridge, new AssetManager(this._cache, this._configuration.getCacheMode()), this._request, this._clientInfo, this._deviceInfo, new VastParser());
            this._campaignManager.onPerformanceCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onVastCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onThirdPartyCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onNoFill.subscribe(() => this.onNoFill());
            this._campaignManager.onError.subscribe(error => this.onCampaignError(error));
            return this._campaignManager.request();
        }).then(() => {
            this._initialized = true;

            return this._eventManager.sendUnsentSessions();
        }).catch(error => {
            if(error instanceof ConfigError) {
                error = { 'message': error.message, 'name': error.name };
                this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INITIALIZE_FAILED], error.message);
            } else if(error instanceof Error) {
                error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
                if(error.message === UnityAdsError[UnityAdsError.INVALID_ARGUMENT]) {
                    this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.INVALID_ARGUMENT], 'Game ID is not valid');
                }
            }
            this._nativeBridge.Sdk.logError(JSON.stringify(error));
            Diagnostics.trigger({
                'type': 'initialization_error',
                'error': error
            });
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

        if(!this._campaign) {
            this.showError(true, placementId, 'Campaign not found');
            return;
        }

        if(this._campaign.isExpired()) {
            this.showError(true, placementId, 'Campaign has expired');
            this.onCampaignExpired(this._campaign);
            return;
        }

        this._showing = true;

        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
        });

        if(this._configuration.getCacheMode() === CacheMode.ALLOWED) {
            this._cache.stop();
        }

        MetaDataManager.fetchPlayerMetaData(this._nativeBridge).then(player => {
            if(player) {
                this._sessionManager.setGamerServerId(player.getServerId());
            }

            this._currentAdUnit = AdUnitFactory.createAdUnit(this._nativeBridge, this._adUnit, this._deviceInfo, this._sessionManager, placement, this._campaign, this._configuration, options);
            this._currentAdUnit.onFinish.subscribe(() => this.onNewAdRequestAllowed());
            this._currentAdUnit.onClose.subscribe(() => this.onClose());

            if (this._nativeBridge.getPlatform() === Platform.IOS && this._campaign instanceof PerformanceCampaign) {
                if(!IosUtils.isAppSheetBroken(this._deviceInfo.getOsVersion()) && !this._campaign.getBypassAppSheet()) {
                    const appSheetOptions = {
                        id: parseInt(this._campaign.getAppStoreId(), 10)
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

            this._currentAdUnit.show();

            delete this._campaign;
            this.setPlacementStates(PlacementState.WAITING);
        });
    }

    private showError(sendFinish: boolean, placementId: string, errorMsg: string): void {
        this._nativeBridge.Sdk.logError('Show invocation failed: ' + errorMsg);
        this._nativeBridge.Listener.sendErrorEvent(UnityAdsError[UnityAdsError.SHOW_ERROR], errorMsg);
        if(sendFinish) {
            this._nativeBridge.Listener.sendFinishEvent(placementId, FinishState.ERROR);
        }
    }

    private setPlacementStates(placementState: PlacementState): void {
        const placements: { [id: string]: Placement } = this._configuration.getPlacements();
        for(const placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                const placement: Placement = placements[placementId];
                this._nativeBridge.Placement.setPlacementState(placement.getId(), placementState);
                if(placementState === PlacementState.READY) {
                    this._nativeBridge.Listener.sendReadyEvent(placement.getId());
                }
            }
        }
    }

    private onCampaign(campaign: Campaign) {
        this._campaign = campaign;
        if(this._showing) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.READY);
            });
        } else {
            this.setPlacementStates(PlacementState.READY);
        }
    }

    private onNoFill() {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.setPlacementStates(PlacementState.NO_FILL);
    }

    private onCampaignError(error: WebViewError | Error) {
        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }
        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger({
            'type': 'campaign_request_failed',
            'error': error
        });
        this.onNoFill();
    }

    private onCampaignExpired(campaign: Campaign) {
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL);
        this._campaignManager.request();

        const error = new DiagnosticError(new Error('Campaign expired'), {
            id: this._campaign.getId(),
            timeoutInSeconds: this._campaign.getTimeout()
        });

        Diagnostics.trigger({
            type: 'campaign_expired',
            error: error
        });
    }

    private onNewAdRequestAllowed(): void {
        if(!this._mustReinitialize && !this._campaign) {
            this._campaignManager.request();
        }
    }

    private onClose(): void {
        this._nativeBridge.Sdk.logInfo('Closing Unity Ads ad unit');
        this._showing = false;
        if(this._mustReinitialize) {
            this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
            this.reinitialize();
        } else {
            this._sessionManager.create();
            if(!this._campaign) {
                this._campaignManager.request();
            }
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
                    this.checkCampaignStatus();
                    this._eventManager.sendUnsentSessions();
                }
            });
        }
    }

    private onScreenOn(): void {
        this.checkCampaignStatus();
    }

    private onAppForeground(): void {
        this.checkCampaignStatus();
    }

    private checkCampaignStatus(): void {
        if(!this._campaign) {
            this._campaignManager.request();
        } else if(this._campaign.isExpired()) {
            this.onCampaignExpired(this._campaign);
        }
    }

    /*
     GENERIC ONERROR HANDLER
     */
    private onError(event: ErrorEvent): boolean {
        Diagnostics.trigger({
            'type': 'js_error',
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
        this._nativeBridge.Sdk.reinitialize();
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

    private setupTestEnvironment(): void {
        const metaData: MetaData = new MetaData(this._nativeBridge);

        metaData.get<string>('test.serverUrl', true).then(([found, url]) => {
            if(found && url) {
                ConfigManager.setTestBaseUrl(url);
                CampaignManager.setTestBaseUrl(url);
                SessionManager.setTestBaseUrl(url);
            }
        });

        metaData.get<string>('test.kafkaUrl', true).then(([found, url]) => {
            if(found && url) {
                HttpKafka.setTestBaseUrl(url);
            }
        });

        metaData.get<string>('test.abGroup', true).then(([found, abGroup]) => {
            if(found && typeof abGroup === 'number') {
                CampaignManager.setAbGroup(abGroup);
            }
        });

        metaData.get<string>('test.campaignId', true).then(([found, campaignId]) => {
            if(found && typeof campaignId === 'string') {
                CampaignManager.setCampaignId(campaignId);
            }
        });

        metaData.get<string>('test.country', true).then(([found, country]) => {
            if(found && typeof country === 'string') {
                CampaignManager.setCountry(country);
            }
        });

        metaData.get<boolean>('test.autoSkip', true).then(([found, autoSkip]) => {
            if(found && autoSkip !== null) {
                Overlay.setAutoSkip(autoSkip);
            }
        });

        metaData.get<boolean>('test.autoClose', false).then(([found, autoClose]) => {
            if(found && autoClose) {
                AbstractAdUnit.setAutoClose(autoClose);
            }
        });

        metaData.get<number>('test.autoCloseDelay', false).then(([found, autoCloseDelay]) => {
            if(found && typeof autoCloseDelay === 'number') {
                AbstractAdUnit.setAutoCloseDelay(autoCloseDelay);
            }
        });

        metaData.get<string>('test.campaignResponse', false).then(([found, campaignResponse]) => {
            if(found && typeof campaignResponse === 'string') {
                CampaignManager.setCampaignResponse(campaignResponse);
            }
        });
    }
}
