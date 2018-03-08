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

export class NewRefreshManager extends RefreshManager {
    private _nativeBridge: NativeBridge;
    private _wakeUpManager: WakeUpManager;
    private _campaignManager: CampaignManager;
    private _configuration: Configuration;
    private _focusManager: FocusManager;

    constructor(nativeBridge: NativeBridge, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, configuration: Configuration, focusManager: FocusManager) {
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

    public getCampaign(placementId: string): Campaign | undefined {
        // todo: implement method
        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit): void {
        // todo: implement method
    }

    public setRefreshAllowed(bool: boolean): void {
        // todo: implement method
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        // todo: implement method
        return Promise.resolve();
    }

    public shouldRefill(timestamp: number): boolean {
        // todo: implement method
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
        // todo: implement method
    }

    private onScreenOn() {
        // todo: implement method
    }

    private onActivityResumed(activity: string) {
        // todo: implement method
    }
}
