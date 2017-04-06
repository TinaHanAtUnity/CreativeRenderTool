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
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _campaign: Campaign;
    private _plcCampaigns: { [id: string]: Campaign } = {};
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;

    constructor (nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;

        if(this._configuration.isPlacementLevelControl()) {
            this._campaignManager.onPlcCampaign.subscribe((placementId, campaign) => this.onPlcCampaign(placementId, campaign));
            this._campaignManager.onPlcNoFill.subscribe(placementId => this.onPlcNoFill(placementId));
            this._campaignManager.onPlcError.subscribe(error => this.onPlcError(error));
        } else {
            this._campaignManager.onPerformanceCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onVastCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onMRAIDCampaign.subscribe(campaign => this.onCampaign(campaign));
            this._campaignManager.onNoFill.subscribe(retryLimit => this.onNoFill());
            this._campaignManager.onError.subscribe(error => this.onCampaignError(error));
        }

        this.setPlacementStates(PlacementState.WAITING);
    }

    public getCampaign(placementId: string): Campaign {
        if(this._configuration.isPlacementLevelControl()) {
            return this._plcCampaigns[placementId];
        } else {
            return this._campaign;
        }
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        if(this._currentAdUnit) {
            this._currentAdUnit.onStart.unsubscribe(() =>  this.clearCampaigns());
            delete this._currentAdUnit;
        }
        this._currentAdUnit = adUnit;
        this._currentAdUnit.onStart.subscribe(() =>  this.clearCampaigns());
    }

    public refresh(): Promise<void> {
        if(this._configuration.isPlacementLevelControl()) {
            let campaignsEmpty = true;
            const placements: { [id: string]: Placement } = this._configuration.getPlacements();
            for(const placementId in placements) {
                if(this._plcCampaigns.hasOwnProperty(placementId)) {
                    campaignsEmpty = false;
                    break;
                }
            }
            if(this._campaignManager.shouldPlcRefill() || campaignsEmpty) {
                this._plcCampaigns = {};
                this.setPlacementStates(PlacementState.WAITING);
                return this._campaignManager.request();
            }
        } else {
            if(!this._campaign) {
                return this._campaignManager.request();
            } else if (this._campaign.isExpired()) {
                this.onCampaignExpired(this._campaign);
            }
        }

        return Promise.resolve();
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._configuration.getPlacement(placementId);
        const oldState = placement.getState();
        this._nativeBridge.Placement.setPlacementState(placementId, placementState);
        if(oldState !== placementState) {
            this._nativeBridge.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[placementState]);
            placement.setState(placementState);
        }
        if(placementState === PlacementState.READY) {
            this._nativeBridge.Listener.sendReadyEvent(placementId);
        }
    }

    public setPlacementStates(placementState: PlacementState): void {
        const placements: { [id: string]: Placement } = this._configuration.getPlacements();
        for(const placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                const placement: Placement = placements[placementId];
                const oldState = placement.getState();
                this._nativeBridge.Placement.setPlacementState(placementId, placementState);
                if(oldState !== placementState) {
                    this._nativeBridge.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[placementState]);
                    placement.setState(placementState);
                }
                if(placementState === PlacementState.READY) {
                    this._nativeBridge.Listener.sendReadyEvent(placementId);
                }
            }
        }
    }

    private clearCampaigns () {
        if(this._configuration.isPlacementLevelControl()) {
            this._plcCampaigns = {};
        } else {
            delete this._campaign;
        }
    }

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
    }

    private onCampaignExpired(campaign: Campaign) {
        this._nativeBridge.Sdk.logInfo('Unity Ads campaign has expired, requesting new ads');
        this.setPlacementStates(PlacementState.NO_FILL);
        this._campaignManager.request();
    }

    private onPlcCampaign(placementId: string, campaign: Campaign) {
        this._plcCampaigns[placementId] = campaign;
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' is ready');
                this.setPlacementState(placementId, PlacementState.READY);
            });
        } else {
            this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' is ready');
            this.setPlacementState(placementId, PlacementState.READY);
        }
    }

    private onPlcNoFill(placementId: string) {
        if(this._plcCampaigns[placementId]) {
            delete this._plcCampaigns[placementId];
        }
        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' has no fill');
                this.setPlacementState(placementId, PlacementState.NO_FILL);
            });
        } else {
            this._nativeBridge.Sdk.logInfo('Unity Ads placement ' + placementId + ' has no fill');
            this.setPlacementState(placementId, PlacementState.NO_FILL);
        }
    }

    private onPlcError(error: WebViewError | Error) {
        this._plcCampaigns = {};
        this.onCampaignError(error);
    }
}
