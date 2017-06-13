import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { Placement, PlacementState } from 'Models/Placement';
import { Configuration } from 'Models/Configuration';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export class CampaignRefreshManager {
    private static NoFillDelay = 3600;

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;
    private _refillTimestamp: number;
    private _needsRefill = true;

    constructor (nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._refillTimestamp = 0;

        this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onCampaign(placementId, campaign));
        this._campaignManager.onNoFill.subscribe(placementId => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe(error => this.onError(error));
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
            this.invalidateCampaigns(true);
            this.setPlacementStates(PlacementState.WAITING);
        });
    }

    public refresh(): Promise<void> {
        if(this.shouldRefill(this._refillTimestamp)) {
            this.setPlacementStates(PlacementState.WAITING);
            this._refillTimestamp = 0;
            this.invalidateCampaigns(false);
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

    public setPlacementStates(placementState: PlacementState): void {
        const placements: { [id: string]: Placement } = this._configuration.getPlacements();
        for(const placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                this.setPlacementState(placementId, placementState);
            }
        }
        for (const placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                this.sendPlacementStateChanges(placementId);
            }
        }
    }

    private invalidateCampaigns(needsRefill: boolean): void {
        this._needsRefill = needsRefill;
        for(const placementId in this._configuration.getPlacements()) {
            if (this._configuration.getPlacements().hasOwnProperty(placementId)) {
                this._configuration.getPlacement(placementId).setCurrentCampaign(undefined);
            }
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

    private onCampaignExpired(): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL);
        return this._campaignManager.request();
    }

    private onCampaign(placementId: string, campaign: Campaign) {
        // todo: for now, campaigns with placement level control are always refreshed after one hour regardless of response or errors
        if (this._configuration.isAuction()) {
            this._refillTimestamp = Date.now() + CampaignRefreshManager.NoFillDelay * 1000;
        }

        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            placement.setCurrentCampaign(campaign);
        }

        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.handlePlacementState(placementId, PlacementState.READY);
            });
        } else {
            this.handlePlacementState(placementId, PlacementState.READY);
        }
    }

    private onNoFill(placementId: string) {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);

        if (!this._configuration.isAuction()) {
            this._refillTimestamp = Date.now() + CampaignRefreshManager.NoFillDelay * 1000;
        }

        const placement = this._configuration.getPlacement(placementId);
        if(placement) {
            placement.setCurrentCampaign(undefined);
        }

        this.handlePlacementState(placementId, PlacementState.NO_FILL);
    }

    private onError(error: WebViewError | Error) {
        this.invalidateCampaigns(this._needsRefill);

        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }
        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger('plc_request_failed', error);
        this.setPlacementStates(PlacementState.NO_FILL);
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
}
