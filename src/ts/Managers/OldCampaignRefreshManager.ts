import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { Placement, PlacementState } from 'Models/Placement';
import { Configuration } from 'Models/Configuration';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Request, INativeResponse } from 'Utilities/Request';
import { Session } from 'Models/Session';
import { FocusManager } from 'Managers/FocusManager';
import { SdkStats } from 'Utilities/SdkStats';
import { Platform } from 'Constants/Platform';
import { RefreshManager } from 'Managers/RefreshManager';
import { SessionManager } from 'Managers/SessionManager';
import { JsonParser } from 'Utilities/JsonParser';
import { StorageType } from 'Native/Api/Storage';
import { ClientInfo } from 'Models/ClientInfo';
import { Cache } from 'Utilities/Cache';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { JaegerSpan } from 'Jaeger/JaegerSpan';

export class OldCampaignRefreshManager extends RefreshManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;
    private _focusManager: FocusManager;
    private _sessionManager: SessionManager;
    private _clientInfo: ClientInfo;
    private _request: Request;
    private _cache: Cache;
    private _refillTimestamp: number;
    private _needsRefill = true;
    private _refreshAllowed = true;
    private _campaignCount: number;
    private _parsingErrorCount: number;
    private _noFills: number;
    private _mustReinitialize: boolean = false;
    private _configJsonCheckedAt: number;

    // constant value that determines the delay for refreshing ads after backend has processed a start event
    // set to five seconds because backend should usually process start event in less than one second but
    // we want to be safe in case of error situations on the backend and mistimings on the device
    // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
    private _startRefreshMagicConstant: number = 5000;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration, focusManager: FocusManager, sessionManager: SessionManager, clientInfo: ClientInfo, request: Request, cache: Cache) {
        super();

        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._focusManager = focusManager;
        this._sessionManager = sessionManager;
        this._clientInfo = clientInfo;
        this._request = request;
        this._cache = cache;
        this._refillTimestamp = 0;
        this._campaignCount = 0;
        this._parsingErrorCount = 0;
        this._noFills = 0;
        this._configJsonCheckedAt = Date.now();
        this._mustReinitialize = false;

        this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onCampaign(placementId, campaign));
        this._campaignManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds, diagnosticsType, session) => this.onError(error, placementIds, diagnosticsType, session));
        this._campaignManager.onConnectivityError.subscribe((placementIds) => this.onConnectivityError(placementIds));
        this._campaignManager.onAdPlanReceived.subscribe((refreshDelay, campaignCount) => this.onAdPlanReceived(refreshDelay, campaignCount));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        } else {
            this._focusManager.onScreenOn.subscribe(() => this.onScreenOn());
            this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        }
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        this.shouldReinitialize().then((reinitialize) => {
            this._mustReinitialize = reinitialize;
            this.setRefreshAllowed(!reinitialize);
        });

        this._currentAdUnit = adUnit;
        const onStartObserver = this._currentAdUnit.onStart.subscribe(() => {
            this._currentAdUnit.onStart.unsubscribe(onStartObserver);
            this.invalidateCampaigns(true, this._configuration.getPlacementIds());
            this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
        });
        this._currentAdUnit.onStartProcessed.subscribe(() => this.onAdUnitStartProcessed());
        this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());
        this._currentAdUnit.onFinish.subscribe(() => this.onAdUnitFinish());
    }

    public setRefreshAllowed(bool: boolean) {
        this._refreshAllowed = bool;
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        if(!this._refreshAllowed) {
            return Promise.resolve();
        }
        if(this.shouldRefill(this._refillTimestamp)) {
            this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false, this._configuration.getPlacementIds());
            this._campaignCount = 0;
            return this._campaignManager.request(nofillRetry);
        } else if(this.checkForExpiredCampaigns()) {
            return this.onCampaignExpired();
        }

        return Promise.resolve();
    }

    public refreshFromCache(cachedResponse: INativeResponse, span: JaegerSpan): Promise<INativeResponse | void> {
        if(!this._refreshAllowed) {
            span.addAnnotation('refresh not allowed');
            return Promise.resolve();
        }
        if(this.shouldRefill(this._refillTimestamp)) {
            span.addAnnotation('should refill');
            this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false, this._configuration.getPlacementIds());
            this._campaignCount = 0;
            return this._campaignManager.requestFromCache(cachedResponse).then(() => {
                return this._campaignManager.request();
           });
        } else if(this.checkForExpiredCampaigns()) {
            span.addAnnotation('campaign expired');
            return this.onCampaignExpired();
        }

        return Promise.resolve();
    }

    public shouldRefill(timestamp: number): boolean {
        if(this._needsRefill) {
            return true;
        }
        if(timestamp !== 0 && Date.now() > timestamp) {
            return true;
        }

        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._configuration.getPlacement(placementId);
        placement.setState(placementState);
    }

    public sendPlacementStateChanges(placementId: string): void {
        const placement = this._configuration.getPlacement(placementId);
        if (placement.getPlacementStateChanged()) {
            placement.setPlacementStateChanged(false);
            this._nativeBridge.Placement.setPlacementState(placementId, placement.getState());
            this._nativeBridge.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[placement.getPreviousState()], PlacementState[placement.getState()]);
        }
        if(placement.getState() === PlacementState.READY) {
            this._nativeBridge.Listener.sendReadyEvent(placementId);
        }
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        for(const placementId of placementIds) {
            this.setPlacementState(placementId, placementState);
        }
        for (const placementId of placementIds) {
            this.sendPlacementStateChanges(placementId);
        }
    }

    private invalidateCampaigns(needsRefill: boolean, placementIds: string[]): void {
        this._needsRefill = needsRefill;
        for(const placementId of placementIds) {
            this._configuration.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }

    private checkForExpiredCampaigns(): boolean {
        for(const placementId in this._configuration.getPlacements()) {
            if (this._configuration.getPlacements().hasOwnProperty(placementId)) {
                const campaign = this._configuration.getPlacement(placementId).getCurrentCampaign();
                if(campaign && campaign.isExpired()) {
                    return true;
                }
            }
        }

        return false;
    }

    private onCampaignExpired(): Promise<INativeResponse | void> {
        this._nativeBridge.Sdk.logDebug('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL, this._configuration.getPlacementIds());
        this.invalidateCampaigns(false, this._configuration.getPlacementIds());
        return this._campaignManager.request();
    }

    private onCampaign(placementId: string, campaign: Campaign) {
        this._parsingErrorCount = 0;

        this.setCampaignForPlacement(placementId, campaign);
        this.handlePlacementState(placementId, PlacementState.READY);
    }

    private onNoFill(placementId: string) {
        this._parsingErrorCount = 0;

        this._nativeBridge.Sdk.logDebug('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined);
        this.handlePlacementState(placementId, PlacementState.NO_FILL);
    }

    private onError(error: WebViewError | Error, placementIds: string[], diagnosticsType: string, session?: Session) {
        this.invalidateCampaigns(this._needsRefill, placementIds);

        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        Diagnostics.trigger(diagnosticsType, {
            error: error,
        }, session);
        this._nativeBridge.Sdk.logError(JSON.stringify(error));

        const minimumRefreshTimestamp = Date.now() + RefreshManager.ErrorRefillDelay * 1000;
        if(this._refillTimestamp === 0 || this._refillTimestamp > minimumRefreshTimestamp) {
            this._refillTimestamp = minimumRefreshTimestamp;
            this._nativeBridge.Sdk.logDebug('Unity Ads will refresh ads in ' + RefreshManager.ErrorRefillDelay + ' seconds');
        }

        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }

        // for now, parsing errors are retried only if there is only one campaign in ad plan
        // therefore all parsing error retry logic is written with the assumption that there is only one campaign
        if(this._campaignCount === 1) {
            this._parsingErrorCount++;

            if(this._parsingErrorCount === 1 && RefreshManager.ParsingErrorRefillDelay > 0) {
                const retryDelaySeconds: number = RefreshManager.ParsingErrorRefillDelay + Math.random() * RefreshManager.ParsingErrorRefillDelay;
                this._nativeBridge.Sdk.logDebug('Unity Ads retrying failed campaign in ' + retryDelaySeconds + ' seconds');
                this._refillTimestamp = Date.now() + RefreshManager.ParsingErrorRefillDelay * 1000;
                setTimeout(() => {
                    this._nativeBridge.Sdk.logDebug('Unity Ads retrying failed campaign now');
                    this.refresh();
                }, retryDelaySeconds * 1000);
            }
        }
    }

    private onConnectivityError(placementIds: string[]) {
        this.invalidateCampaigns(this._needsRefill, placementIds);
        this._refillTimestamp = Date.now();

        this._nativeBridge.Sdk.logDebug('Unity Ads failed to contact server, retrying after next system event');

        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }
    }

    private onAdPlanReceived(refreshDelay: number, campaignCount: number) {
        this._campaignCount = campaignCount;

        if(campaignCount === 0) {
            this._noFills++;

            let delay: number = 0;

            // delay starts from 20 secs, then increased 50% for each additional no fill (20 secs, 30 secs, 45 secs etc.)
            if(this._noFills > 0 && this._noFills < 15) {
                delay = 20;
                for(let i: number = 1; i < this._noFills; i++) {
                    delay = delay * 1.5;
                }
            }

            if(delay > 0) {
                this._refillTimestamp = Date.now() + delay * 1000;
                delay = delay + Math.random() * 10; // add 0-10 second random delay
                this._nativeBridge.Sdk.logDebug('Unity Ads ad plan will be refreshed in ' + delay + ' seconds');
                setTimeout(() => {
                    this.refresh(true);
                }, delay * 1000);
                return;
            }
        } else {
            this._noFills = 0;
        }

        if(refreshDelay > 0) {
            this._refillTimestamp = Date.now() + refreshDelay * 1000;
            this._nativeBridge.Sdk.logDebug('Unity Ads ad plan will expire in ' + refreshDelay + ' seconds');
        }
    }

    private setCampaignForPlacement(placementId: string, campaign: Campaign | undefined) {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            placement.setCurrentCampaign(campaign);
        }
    }

    private handlePlacementState(placementId: string, placementState: PlacementState) {
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
                this.setPlacementState(placementId, placementState);
                this.sendPlacementStateChanges(placementId);
                if(placementState === PlacementState.READY) {
                    SdkStats.setReadyEventTimestamp(placementId);
                    SdkStats.sendReadyEvent(placementId);
                    this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + placementId + ' request to ready time took ' + SdkStats.getRequestToReadyTime(placementId));
                }
            });
        } else {
            this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
            this.setPlacementState(placementId, placementState);
            this.sendPlacementStateChanges(placementId);
            if(placementState === PlacementState.READY) {
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
                this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + placementId + ' request to ready time took ' + SdkStats.getRequestToReadyTime(placementId));
            }
        }
    }

    private onActivityResumed(activity: string): void {
        if(activity !== 'com.unity3d.ads.adunit.AdUnitActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitTransparentActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitTransparentSoftwareActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitSoftwareActivity') {
            this.refresh();
        }
    }

    private onAppForeground(): void {
        this.refresh();
    }

    private onScreenOn(): void {
        this.refresh();
    }

    private onAdUnitFinish(): void {
        this.refresh();
    }

    private onAdUnitClose(): void {
        this._nativeBridge.Sdk.logInfo('Closing Unity Ads ad unit');
        if(this._mustReinitialize) {
            this._nativeBridge.Sdk.logDebug('Unity Ads webapp has been updated, reinitializing Unity Ads');
            this.reinitialize();
        } else {
            this.refresh();
        }
    }

    private onAdUnitStartProcessed(): void {
        if(this._currentAdUnit) {
            setTimeout(() => {
                if(this._currentAdUnit && this._currentAdUnit.isCached()) {
                    this.refresh();
                }
            }, this._startRefreshMagicConstant);
        }
    }

    /*
     Reinit logic copied from WebView.ts
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
     Connectivity handlers copied from WebView.ts
     */

    private onNetworkConnected() {
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            return;
        }
        this.shouldReinitialize().then((reinitialize) => {
            if(reinitialize) {
                if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
                    this._mustReinitialize = true;
                    this.setRefreshAllowed(false);
                } else {
                    this._nativeBridge.Sdk.logDebug('Unity Ads webapp has been updated, reinitializing Unity Ads');
                    this.reinitialize();
                }
            } else {
                this.refresh();
                this._sessionManager.sendUnsentSessions();
            }
        });
    }
}
