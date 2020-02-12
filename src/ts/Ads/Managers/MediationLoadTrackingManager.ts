import { ListenerApi } from 'Ads/Native/Listener';
import { MediationMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { LoadApi } from 'Core/Native/LoadApi';

export class MediationLoadTrackingManager {
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _mediationName: string;
    private _webviewEnabledLoad: boolean;

    private _activeLoads: { [key: string]: number };

    constructor(loadApi: LoadApi, listener: ListenerApi, mediationName: string, webviewEnabledLoad: boolean) {
        this._loadApi = loadApi;
        this._listener = listener;
        this._mediationName = mediationName;
        this._webviewEnabledLoad = webviewEnabledLoad;

        this._activeLoads = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, nextState));
    }

    private onLoad(placements: { [key: string]: number }): void {
        Object.keys(placements).forEach((placementId) => {
            if (!this._activeLoads[placementId]) {
                this._activeLoads[placementId] = this.getTime();
            } else {
                // Log duplicate?
            }
        });
    }

    private onPlacementStateChangedEventSent(placementId: string, newState: string): void {
        if (!!this._activeLoads[placementId]) {
            return;
        }

        const timeValue = this.getTime() - this._activeLoads[placementId];

        if (newState === 'READY') {
            ProgrammaticTrackingService.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, [
                ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                ProgrammaticTrackingService.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`)
            ]);
            delete this._activeLoads[placementId];

        } else if (newState === 'NO_FILL') {
            ProgrammaticTrackingService.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, [
                ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                ProgrammaticTrackingService.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`)
            ]);
            delete this._activeLoads[placementId];

        } else {
            // Log separate state?
        }
    }

    private getTime(): number {
        if (performance && performance.now) {
            return performance.now();
        } else {
            return Date.now();
        }
    }
}
