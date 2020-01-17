import { IAdsApi } from 'Ads/IAds';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { RequestManager, INativeResponse } from 'Core/Managers/RequestManager';
import { CampaignRefreshManager } from 'Ads/Managers/CampaignRefreshManager';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CampaignManager } from 'Ads/Managers/CampaignManager';

export class PerPlacementLoadAdapter extends CampaignRefreshManager {

    private _trackablePlacements: {[key: string]: string } = {};
    private _activePlacements: {[key: string]: string } = {};
    private _forceLoadPlacements: {[key: string]: string } = {};
    private _initialized: boolean;

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, ads: IAdsApi, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, adsConfig: AdsConfiguration, focusManager: FocusManager, sessionManager: SessionManager, clientInfo: ClientInfo, request: RequestManager, cache: CacheManager) {
        super(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);

        this._ads = ads;
        this._adsConfig = adsConfig;
        this._initialized = false;

        this._ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
            Object.keys(placements).forEach((placementId) => {
                if (this._initialized) {
                    this.sendLoadAPIEvent(placementId);
                } else {
                   this._forceLoadPlacements[placementId] = placementId;
                }
            });
        });
    }

    public initialize(): Promise<INativeResponse | void> {
        this._initialized = true;
        return super.initialize().then((returnValue) => {
            Object.keys(this._forceLoadPlacements).forEach((placementId) => {
                this.sendLoadAPIEvent(placementId);
            });
            return returnValue;
        });
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        super.setCurrentAdUnit(adUnit, placement);

        this.sendPlacementStateChangesLoadAdapter(placement.getId(), PlacementState.READY, PlacementState.NOT_AVAILABLE);
    }

    public sendPlacementStateChanges(placementId: string): void {
        const placement = this._adsConfig.getPlacement(placementId);
        if (this._trackablePlacements[placementId]) {
            if (placement.getPlacementStateChanged()) {
                this.sendPlacementStateChangesLoadAdapter(placementId, placement.getPreviousState(), placement.getState());

                if (placement.getState() !== PlacementState.WAITING) {
                    delete this._trackablePlacements[placementId];
                }
            }
        } else if (this._activePlacements[placementId]) {
            if (placement.getPlacementStateChanged() && placement.getState() === PlacementState.NOT_AVAILABLE) {
                delete this._activePlacements[placementId];
            } else if (placement.getPlacementStateChanged() && placement.getPreviousState() ===  PlacementState.WAITING && placement.getState() === PlacementState.NO_FILL) {
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                delete this._activePlacements[placementId];
            }
        }
        placement.setPlacementStateChanged(false);
    }

    public sendPlacementStateChangesLoadAdapter(placementId: string, previousState: PlacementState, nextState: PlacementState): void {
        this._ads.Placement.setPlacementState(placementId, nextState);
        this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[previousState], PlacementState[nextState]);
        if (nextState === PlacementState.READY) {
            this._activePlacements[placementId] = placementId;
            this._ads.Listener.sendReadyEvent(placementId);
        }
    }

    private sendLoadAPIEvent(placementId: string) {
        const placement = this._adsConfig.getPlacement(placementId);

        if (placement.getState() === PlacementState.WAITING) {
            this._trackablePlacements[placementId] = placementId;
         }
        this.sendPlacementStateChange(placementId, placement.getState());
    }

    private sendPlacementStateChange(placementId: string, placementState: PlacementState) {
        switch (placementState) {
            case PlacementState.WAITING:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                break;
            case PlacementState.READY:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.READY);
                break;
            case PlacementState.NO_FILL:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NOT_AVAILABLE);
                break;
            default:
        }
    }
}
