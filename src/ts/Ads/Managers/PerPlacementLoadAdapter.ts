import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { IAdsApi } from 'Ads/IAds';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';

export class PerPlacementLoadAdapter extends RefreshManager {
    private _ads: IAdsApi;
    private _adsConfig: AdsConfiguration;
    private _refreshManager: RefreshManager;

    constructor(refreshManager: CampaignRefreshManager, ads: IAdsApi, adsConfig: AdsConfiguration) {
        super();
        this._ads = ads;
        this._adsConfig = adsConfig;
        this._refreshManager = refreshManager;

        this._ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
            Object.keys(placements).forEach((placementId) => {
                const count = placements[placementId];
                this.loadPlacement(placementId, count);
            });
        });
    }

    public getCampaign(placementId: string): Campaign | undefined {
        return this._refreshManager.getCampaign(placementId);
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        return this._refreshManager.setCurrentAdUnit(adUnit, placement);
    }

    public refresh(nofillRetry?: boolean): Promise<INativeResponse | void> {
        return this._refreshManager.refresh();
    }

    public initialize(): Promise<INativeResponse | void> {
        return Promise.resolve();
    }
    public shouldRefill(timestamp: number): boolean {
        return this._refreshManager.shouldRefill(timestamp);
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        this._refreshManager.subscribeNativePromoEvents(eventHandler);
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
        const placement = this._adsConfig.getPlacement(placementId);
        placement.setState(placementState);
    }

    public sendPlacementStateChanges(placementId: string): void {
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

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        for (const placementId of placementIds) {
            this.setPlacementState(placementId, placementState);
        }
        for (const placementId of placementIds) {
            this.sendPlacementStateChanges(placementId);
        }
    }

    private loadPlacement(placementId: string, count: number) {
        const placement = this._adsConfig.getPlacement(placementId);
        const currentState = placement.getState();
        this.setPlacementState(placementId, PlacementState.WAITING);
        this.sendPlacementStateChanges(placementId);
        switch (currentState) {
            case PlacementState.READY:
                this.setPlacementState(placementId, PlacementState.READY);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NO_FILL:
                this.setPlacementState(placementId, PlacementState.NO_FILL);
                this.sendPlacementStateChanges(placementId);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.setPlacementState(placementId, PlacementState.NOT_AVAILABLE);
                this.sendPlacementStateChanges(placementId);
                break;
            default:
        }
    }
}
