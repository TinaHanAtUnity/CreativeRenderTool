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

export class CampaignRefreshManager {
    public static NoFillDelay = 3600;

    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _currentAdUnit: AbstractAdUnit;
    private _refillTimestamp: number;
    private _needsRefill = true;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._wakeUpManager = wakeUpManager;
        this._campaignManager = campaignManager;
        this._configuration = configuration;
        this._refillTimestamp = 0;

        this._campaignManager.onCampaign.subscribe((placementId, campaign) => this.onCampaign(placementId, campaign));
        this._campaignManager.onNoFill.subscribe(placementId => this.onNoFill(placementId));
        this._campaignManager.onError.subscribe((error, placementIds) => this.onError(error, placementIds));
        this._campaignManager.onAdPlanReceived.subscribe(refreshDelay => this.onAdPlanReceived(refreshDelay));
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
        if(this._configuration.isAuction()) {
            this.setCampaignForPlacement(placementId, campaign);
            this.handlePlacementState(placementId, PlacementState.READY);
        } else {
            // TODO: remove this whole else -block when we get rid of LegacyCampaignManager
            if(this._configuration.getPlacements()) {
                for(placementId in this._configuration.getPlacements()) {
                    if (this._configuration.getPlacements().hasOwnProperty(placementId)) {
                        this.setCampaignForPlacement(placementId, campaign);
                    }
                }
            }
            if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
                const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                    this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                    this.setPlacementStates(PlacementState.READY, this._configuration.getPlacementIds());
                });
            } else {
                this.setPlacementStates(PlacementState.READY, this._configuration.getPlacementIds());
            }
        }
    }

    private onNoFill(placementId: string) {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show, for placement: ' + placementId);

        if (this._configuration.isAuction()) {
            this.setCampaignForPlacement(placementId, undefined);
            this.handlePlacementState(placementId, PlacementState.NO_FILL);
        } else {
            // TODO: remove this whole else -block when we get rid of LegacyCampaignManager
            this._refillTimestamp = Date.now() + CampaignRefreshManager.NoFillDelay * 1000;
            if(this._configuration.getPlacements()) {
                for(placementId in this._configuration.getPlacements()) {
                    if (this._configuration.getPlacements().hasOwnProperty(placementId)) {
                        this.setCampaignForPlacement(placementId, undefined);
                    }
                }
            }
            if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
                const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                    this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                    this.setPlacementStates(PlacementState.NO_FILL, this._configuration.getPlacementIds());
                });
            } else {
                this.setPlacementStates(PlacementState.NO_FILL, this._configuration.getPlacementIds());
            }
        }
    }

    private onError(error: WebViewError | Error, placementIds: string[]) {
        this.invalidateCampaigns(this._needsRefill, placementIds);

        if(error instanceof Error) {
            error = { 'message': error.message, 'name': error.name, 'stack': error.stack };
        }

        let messageType = 'campaign_request_failed';
        if (this._configuration.isAuction()) {
            messageType = 'plc_request_failed';
        }

        Diagnostics.trigger(messageType, error);
        this._nativeBridge.Sdk.logError(JSON.stringify(error));

        if(this._currentAdUnit && this._currentAdUnit.isShowing()) {
            const onCloseObserver = this._currentAdUnit.onClose.subscribe(() => {
                this._currentAdUnit.onClose.unsubscribe(onCloseObserver);
                this.setPlacementStates(PlacementState.NO_FILL, placementIds);
            });
        } else {
            this.setPlacementStates(PlacementState.NO_FILL, placementIds);
        }
    }

    private onAdPlanReceived(refreshDelay: number) {
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
}
