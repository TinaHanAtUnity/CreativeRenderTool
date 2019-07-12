import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ProgrammaticTrackingService, LoadMetric } from 'Ads/Utilities/ProgrammaticTrackingService';

export class PerPlacementLoadManager extends RefreshManager {
    private _core: ICoreApi;
    private _ads: IAdsApi;
    private _adsConfig: AdsConfiguration;
    private _campaignManager: CampaignManager;
    private _clientInfo: ClientInfo;
    private _focusManager: FocusManager;
    private _pts: ProgrammaticTrackingService;

    constructor(core: ICoreApi, ads: IAdsApi, adsConfig: AdsConfiguration, campaignManager: CampaignManager, clientInfo: ClientInfo, focusManager: FocusManager, programmaticTrackingService: ProgrammaticTrackingService) {
        super();

        this._core = core;
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._campaignManager = campaignManager;
        this._clientInfo = clientInfo;
        this._focusManager = focusManager;
        this._pts = programmaticTrackingService;

        this._focusManager.onAppForeground.subscribe(() => this.refresh());
        this._focusManager.onActivityResumed.subscribe((activity) => this.refresh());
        this._ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
            Object.keys(placements).forEach((placementId) => {
                const count = placements[placementId];
                this.loadPlacement(placementId, count);
            });
        });
    }

    public getCampaign(placementId: string): Campaign | undefined {
        const placement = this._adsConfig.getPlacement(placementId);
        if(placement) {
            return placement.getCurrentCampaign();
        }

        return undefined;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        placement.setCurrentCampaign(undefined);
        this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        this.invalidateExpiredCampaigns();

        return Promise.resolve(undefined);
    }

    public initialize(): Promise<INativeResponse | void> {
        return Promise.resolve();
    }

    public shouldRefill(timestamp: number): boolean {
        return false;
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);

        this.sendPlacementStateChanges(placementId);
    }

    public sendPlacementStateChanges(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);
        if(placement.getPlacementStateChanged()) {
            placement.setPlacementStateChanged(false);
            this._ads.Placement.setPlacementState(placementId, placement.getState());
            this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[placement.getPreviousState()], PlacementState[placement.getState()]);
        }
        this.alertPlacementReadyStatus(placement);
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        // todo: implement method or remove from parent class
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        // todo: implement method or remove from parent class
    }

    // count is the number of times load was called for a placementId before we could process it
    private loadPlacement(placementId: string, count: number) {
        const placement = this._adsConfig.getPlacement(placementId);
        if (placement && this.shouldLoadCampaignForPlacement(placement)) {
            this.setPlacementState(placementId, PlacementState.WAITING);
            this._campaignManager.loadCampaign(placement, 10000).then(loadedCampaign => {
                if (loadedCampaign) {
                    placement.setCurrentCampaign(loadedCampaign.campaign);
                    placement.setCurrentTrackingUrls(loadedCampaign.trackingUrls);
                    this.setPlacementState(placementId, PlacementState.READY);
                } else {
                    this.setPlacementState(placementId, PlacementState.NO_FILL);
                }
            });
        } else {
            this.alertPlacementReadyStatus(placement);
            this._pts.reportMetric(LoadMetric.LoadAuctionRequestBlocked);
        }
    }

    /**
     *  Returns true if a new campaign should be fetched for the given placement.
     *  A new campaign is only fetched when the campaign is:
     *  - Unfilled (No fill or Not Available)
     *  - Ready and the filled campaign is expired
     */
    private shouldLoadCampaignForPlacement(placement: Placement): boolean {
        const isUnfilledPlacement = (placement.getState() === PlacementState.NO_FILL || placement.getState() === PlacementState.NOT_AVAILABLE);
        if (isUnfilledPlacement) {
            return true;
        }

        const isReadyPlacement = placement.getState() === PlacementState.READY;
        const campaign = placement.getCurrentCampaign();
        const isExpiredCampaign = !!(campaign && campaign.isExpired());
        if (isReadyPlacement && isExpiredCampaign) {
            return true;
        }

        return false;
    }

    private invalidateExpiredCampaigns() {
        for(const placementId of this._adsConfig.getPlacementIds()) {
            const placement = this._adsConfig.getPlacement(placementId);

            if(placement && placement.getState() === PlacementState.READY) {
                const campaign = placement.getCurrentCampaign();

                if(campaign && campaign.isExpired()) {
                    placement.setCurrentCampaign(undefined);
                    this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
                }
            }
        }
    }

    private alertPlacementReadyStatus(placement: Placement) {
        if (placement && placement.getState() === PlacementState.READY) {
            this._ads.Listener.sendReadyEvent(placement.getId());
        }
    }
}
