import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { UserCountData } from 'Ads/Utilities/UserCountData';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';
export class CampaignRefreshManager extends RefreshManager {
    constructor(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache) {
        super();
        this._needsRefill = true;
        // constant value that determines the delay for refreshing ads after backend has processed a start event
        // set to five seconds because backend should usually process start event in less than one second but
        // we want to be safe in case of error situations on the backend and mistimings on the device
        // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
        this._startRefreshMagicConstant = 5000;
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
        this._campaignManager.onCampaign.subscribe((placementId, campaign, trackingUrls) => this.onCampaign(placementId, campaign, trackingUrls));
        this._campaignManager.onNoFill.subscribe((placementId) => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds, diagnosticsType, session) => this.onError(error, placementIds, diagnosticsType, session));
        this._campaignManager.onConnectivityError.subscribe((placementIds) => this.onConnectivityError(placementIds));
        this._campaignManager.onAdPlanReceived.subscribe((refreshDelay, campaignCount, auctionStatusCode) => this.onAdPlanReceived(refreshDelay, campaignCount, auctionStatusCode));
        this._wakeUpManager.onNetworkConnected.subscribe(() => this.onNetworkConnected());
        if (this._platform === Platform.IOS) {
            this._focusManager.onAppForeground.subscribe(() => this.onAppForeground());
        }
        else {
            this._focusManager.onScreenOn.subscribe(() => this.onScreenOn());
            this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
        }
    }
    getCampaign(placementId) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            return placement.getCurrentCampaign();
        }
        return undefined;
    }
    setCurrentAdUnit(adUnit, placement) {
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
    refresh(nofillRetry) {
        if (this.shouldRefill(this._refillTimestamp)) {
            this.setPlacementStates(PlacementState.WAITING, this._adsConfig.getPlacementIds());
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false, this._adsConfig.getPlacementIds());
            this._campaignCount = 0;
            return this._campaignManager.request(nofillRetry);
        }
        else if (this.checkForExpiredCampaigns()) {
            return this.onCampaignExpired();
        }
        return Promise.resolve();
    }
    initialize() {
        return this.refresh();
    }
    shouldRefill(timestamp) {
        if (this._needsRefill) {
            return true;
        }
        if (timestamp !== 0 && Date.now() > timestamp) {
            return true;
        }
        return false;
    }
    setPlacementState(placementId, placementState) {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);
    }
    sendPlacementStateChanges(placementId) {
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
    setPlacementStates(placementState, placementIds) {
        for (const placementId of placementIds) {
            this.setPlacementState(placementId, placementState);
        }
        for (const placementId of placementIds) {
            this.sendPlacementStateChanges(placementId);
        }
    }
    invalidateCampaigns(needsRefill, placementIds) {
        this._needsRefill = needsRefill;
        for (const placementId of placementIds) {
            this._adsConfig.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }
    checkForExpiredCampaigns() {
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
    onCampaignExpired() {
        this._core.Sdk.logDebug('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL, this._adsConfig.getPlacementIds());
        this.invalidateCampaigns(false, this._adsConfig.getPlacementIds());
        return this._campaignManager.request();
    }
    onCampaign(placementId, campaign, trackingUrls) {
        this._parsingErrorCount = 0;
        this.setPlacementReady(placementId, campaign, trackingUrls);
    }
    setPlacementReady(placementId, campaign, trackingUrls) {
        this.setCampaignForPlacement(placementId, campaign, trackingUrls);
        this.handlePlacementState(placementId, PlacementState.READY);
    }
    onNoFill(placementId) {
        this._parsingErrorCount = 0;
        this._core.Sdk.logDebug('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined, undefined);
        this.handlePlacementState(placementId, PlacementState.NO_FILL);
    }
    onDisable(placementId) {
        this._parsingErrorCount = 0;
        this._core.Sdk.logDebug('Unity Ads server returned fill; however, the ad is disabled for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined, undefined);
        this.handlePlacementState(placementId, PlacementState.DISABLED);
    }
    onError(error, placementIds, diagnosticsType, session) {
        this.invalidateCampaigns(this._needsRefill, placementIds);
        if (error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }
        if (session) {
            SessionDiagnostics.trigger(diagnosticsType, {
                error: error,
                auctionProtocol: RequestManager.getAuctionProtocol()
            }, session);
        }
        else {
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
        }
        else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }
        // for now, parsing errors are retried only if there is only one campaign in ad plan
        // therefore all parsing error retry logic is written with the assumption that there is only one campaign
        if (this._campaignCount === 1) {
            this._parsingErrorCount++;
            if (this._parsingErrorCount === 1 && RefreshManager.ParsingErrorRefillDelayInSeconds > 0) {
                const retryDelaySeconds = RefreshManager.ParsingErrorRefillDelayInSeconds + Math.random() * RefreshManager.ParsingErrorRefillDelayInSeconds;
                this._core.Sdk.logDebug('Unity Ads retrying failed campaign in ' + retryDelaySeconds + ' seconds');
                this._refillTimestamp = Date.now() + RefreshManager.ParsingErrorRefillDelayInSeconds * 1000;
                setTimeout(() => {
                    this._core.Sdk.logDebug('Unity Ads retrying failed campaign now');
                    this.refresh();
                }, retryDelaySeconds * 1000);
            }
        }
    }
    onConnectivityError(placementIds) {
        this.invalidateCampaigns(this._needsRefill, placementIds);
        this._refillTimestamp = Date.now();
        this._core.Sdk.logDebug('Unity Ads failed to contact server, retrying after next system event');
        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        }
        else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }
    }
    onAdPlanReceived(refreshDelay, campaignCount, auctionStatusCode) {
        this._campaignCount = campaignCount;
        if (auctionStatusCode === AuctionStatusCode.FREQUENCY_CAP_REACHED) {
            const nowInMilliSec = Date.now();
            this._refillTimestamp = nowInMilliSec + TimeUtils.getNextUTCDayDeltaSeconds(nowInMilliSec) * 1000;
            return;
        }
        if (campaignCount === 0) {
            this._noFills++;
            let delay = 0;
            // delay starts from 20 secs, then increased 50% for each additional no fill (20 secs, 30 secs, 45 secs etc.)
            if (this._noFills > 0 && this._noFills < 15) {
                delay = 20;
                for (let i = 1; i < this._noFills; i++) {
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
        }
        else {
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
    setCampaignForPlacement(placementId, campaign, trackingUrls) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement) {
            placement.setCurrentCampaign(campaign);
            placement.setCurrentTrackingUrls(trackingUrls);
        }
    }
    handlePlacementState(placementId, placementState) {
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
        }
        else {
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
    onActivityResumed(activity) {
        if (activity !== 'com.unity3d.services.ads.adunit.AdUnitActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitTransparentActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitTransparentSoftwareActivity' &&
            activity !== 'com.unity3d.services.ads.adunit.AdUnitSoftwareActivity') {
            this.refresh();
        }
    }
    onAppForeground() {
        this.refresh();
    }
    onScreenOn() {
        this.refresh();
    }
    onAdUnitFinish() {
        this.refresh();
    }
    onAdUnitClose() {
        this._core.Sdk.logInfo('Closing Unity Ads ad unit');
        this.refresh();
    }
    onAdUnitStartProcessed() {
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
    onNetworkConnected() {
        if (this._currentAdUnit && this._currentAdUnit.isShowing()) {
            return;
        }
        this.refresh();
        this._sessionManager.sendUnsentSessions();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25SZWZyZXNoTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvQ2FtcGFpZ25SZWZyZXNoTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJN0QsT0FBTyxFQUFhLGNBQWMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBRWpFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBbUIsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHL0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFcEQsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGNBQWM7SUEwQnRELFlBQVksUUFBa0IsRUFBRSxJQUFjLEVBQUUsVUFBNkIsRUFBRSxHQUFZLEVBQUUsYUFBNEIsRUFBRSxlQUFnQyxFQUFFLFNBQTJCLEVBQUUsWUFBMEIsRUFBRSxjQUE4QixFQUFFLFVBQXNCLEVBQUUsT0FBdUIsRUFBRSxLQUFtQjtRQUN0VCxLQUFLLEVBQUUsQ0FBQztRQVpKLGlCQUFZLEdBQUcsSUFBSSxDQUFDO1FBSzVCLHdHQUF3RztRQUN4RyxxR0FBcUc7UUFDckcsNkZBQTZGO1FBQzdG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