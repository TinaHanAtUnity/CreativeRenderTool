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

enum FillState {
    MUST_REFILL, // should ask for new fill at the first available opportunity
    REQUESTING, // currently requesting new fill, avoid overlapping requests
    FILL_RECEIVED, // fill or no fill successfully received
    MUST_REINIT // should reinit SDK at the first available opportunity
}

export class NewRefreshManager extends RefreshManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _focusManager: FocusManager;
    private _reinitManager: ReinitManager;

    private _currentAdUnit: AbstractAdUnit;

    private _refillTimestamp: number = 0; // timestamp for next ad refresh, zero means no deadline is set
    private _fillState: FillState = FillState.MUST_REFILL;
    private _adUnitStartTimestamp: number = 0;

    // constant value that determines the delay for refreshing ads after backend has processed a start event
    // set to five seconds because backend should usually process start event in less than one second but
    // we want to be safe in case of error situations on the backend and mistimings on the device
    // this constant is intentionally named "magic" constant because the value is only a best guess and not a real technical constant
    private _startRefreshMagicConstant: number = 5000;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration, focusManager: FocusManager, reinitManager: ReinitManager) {
        super();

        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._focusManager = focusManager;

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

    // todo: this method is redundant and should just be replaced with direct placement.getCurrentCampaign() invocations
    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        this._currentAdUnit = adUnit;

        // todo: invalidating ad units based on ad unit onStart trigger is somewhat dangerous
        // todo: ad units should be invalidated for each show invocation, not when ad unit says it's starting
        const onStartObserver = this._currentAdUnit.onStart.subscribe(() => {
            this._currentAdUnit.onStart.unsubscribe(onStartObserver);
        });
        this._currentAdUnit.onStartProcessed.subscribe(() => this.onAdUnitStartProcessed());
        this._currentAdUnit.onClose.subscribe(() => this.onAdUnitClose());
        // todo: onFinish should be renamed to onEndScreen or something similar, currently onFinish vs. onClose naming is super confusing
        this._currentAdUnit.onFinish.subscribe(() => this.onAdUnitFinish());
    }

    // todo: redundant method, should be removed
    public setRefreshAllowed(bool: boolean): void { }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {

        // todo: implement method
        return Promise.resolve();
    }

    public shouldRefill(timestamp: number): boolean {
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

        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        // todo: implement method
    }

    public sendPlacementStateChanges(placementId: string): void {
        // todo: implement method
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        // todo: implement method
    }

    private onCampaign(placementId: string, campaign: Campaign) {
        // todo: implement method
    }

    private onNoFill(placementId: string) {
        // todo: implement method
    }

    private onError(error: WebViewError, placementIds: string[], session?: Session) {
        // todo: implement method
    }

    private onConnectivityError(placementIds: string[]) {
        // todo: implement method
    }

    private onAdPlanReceived(refreshDelay: number, campaignCount: number) {
        // todo: implement method
    }

    private onNetworkConnected() {
        // todo: implement method
    }

    private onAppForeground() {
        this.refresh();
    }

    private onScreenOn() {
        this.refresh();
    }

    private onActivityResumed(activity: string) {
        if(activity !== 'com.unity3d.ads.adunit.AdUnitActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitTransparentActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitTransparentSoftwareActivity' &&
            activity !== 'com.unity3d.ads.adunit.AdUnitSoftwareActivity') {
            this.refresh();
        }
    }

    private onAdUnitStart() {
        this._adUnitStartTimestamp = Date.now();
        this.invalidateFill();
        this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
        this._fillState = FillState.MUST_REFILL;
        this._refillTimestamp = 0;
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
        const placementIds: string[] = this._configuration.getPlacementIds();
        for(const placementId of placementIds) {
            this._configuration.getPlacement(placementId).setCurrentCampaign(undefined);
        }
    }
}
