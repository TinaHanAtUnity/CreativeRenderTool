import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { CampaignManager } from 'Managers/CampaignManager';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { Placement, PlacementState } from 'Models/Placement';
import { Configuration } from 'Models/Configuration';
import { Diagnostics } from 'Utilities/Diagnostics';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export abstract class CampaignRefreshManager {
    private static NoFillDelay = 3600;

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _campaign: Campaign;
    private _plcCampaigns: { [id: string]: Campaign } = {};
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;
    private _refillTimestamp: number;
    private _plcRefillTimestamp: number;
    private _needsRefill = true;

    constructor (nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._refillTimestamp = 0;
        this._plcRefillTimestamp = 0;

        if(this._configuration.isAuction()) {
            this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onPlcCampaign(placementId, campaign));
            this._campaignManager.onNoFill.subscribe(placementId => this.onPlcNoFill(placementId));
            this._campaignManager.onError.subscribe(error => this.onPlcError(error));
        } else {
            // this._campaignManager.onPerformanceCampaign.subscribe(campaign => this.onCampaign(campaign));
            // this._campaignManager.onVastCampaign.subscribe(campaign => this.onCampaign(campaign));
            // this._campaignManager.onMRAIDCampaign.subscribe(campaign => this.onCampaign(campaign));
            // this._campaignManager.onNoFill.subscribe(() => this.onNoFill());
            // this._campaignManager.onError.subscribe(error => this.onCampaignError(error));
        }
    }

    public getCampaign(placementId: string): Campaign {
        if(this._configuration.isAuction()) {
            return this._plcCampaigns[placementId];
        } else {
            return this._campaign;
        }
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        this._currentAdUnit = adUnit;
        const onStartObserver = this._currentAdUnit.onStart.subscribe(() => {
            this._currentAdUnit.onStart.unsubscribe(onStartObserver);
            this.invalidateCampaigns();
            this.setPlacementStates(PlacementState.WAITING);
        });
    }

    public refresh(): Promise<void> {
        if(this._configuration.isAuction()) {
            if(this.shouldRefill(this._plcRefillTimestamp)) {
                this.setPlacementStates(PlacementState.WAITING);
                this._plcRefillTimestamp = 0;
                this._needsRefill = false;
                this._plcCampaigns = {};
                return this._campaignManager.request();
            }
        } else {
            if(this.shouldRefill(this._refillTimestamp)) {
                this.setPlacementStates(PlacementState.WAITING);
                this._refillTimestamp = 0;
                this._needsRefill = false;
                return this._campaignManager.request();
            } else if(this._campaign && this._campaign.isExpired()) {
                return this.onCampaignExpired(this._campaign);
            }
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

    private invalidateCampaigns() {
        this._needsRefill = true;
        if(this._configuration.isAuction()) {
            this._plcCampaigns = {};
        } else {
            delete this._campaign;
        }
    }
/*
    private onCampaign(campaign: Campaign) {
        this._campaign = campaign;
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.READY);
            });
        } else {
            this.setPlacementStates(PlacementState.READY);
        }
    }

    private onNoFill() {
        delete this._campaign;
        this._refillTimestamp = Date.now() + CampaignRefreshManager.NoFillDelay * 1000;
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.setPlacementStates(PlacementState.NO_FILL);
    }

    private onCampaignError(error: WebViewError | Error) {
        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }
        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger('campaign_request_failed', error);
        this.onNoFill();
    }*/

    private onCampaignExpired(campaign: Campaign): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL);
        return this._campaignManager.request();
    }

    private onPlcCampaign(placementId: string, campaign: Campaign) {
        // todo: for now, campaigns with placement level control are always refreshed after one hour regardless of response or errors
        this._plcRefillTimestamp = Date.now() + CampaignRefreshManager.NoFillDelay * 1000;
        this._plcCampaigns[placementId] = campaign;
        this.plcHandlePlacementState(placementId, PlacementState.READY);
    }

    private onPlcNoFill(placementId: string) {
        if(this._plcCampaigns[placementId]) {
            delete this._plcCampaigns[placementId];
        }

        this.plcHandlePlacementState(placementId, PlacementState.NO_FILL);
    }

    private plcHandlePlacementState(placementId: string, placementState: PlacementState) {
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

    private onPlcError(error: WebViewError | Error) {
        this._plcCampaigns = {};

        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }
        this._nativeBridge.Sdk.logError(JSON.stringify(error));
        Diagnostics.trigger('plc_request_failed', error);
        this.setPlacementStates(PlacementState.NO_FILL);
    }
}
