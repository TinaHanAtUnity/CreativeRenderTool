import { ListenerApi } from 'Ads/Native/Listener';
import { MediationMetric, ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { LoadApi } from 'Core/Native/LoadApi';

export class MediationLoadTrackingManager {
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _mediationName: string;
    private _webviewEnabledLoad: boolean;
    private _usingPerformanceTime: boolean = false;
    private _initialAdRequest: boolean = true;

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

    public setInitComplete(): void {
        this._initialAdRequest = false;
    }

    private onLoad(placements: { [key: string]: number }): void {
        this.checkForTimedOutPlacements();
        Object.keys(placements).forEach((placementId) => {
            if (this._activeLoads[placementId] === undefined) {
                this._activeLoads[placementId] = this.getTime();
            }
        });
    }

    private onPlacementStateChangedEventSent(placementId: string, newState: string): void {
        if (this._activeLoads[placementId] === undefined) {
            return;
        }

        const timeValue = this.getTime() - this._activeLoads[placementId];

        if (newState === 'READY') {
            ProgrammaticTrackingService.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, [
                ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                ProgrammaticTrackingService.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                ProgrammaticTrackingService.createAdsSdkTag('upt', `${this._usingPerformanceTime}`),
                ProgrammaticTrackingService.createAdsSdkTag('iar', `${this._initialAdRequest}`)
            ]);
            delete this._activeLoads[placementId];
        } else if (newState === 'NO_FILL') {
            ProgrammaticTrackingService.reportTimingEventWithTags(MediationMetric.LoadRequestNofill, timeValue, [
                ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                ProgrammaticTrackingService.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                ProgrammaticTrackingService.createAdsSdkTag('upt', `${this._usingPerformanceTime}`),
                ProgrammaticTrackingService.createAdsSdkTag('iar', `${this._initialAdRequest}`)
            ]);
            delete this._activeLoads[placementId];
        }
    }

    private getTime(): number {
        if (performance && performance.now) {
            this._usingPerformanceTime = true;
            return performance.now();
        } else {
            return Date.now();
        }
    }

    private checkForTimedOutPlacements(): void {
        Object.keys(this._activeLoads).forEach((placementId) => {
            const timeValue = this.getTime() - this._activeLoads[placementId];
            if (timeValue >= 30000) {
                ProgrammaticTrackingService.reportMetricEventWithTags(MediationMetric.LoadRequestTimeout, [
                    ProgrammaticTrackingService.createAdsSdkTag('med', this._mediationName),
                    ProgrammaticTrackingService.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                    ProgrammaticTrackingService.createAdsSdkTag('upt', `${this._usingPerformanceTime}`),
                    ProgrammaticTrackingService.createAdsSdkTag('iar', `${this._initialAdRequest}`)
                ]);
                delete this._activeLoads[placementId];
            }
        });
    }
}
