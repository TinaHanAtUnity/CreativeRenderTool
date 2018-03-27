import { RefreshManager } from 'Managers/RefreshManager';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { PlacementState } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { INativeResponse } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Configuration } from 'Models/Configuration';
import { FocusManager } from 'Managers/FocusManager';
import { NativeBridge } from 'Native/NativeBridge';
import { CampaignManager } from 'Managers/CampaignManager';
import { Platform } from 'Constants/Platform';
import { WebViewError } from 'Errors/WebViewError';
import { Session } from 'Models/Session';
import { ReinitManager } from 'Managers/ReinitManager';
import { PlacementManager } from 'Managers/PlacementManager';
import { Diagnostics } from 'Utilities/Diagnostics';

enum FillState {
    MUST_REFILL, // should ask for new fill at the first available opportunity
    REQUESTING, // currently requesting new fill, avoid overlapping requests
    FILL_RECEIVED, // auction response (fill or no fill) successfully received
    MUST_REINIT // should reinit SDK at the first available opportunity
}

export class NewRefreshManager extends RefreshManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _focusManager: FocusManager;
    private _reinitManager: ReinitManager;
    private _placementManager: PlacementManager;

    private _currentAdUnit: AbstractAdUnit;

    private _refillTimestamp: number = 0; // timestamp for next ad refresh, zero means no deadline is set
    private _fillState: FillState = FillState.MUST_REFILL;
    private _adUnitStartTimestamp: number = 0;

    private _campaignCount: number = 0;
    private _noFills: number = 0;
    private _parsingErrorCount: number = 0;

    // constant value that determines the delay for refreshing ads after backend has processed a start event
    // set to five seconds because backend should usually process start event in less than one second but
    // we want to be safe in case of error situations on the backend and mistimings on the device
    // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
    private _startRefreshMagicConstant: number = 5000;

    private _maxAdPlanTTL: number = 14400; // four hours (in seconds)

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration, focusManager: FocusManager, reinitManager: ReinitManager, placementManager: PlacementManager) {
        super();

        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._focusManager = focusManager;
        this._reinitManager = reinitManager;
        this._placementManager = placementManager;

        this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onCampaign(placementId, campaign));
        this._campaignManager.onNoFill.subscribe(placementId => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds, session) => this.onError(error, placementIds, session));
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

    // todo: remove method, use PlacementManager instead
    public getCampaign(placementId: string): Campaign | undefined {
        return this._placementManager.getCampaign(placementId);
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        this._currentAdUnit = adUnit;

        // todo: invalidating ad units based on ad unit onStart trigger is somewhat dangerous
        // todo: ad units should be invalidated for each show invocation, not when ad unit says it's starting
        this._currentAdUnit.onStart.subscribe(() => this.onAdUnitStart());
        this._currentAdUnit.onStartProcessed.subscribe(() => this.onAdUnitStartProcessed());
        this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());
        // todo: onFinish should be renamed to onEndScreen or something similar, currently onFinish vs. onClose naming is super confusing
        this._currentAdUnit.onFinish.subscribe(() => this.onAdUnitFinish());
    }

    public setRefreshAllowed(bool: boolean): void {
        // todo: redundant method, should be removed
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        if(this.shouldRefill(Date.now())) {
            return this._reinitManager.shouldReinitialize().then(reinit => {
                if(reinit) {
                    if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
                        this._fillState = FillState.MUST_REINIT;
                    } else {
                        this._reinitManager.reinitialize();
                    }
                } else if(this.shouldRefill(Date.now())) { // check refill status again to prevent a race condition
                    this.invalidateFill();
                    this._fillState = FillState.REQUESTING;
                    this._campaignManager.request(nofillRetry);
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    public shouldRefill(timestamp: number): boolean {
        // no new ad requests if previous request is in progress or webview must reinit
        if(this._fillState === FillState.REQUESTING || this._fillState === FillState.MUST_REINIT) {
            return false;
        }

        // no new ad requests immediately after ad unit start
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            if(this._adUnitStartTimestamp !== 0 && timestamp < this._adUnitStartTimestamp + this._startRefreshMagicConstant) {
                return false;
            }
        }

        // no background ad requests
        if(!this._focusManager.isAppForeground()) {
            return false;
        }

        if(this._fillState === FillState.MUST_REFILL) {
            return true;
        }

        if(this._refillTimestamp !== 0 && timestamp > this._refillTimestamp) {
            return true;
        }

        return this.checkForExpiredCampaigns();
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        // todo: remove method, use PlacementManager instead
    }

    public sendPlacementStateChanges(placementId: string): void {
        // todo: remove method, use PlacementManager instead
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        // todo: remove method, use PlacementManager instead
    }

    private onCampaign(placementId: string, campaign: Campaign) {
        this._parsingErrorCount = 0;

        this._placementManager.setCampaign(placementId, campaign);
        this.handlePlacementStateChange(placementId, PlacementState.READY);
    }

    private onNoFill(placementId: string) {
        this._parsingErrorCount = 0;

        this.handlePlacementStateChange(placementId, PlacementState.NO_FILL);
    }

    private onError(error: WebViewError | Error, placementIds: string[], session?: Session) {
        this._fillState = FillState.FILL_RECEIVED;

        // todo: this diagnostic handling is copied from old refresh manager and it's the exact anti-pattern that's been causing a lot of trouble
        // todo: proper solution is to break this one massive auction_request_failed to smaller more well-defined diagnostic events
        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        Diagnostics.trigger('auction_request_failed', {
            error: error,
        }, session);

        this._nativeBridge.Sdk.logError('Unity Ads ad request error: ' + JSON.stringify(error));

        const minimumRefreshTimestamp = Date.now() + RefreshManager.ErrorRefillDelay * 1000;
        if(this._refillTimestamp === 0 || this._refillTimestamp > minimumRefreshTimestamp) {
            this._refillTimestamp = minimumRefreshTimestamp;
            this._nativeBridge.Sdk.logDebug('Unity Ads will refresh ads in ' + RefreshManager.ErrorRefillDelay + ' seconds');
        }

        for(const placementId of placementIds) {
            this.handlePlacementStateChange(placementId, PlacementState.NO_FILL);
        }

        // parsing errors are retried only if there is only one campaign in ad plan
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
        this._fillState = FillState.MUST_REFILL;
        this._refillTimestamp = Date.now();

        this._nativeBridge.Sdk.logDebug('Unity Ads failed to contact server, retrying after next system event');

        for(const placementId of placementIds) {
            this.handlePlacementStateChange(placementId, PlacementState.NO_FILL);
        }
    }

    private onAdPlanReceived(refreshDelay: number, campaignCount: number) {
        this._fillState = FillState.FILL_RECEIVED;

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

        let adjustedDelay: number = refreshDelay;
        if(refreshDelay === 0 || refreshDelay > this._maxAdPlanTTL) {
            adjustedDelay = this._maxAdPlanTTL;
        }

        this._refillTimestamp = Date.now() + adjustedDelay * 1000;
        this._nativeBridge.Sdk.logDebug('Unity Ads ad plan will expire in ' + adjustedDelay + ' seconds');
    }

    private onNetworkConnected() {
        this.refresh();
    }

    private onAppForeground() {
        this.refresh();
    }

    private onScreenOn() {
        this.refresh();
    }

    private onActivityResumed(activity: string) {
        this.refresh();
    }

    private onAdUnitStart() {
        this._adUnitStartTimestamp = Date.now();
        this.invalidateFill();
        this._fillState = FillState.MUST_REFILL;
    }

    private onAdUnitStartProcessed() {
        setTimeout(() => {
            this.refresh();
        }, this._startRefreshMagicConstant);
    }

    private onAdUnitClose() {
        this._nativeBridge.Sdk.logInfo('Closing Unity Ads ad unit');
        if(this._fillState === FillState.MUST_REINIT) {
            this._nativeBridge.Sdk.logInfo('Unity Ads webapp has been updated, reinitializing Unity Ads');
            this._reinitManager.reinitialize();
        } else {
            this.refresh();
        }
    }

    private onAdUnitFinish() {
        this.refresh();
    }

    private invalidateFill() {
        this._placementManager.clearCampaigns();
        this._placementManager.setAllPlacementStates(PlacementState.WAITING);
        this._refillTimestamp = 0;

        this._campaignCount = 0;
        this._noFills = 0;
    }

    private checkForExpiredCampaigns(): boolean {
        for(const placementId of this._configuration.getPlacementIds()) {
            const campaign = this._placementManager.getCampaign(placementId);
            if(campaign && campaign.isExpired()) {
                return true;
            }
        }

        return false;
    }

    private handlePlacementStateChange(placementId: string, newState: PlacementState): void {
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this._placementManager.setPlacementState(placementId, newState);
            });
        } else {
            this._placementManager.setPlacementState(placementId, newState);
        }
    }
}
