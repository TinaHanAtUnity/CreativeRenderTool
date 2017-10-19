import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { PlacementState } from 'Models/Placement';
import { Configuration } from 'Models/Configuration';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { INativeResponse } from 'Utilities/Request';
import { Session } from 'Models/Session';
import { FocusManager } from 'Managers/FocusManager';

export class CampaignRefreshManager {
    public static NoFillDelay = 3600;
    public static ErrorRefillDelay = 3600;
    public static QuickRefillTestDelay = 60;

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;
    private _focusManager: FocusManager;
    private _refillTimestamp: number;
    private _needsRefill = true;

    private _singleCampaignMode: boolean = false;
    private _singleCampaignErrorCount: number = 0;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration, focusManager: FocusManager) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._focusManager = focusManager;
        this._refillTimestamp = 0;

        this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onCampaign(placementId, campaign));
        this._campaignManager.onNoFill.subscribe(placementId => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds, rawAdPlan) => this.onError(error, placementIds, rawAdPlan));
        this._campaignManager.onAdPlanReceived.subscribe((refreshDelay, singleCampaignMode) => this.onAdPlanReceived(refreshDelay, singleCampaignMode));
        this._focusManager.onActivityResumed.subscribe((activity) => this.onActivityResumed(activity));
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        this._currentAdUnit = adUnit;
        const onStartObserver = this._currentAdUnit.onStart.subscribe(() => {
            this._currentAdUnit.onStart.unsubscribe(onStartObserver);
            this.invalidateCampaigns(true, this._configuration.getPlacementIds());
            this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
        });
    }

    public refresh(): Promise<INativeResponse | void> {
        if(this.shouldRefill(this._refillTimestamp)) {
            this.setPlacementStates(PlacementState.WAITING, this._configuration.getPlacementIds());
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false, this._configuration.getPlacementIds());
            this._singleCampaignMode = false;
            return this._campaignManager.request();
        } else if(this.checkForExpiredCampaigns()) {
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
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL, this._configuration.getPlacementIds());
        this.invalidateCampaigns(false, this._configuration.getPlacementIds());
        return this._campaignManager.request();
    }

    private onCampaign(placementId: string, campaign: Campaign) {
        this._singleCampaignErrorCount = 0;

        this.setCampaignForPlacement(placementId, campaign);
        this.handlePlacementState(placementId, PlacementState.READY);
    }

    private onNoFill(placementId: string) {
        this._singleCampaignErrorCount = 0;

        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);
        this.setCampaignForPlacement(placementId, undefined);
        this.handlePlacementState(placementId, PlacementState.NO_FILL);
    }

    private onError(error: WebViewError | Error, placementIds: string[], session?: Session) {
        this.invalidateCampaigns(this._needsRefill, placementIds);

        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        Diagnostics.trigger('auction_request_failed', {
            error: error,
        }, session);
        this._nativeBridge.Sdk.logError(JSON.stringify(error));

        const minimumRefreshTimestamp = Date.now() + CampaignRefreshManager.ErrorRefillDelay * 1000;
        if(this._refillTimestamp === 0 || this._refillTimestamp > minimumRefreshTimestamp) {
            this._refillTimestamp = minimumRefreshTimestamp;
            this._nativeBridge.Sdk.logInfo('Unity Ads will refresh ads in ' + CampaignRefreshManager.ErrorRefillDelay + ' seconds');
        }

        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }

        if(this._singleCampaignMode) {
            this._singleCampaignErrorCount++;

            if(this._singleCampaignErrorCount === 1 && this._configuration.getAbGroup() === 5) {
                const retryDelaySeconds: number = CampaignRefreshManager.QuickRefillTestDelay + Math.random() * CampaignRefreshManager.QuickRefillTestDelay;
                this._nativeBridge.Sdk.logDebug('Unity Ads retrying failed campaign in ' + retryDelaySeconds + ' seconds');
                this._refillTimestamp = Date.now() + CampaignRefreshManager.QuickRefillTestDelay * 1000;
                setTimeout(() => {
                    this._nativeBridge.Sdk.logDebug('Unity Ads retrying failed campaign now');
                    this.refresh();
                }, retryDelaySeconds * 1000);
            }
        }
    }

    private onAdPlanReceived(refreshDelay: number, singleCampaignMode: boolean) {
        this._singleCampaignMode = singleCampaignMode;
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
                this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
                this.setPlacementState(placementId, placementState);
                this.sendPlacementStateChanges(placementId);
            });
        } else {
            this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' status set to ' + PlacementState[placementState]);
            this.setPlacementState(placementId, placementState);
            this.sendPlacementStateChanges(placementId);
        }
    }

    private onActivityResumed(activity: string): void {
        this.refresh();
    }
}
