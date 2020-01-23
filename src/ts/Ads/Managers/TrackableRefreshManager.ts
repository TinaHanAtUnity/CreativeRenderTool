import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { Campaign } from 'Ads/Models/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';
import { Observable2, Observable1 } from 'Core/Utilities/Observable';

export class TrackableRefreshManager implements RefreshManager {
    private _refreshManager: RefreshManager;

    public readonly onAdUnitChanged = new Observable1<string>();

    public setRefreshManager(refreshManager: RefreshManager): void {
        this._refreshManager = refreshManager;
    }

    public getCampaign(placementId: string): Campaign | undefined {
        return this._refreshManager.getCampaign(placementId);
    }
    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        this.onAdUnitChanged.trigger(placement.getId());
        this._refreshManager.setCurrentAdUnit(adUnit, placement);
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
    public setPlacementState(placementId: string, placementState: PlacementState): void {
        this._refreshManager.setPlacementState(placementId, placementState);
    }
    public sendPlacementStateChanges(placementId: string): void {
        this._refreshManager.sendPlacementStateChanges(placementId);
    }
    public setPlacementStates(placementState: PlacementState, placementIds: string[]): void {
        this._refreshManager.setPlacementStates(placementState, placementIds);
    }
    public subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void {
        this._refreshManager.subscribeNativePromoEvents(eventHandler);
    }
}
