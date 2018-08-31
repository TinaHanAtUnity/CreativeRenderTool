import { Placement, PlacementState } from 'Ads/Models/Placement';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { Configuration } from 'Core/Models/Configuration';

interface IPlacementMap {
    [id: string]: Placement;
}

export class BannerPlacementManager {
    private _nativeBridge: NativeBridge;
    private _placements: IPlacementMap;

    constructor(nativeBridge: NativeBridge, configuration: Configuration) {
        this._nativeBridge = nativeBridge;
        this._placements = this.getPlacements(configuration);
        configuration.removePlacements(Object.keys(this._placements));
    }

    public sendBannersReady() {
        Object.keys(this._placements).forEach((placementId) => {
            this.setPlacementState(placementId, PlacementState.READY);
        });
    }

    public sendBannersWaiting() {
        Object.keys(this._placements).forEach((placementId) => {
            this.setPlacementState(placementId, PlacementState.WAITING);
        });
    }

    public getPlacement(placementId: string): Placement | undefined {
        return this._placements[placementId];
    }

    public setPlacementState(placementId: string, newState: PlacementState) {
        const placement: Placement = this._placements[placementId];
        if (placement) {
            const oldState: PlacementState = placement.getState();

            placement.setState(newState);
            this.sendPlacementStateChange(placementId, oldState, newState);
        }
    }

    private sendPlacementStateChange(placementId: string, oldState: PlacementState, newState: PlacementState) {
        if(oldState !== newState) {
            this._nativeBridge.Placement.setPlacementState(placementId, newState);
            this._nativeBridge.Listener.sendPlacementStateChangedEvent(placementId, PlacementState[oldState], PlacementState[newState]);

            if(newState === PlacementState.READY) {
                this._nativeBridge.Listener.sendReadyEvent(placementId);
                SdkStats.setReadyEventTimestamp(placementId);
                SdkStats.sendReadyEvent(placementId);
            }
        }
    }

    private getPlacements(configuration: Configuration) {
        const placements = configuration.getPlacements();
        const banners: IPlacementMap = {};
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (placement.isBannerPlacement()) {
                banners[placementId] = placement;
            }
        });
        return banners;
    }
}
