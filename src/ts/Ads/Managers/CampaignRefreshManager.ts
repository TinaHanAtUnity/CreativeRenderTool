import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PurchasingUtilities, ProductState } from 'Promo/Utilities/PurchasingUtilities';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';
import { PromoErrorService } from 'Core/Utilities/PromoErrorService';
import { MetaData } from 'Core/Utilities/MetaData';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { MediationMetaData } from 'Core/Models/MetaData/MediationMetaData';

export class CampaignRefreshManager extends RefreshManager {
    private _platform: Platform;
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _coreConfig: CoreConfiguration;
    private _adsConfig: AdsConfiguration;
    private _currentAdUnit: AbstractAdUnit;
    private _focusManager: FocusManager;
    private _sessionManager: SessionManager;
    private _clientInfo: ClientInfo;
    private _request: RequestManager;
    private _cache: CacheManager;
    private _refillTimestamp: number;
    private _needsRefill = true;
    private _campaignCount: number;
    private _parsingErrorCount: number;
    private _noFills: number;
    private _metaDataManager: MetaDataManager;

    // constant value that determines the delay for refreshing ads after backend has processed a start event
    // set to five seconds because backend should usually process start event in less than one second but
    // we want to be safe in case of error situations on the backend and mistimings on the device
    // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
    private _startRefreshMagicConstant: number = 5000;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, ads: IAdsApi, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, adsConfig: AdsConfiguration, focusManager: FocusManager, sessionManager: SessionManager, clientInfo: ClientInfo, request: RequestManager, cache: CacheManager, metaDataManager: MetaDataManager) {
        super();

        this._platform = platform;
        this._core = core;
        this._ads = ads;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._focusManager = focusManager;
        this._sessionManager = sessionManager;
        this._clientInfo = clientInfo;
        this._request = request;
        this._cache = cache;
        this._refillTimestamp = 0;
        this._campaignCount = 0;
        this._parsingErrorCount = 0;
        this._noFills = 0;
        this._metaDataManager = metaDataManager;

        this._campaignManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => this.onCampaign(placementId, campaign, trackingUrls));
        this._campaignManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds, diagnosticsType, session) => this.onError(error, placementIds, diagnosticsType, session));
        this._campaignManager.onConnectivityError.subscribe((placementIds) => this.onConnectivityError(placementIds));
        this._campaignManager.onAdPlanReceived.subscribe((refreshDelay, campaignCount, auctionStatusCode) => this.onAdPlanReceived(refreshDelay, campaignCount, auctionStatusCode));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
        if (this._platform === Platform.IOS) {
            this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        } else {
            this._focusManager.onScreenOn.subscribe(() => this.onScreenOn());
            this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        }

        this._metaDataManager.fetch(MediationMetaData).then((mediation) => {
            if (mediation) {
                const mediationName = mediation.getName();
                const mediationAdapterVersion = mediation.getAdapterVersion();
                if (mediationName === 'replaceThisMediationNameWhenLive' && mediationAdapterVersion === 'replaceThisVersionWhenLive') {
                    this._ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
                        Object.keys(placements).forEach((placementId) => {
                            const count = placements[placementId];
                            this.loadPlacement(placementId, count);
                        });
                    });
                }
            }
        });
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        const currentAdunit = this._currentAdUnit = adUnit;
        const onStartObserver = this._currentAdUnit.onStart.subscribe(() => {
            currentAdunit.onStart.unsubscribe(onStartObserver);
            this.invalidateCampaigns(true, this._adsConfig.getPlacementIds());
            this.setPlacementStates(PlacementState.WAITING, this._adsConfig.getPlacementIds());
        });
        this._currentAdUnit.onStartProcessed.subscribe(() => this.onAdUnitStartProcessed());
        this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());
        this._currentAdUnit.onFinish.subscribe(() => this.onAdUnitFinish());
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        eventHandler.onClose.subscribe(() => {
            this._needsRefill = true;
            this.refresh();
        });
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        if (this.shouldRefill(this._refillTimestamp)) {
            this.setPlacementStates(PlacementState.WAITING, this._adsConfig.getPlacementIds());
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false, this._adsConfig.getPlacementIds());
            this._campaignCount = 0;
            return this._campaignManager.request(nofillRetry);
        } else if (this.checkForExpiredCampaigns()) {
            return this.onCampaignExpired();
        }

        return Promise.resolve();
    }

    public initialize(): Promise<INativeResponse | void> {
        return this.refresh();
    }

    public shouldRefill(timestamp: number): boolean {
        if (this._needsRefill) {
            return true;
        }
        if (timestamp !== 0 && Date.now() > timestamp) {
            return true;
        }

        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);
    }

    public sendPlacementStateChanges(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement.getPlacementStateChanged()) {
            placement.setPlacementStateChanged(false);
            this._ads.Placement.setPlacementState(placementId, placement.getState());
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[placement.getPreviousState()], PlacementState[placement.getState()]);
        }
        if (placement.getState() === PlacementState.READY) {
            this._ads.Listener.sendReadyEvent(placementId);
        }
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        for (const placementId of placementIds) {
            this.setPlacementState(placementId, placementState);
        }
        for (const placementId of placementIds) {
            this.sendPlacementStateChanges(placementId);
        }
    }

    private loadPlacement(placementId: string, count: number) {
        const placement = this._adsConfig.getPlacement(placementId);
        const currentState = placement.getState();
        this.setPlacementState(placementId, PlacementState.WAITING);
        this.sendPlacementStateChanges(placementId);
        switch (currentState) {
            case PlacementState.READY:
                this.setPlacementState(placementId, PlacementState.READY);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NO_FILL:
                this.setPlacementState(placementId, PlacementState.NO_FILL);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.setPlacementState(placementId, PlacementState.NOT_AVAILABLE);
                this.sendPlacementStateChanges(placementId);
                break;
            default:
        }
    }

    private invalidateCampaigns(needsRefill: boolean, placementIds: string[]): void {
        this._needsRefill = needsRefill;
        for (const placementId of placementIds) {
            this._adsConfig.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }

    private checkForExpiredCampaigns(): boolean {
        for (const placementId in this._adsConfig.getPlacements()) {
            if (this._adsConfig.getPlacements().hasOwnProperty(placementId)) {
                const campaign = this._adsConfig.getPlacement(placementId).getCurrentCampaign();
                if (campaign && campaign.isExpired()) {
                    return true;
                }
            }
        }

        return false;
    }

    private onCampaignExpired(): Promise<INativeResponse | void> {
        this._core.Sdk.logDebug('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL, this._adsConfig.getPlacementIds());
        this.invalidateCampaigns(false, this._adsConfig.getPlacementIds());
        return this._campaignManager.request();
    }

    private onCampaign(placementId: string, campaign: Campaign, trackingUrls: ICampaignTrackingUrls | undefined) {
        if (PurchasingUtilities.isInitialized()) {
            PurchasingUtilities.addCampaignPlacementIds(placementId, campaign);
        }
        this._parsingErrorCount = 0;
        if (campaign instanceof PromoCampaign) {
            this.handlePromoCampaign(placementId, campaign, trackingUrls);
        } else {
            this.setPlacementReady(placementId, campaign, trackingUrls);
        }
    }

    private handlePromoCampaign(placementId: string, campaign: PromoCampaign, trackingUrls: ICampaignTrackingUrls | undefined) {
        const productId = campaign.getIapProductId();
        const state = PurchasingUtilities.getProductState(productId);
        switch (state) {
            case ProductState.EXISTS_IN_CATALOG:
                this.setPlacementReady(placementId, campaign, trackingUrls);
                break;
            case ProductState.MISSING_PRODUCT_IN_CATALOG:
                PromoErrorService.report(this._request, {
                    auctionID: campaign.getSession().getId(),
                    corrID: campaign.getCorrelationId(),
                    country: this._coreConfig.getCountry(),
                    projectID: this._coreConfig.getUnityProjectId(),
                    gameID: this._clientInfo.getGameId(),
                    placementID: placementId,
                    productID: productId,
                    platform: this._platform,
                    gamerToken: this._coreConfig.getToken(),
                    errorCode: 102,
                    errorMessage: 'placement missing productId'
                });
                this._core.Sdk.logWarning(`Promo placement: ${placementId} does not have the corresponding product: ${productId} available in purchasing catalog`);
                this.onDisable(placementId);
                break;
            case ProductState.WAITING_FOR_CATALOG:
                this.setPlacementState(placementId, PlacementState.WAITING);
                break;
            default:
        }
    }

    private setPlacementReady(placementId: string, campaign: Campaign, trackingUrls: { [eventName: string]: string[] } | undefined) {
        this.setCampaignForPlacement(placementId, campaign, trackingUrls);
        this.handlePlacementState(placementId, PlacementState.READY);
    }

    private onNoFill(placementId: string) {
        this._parsingErrorCount = 0;

        this._core.Sdk.logDebug('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined, undefined);
        this.handlePlacementState(placementId, PlacementState.NO_FILL);
    }

    private onDisable(placementId: string) {
        this._parsingErrorCount = 0;

        this._core.Sdk.logDebug('Unity Ads server returned fill; however, the ad is disabled for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined, undefined);
        this.handlePlacementState(placementId, PlacementState.DISABLED);
    }

    private onError(error: unknown, placementIds: string[], diagnosticsType: string, session?: Session) {
        this.invalidateCampaigns(this._needsRefill, placementIds);

        if (error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        if (session) {
            SessionDiagnostics.trigger(diagnosticsType, {
                error: error,
                auctionProtocol: RequestManager.getAuctionProtocol()
            }, session);
        } else {
            Diagnostics.trigger(diagnosticsType, {
                error: error,
                auctionProtocol: RequestManager.getAuctionProtocol()
            });
        }
        this._core.Sdk.logError(JSON.stringify(error));

        const minimumRefreshTimestamp = Date.now() + RefreshManager.ErrorRefillDelayInSeconds * 1000;
        if (this._refillTimestamp === 0 || this._refillTimestamp > minimumRefreshTimestamp) {
            this._refillTimestamp = minimumRefreshTimestamp;
            this._core.Sdk.logDebug('Unity Ads will refresh ads in ' + RefreshManager.ErrorRefillDelayInSeconds + ' seconds');
        }

        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }

        // for now, parsing errors are retried only if there is only one campaign in ad plan
        // therefore all parsing error retry logic is written with the assumption that there is only one campaign
        if (this._campaignCount === 1) {
            this._parsingErrorCount++;

            if (this._parsingErrorCount === 1 && RefreshManager.ParsingErrorRefillDelayInSeconds > 0) {
                const retryDelaySeconds: number = RefreshManager.ParsingErrorRefillDelayInSeconds + Math.random() * RefreshManager.ParsingErrorRefillDelayInSeconds;
                this._core.Sdk.logDebug('Unity Ads retrying failed campaign in ' + retryDelaySeconds + ' seconds');
                this._refillTimestamp = Date.now() + RefreshManager.ParsingErrorRefillDelayInSeconds * 1000;
                setTimeout(() => {
                    this._core.Sdk.logDebug('Unity Ads retrying failed campaign now');
                    this.refresh();
                }, retryDelaySeconds * 1000);
            }
        }
    }

    private onConnectivityError(placementIds: string[]) {
        this.invalidateCampaigns(this._needsRefill, placementIds);
        this._refillTimestamp = Date.now();

        this._core.Sdk.logDebug('Unity Ads failed to contact server, retrying after next system event');

        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }
    }

    private onAdPlanReceived(refreshDelay: number, campaignCount: number, auctionStatusCode: number) {
        this._campaignCount = campaignCount;

        if (auctionStatusCode === AuctionStatusCode.FREQUENCY_CAP_REACHED) {
            const nowInMilliSec = Date.now();
            this._refillTimestamp = nowInMilliSec + TimeUtils.getNextUTCDayDeltaSeconds(nowInMilliSec) * 1000;

            return;
        }

        if (campaignCount === 0) {
            this._noFills++;

            let delay: number = 0;

            // delay starts from 20 secs, then increased 50% for each additional no fill (20 secs, 30 secs, 45 secs etc.)
            if (this._noFills > 0 && this._noFills < 15) {
                delay = 20;
                for (let i: number = 1; i < this._noFills; i++) {
                    delay = delay * 1.5;
                }
            }

            if (delay > 0) {
                this._refillTimestamp = Date.now() + delay * 1000;
                delay = delay + Math.random() * 10; // add 0-10 second random delay
                this._core.Sdk.logDebug('Unity Ads ad plan will be refreshed in ' + delay + ' seconds');
                setTimeout(() => {
                    this.refresh(true);
                }, delay * 1000);
                return;
            }
        } else {
            this._noFills = 0;
        }

        if (refreshDelay > 0) {
            this._refillTimestamp = Date.now() + refreshDelay * 1000;
            this._core.Sdk.logDebug('Unity Ads ad plan will expire in ' + refreshDelay + ' seconds');

            if (CustomFeatures.isTimerExpirationExperiment(this._clientInfo.getGameId())) {
                setTimeout(() => {
                    if (this._focusManager.isAppForeground()) {
                        this.refresh();
                    }
                }, refreshDelay * 1000 + 1);
            }
        }
    }

    private setCampaignForPlacement(placementId: string, campaign: Campaign | undefined, trackingUrls: ICampaignTrackingUrls | undefined) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            placement.setCurrentCampaign(campaign);
            placement.setCurrentTrackingUrls(trackingUrls);
        }
    }

    private handlePlacementState(placementId: string, placementState: PlacementState) {
        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this._core.Sdk.logDebug('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
                this.setPlacementState(placementId, placementState);
                this.sendPlacementStateChanges(placementId);
                if (placementState === PlacementState.READY) {
                    SdkStats.setReadyEventTimestamp(placementId);
                    SdkStats.sendReadyEvent(placementId);
                    UserCountData.setPriorRequestToReadyTime(SdkStats.getRequestToReadyTime(placementId), this._core);
                    this._core.Sdk.logDebug('Unity Ads placement ' + placementId + ' request to ready time took ' + SdkStats.getRequestToReadyTime(placementId));
                }
            });
        } else {
            this._core.Sdk.logDebug('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
            this.setPlacementState(placementId, placementState);
            this.sendPlacementStateChanges(placementId);
            if (placementState === PlacementState.READY) {
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
                UserCountData.setPriorRequestToReadyTime(SdkStats.getRequestToReadyTime(placementId), this._core);
                this._core.Sdk.logDebug('Unity Ads placement ' + placementId + ' request to ready time took ' + SdkStats.getRequestToReadyTime(placementId));
            }
        }
    }

    private onActivityResumed(activity: string): void {
        if (activity !== 'com.unity3d.services.ads.adunit.AdUnitActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitTransparentActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitTransparentSoftwareActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitSoftwareActivity') {
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
        this._core.Sdk.logInfo('Closing Unity Ads ad unit');
        this.refresh();
    }

    private onAdUnitStartProcessed(): void {
        if (this._currentAdUnit) {
            setTimeout(() => {
                if (this._currentAdUnit && this._currentAdUnit.isCached()) {
                    this.refresh();
                }
            }, this._startRefreshMagicConstant);
        }
    }

    /*
     Connectivity handlers copied from WebView.ts
     */

    private onNetworkConnected() {
        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            return;
        }

        this.refresh();
        this._sessionManager.sendUnsentSessions();
    }
}
