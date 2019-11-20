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
                this.sendLoadAPIEvent(placementId);
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
        return this._refreshManager.refresh(nofillRetry);
    }

    public initialize(): Promise<INativeResponse | void> {
        return this._refreshManager.initialize();
    }
    public shouldRefill(timestamp: number): boolean {
        return this._refreshManager.shouldRefill(timestamp);
    }

    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        this._refreshManager.subscribeNativePromoEvents(eventHandler);
    }

    public setPlacementState(placementId: string, placementState: PlacementState): void {
       this._refreshManager.setPlacementState(placementId, placementState);
    }

    public sendPlacementStateChanges(placementId: string): void {
       this._refreshManager.sendPlacementStateChanges(placementId);
    }

    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
       this._refreshManager.setPlacementStates(placementState, placementIds);
    }

    private sendLoadAPIEvent(placementId: string) {
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
