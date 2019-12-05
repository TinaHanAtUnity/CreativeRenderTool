import { IAdsApi } from 'Ads/IAds';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { RequestManager } from 'Core/Managers/RequestManager';
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

    constructor(platform: Platform, core: ICoreApi, coreConfig: CoreConfiguration, ads: IAdsApi, wakeUpManager: WakeUpManager, campaignManager: CampaignManager, adsConfig: AdsConfiguration, focusManager: FocusManager, sessionManager: SessionManager, clientInfo: ClientInfo, request: RequestManager, cache: CacheManager) {
        super(platform, core, coreConfig, ads, wakeUpManager, campaignManager, adsConfig, focusManager, sessionManager, clientInfo, request, cache);

        this._ads = ads;
        this._adsConfig = adsConfig;

        this._ads.LoadApi.onLoad.subscribe((placements: {[key: string]: number}) => {
            Object.keys(placements).forEach((placementId) => {
                this.sendLoadAPIEvent(placementId);
            });
        });
    }

    public sendPlacementStateChanges(placementId: string): void {
        return;
    }

    public setCurrentAdUnit(adUnit: AbstractAdUnit, placement: Placement): void {
        placement.setCurrentCampaign(undefined);
        this.setPlacementState(placement.getId(), PlacementState.NOT_AVAILABLE);
        this.sendPlacementStateChangesLoadAdapter(placement.getId(), PlacementState.READY, PlacementState.NOT_AVAILABLE);
    }

    public sendPlacementStateChangesLoadAdapter(placementId: string, previousState: PlacementState, nextState: PlacementState): void {
        this._ads.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[previousState], PlacementState[nextState]);
        if (nextState === PlacementState.READY) {
            this._ads.Listener.sendReadyEvent(placementId);
        }
    }

    private sendLoadAPIEvent(placementId: string) {
        const placement = this._adsConfig.getPlacement(placementId);
        const currentState = placement.getState();
        this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.NOT_AVAILABLE, PlacementState.WAITING);
        switch (currentState) {
            case PlacementState.READY:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.READY);
                break;
            case PlacementState.NO_FILL:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NO_FILL);
                break;
            case PlacementState.NOT_AVAILABLE:
                this.sendPlacementStateChangesLoadAdapter(placementId, PlacementState.WAITING, PlacementState.NOT_AVAILABLE);
                break;
            default:
        }
    }
}
