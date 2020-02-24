import { ListenerApi } from 'Ads/Native/Listener';
import { MediationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { LoadApi } from 'Core/Native/LoadApi';

const INITIAL_AD_REQUEST_WAIT_TIME = 250;

export class MediationLoadTrackingManager {
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _mediationName: string;
    private _webviewEnabledLoad: boolean;
    private _initialAdRequest: boolean = true;
    private _initCompleteTime: number;

    private _activeLoads: { [key: string]: { time: number; initialAdRequest: boolean } };

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
        this._initCompleteTime = this.getTime();
    }

    public reportPlacementCount(placementCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.PlacementCount, placementCount, [
            SDKMetrics.createAdsSdkTag('med', this._mediationName),
            SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`)
        ]);
    }

    public reportMediaCount(mediaCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.MediaCount, mediaCount, [
            SDKMetrics.createAdsSdkTag('med', this._mediationName),
            SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`)
        ]);
    }

    public reportAuctionRequest(latency: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AuctionRequest, latency, [
            SDKMetrics.createAdsSdkTag('med', this._mediationName),
            SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`)
        ]);
    }

    public reportingAdCaching(latency: number, adCachedSuccessfully: boolean) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AdCaching, latency, [
            SDKMetrics.createAdsSdkTag('med', this._mediationName),
            SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
            SDKMetrics.createAdsSdkTag('acs', `${adCachedSuccessfully}`)
        ]);
    }

    private onLoad(placements: { [key: string]: number }): void {
        this.checkForTimedOutPlacements();
        Object.keys(placements).forEach((placementId) => {
            if (this._activeLoads[placementId] === undefined) {
                this._activeLoads[placementId] = {
                    time: this.getTime(),
                    initialAdRequest: this._initialAdRequest || (this.getTime() - this._initCompleteTime <= INITIAL_AD_REQUEST_WAIT_TIME)
                };
                SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequest, [
                    SDKMetrics.createAdsSdkTag('med', this._mediationName),
                    SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                    SDKMetrics.createAdsSdkTag('iar', `${this._activeLoads[placementId].initialAdRequest}`)
                ]);
            }
        });
    }

    private onPlacementStateChangedEventSent(placementId: string, newState: string): void {
        if (this._activeLoads[placementId] === undefined) {
            return;
        }

        const timeValue = this.getTime() - this._activeLoads[placementId].time;
        if (this.hasPlacementTimedOut(placementId, timeValue)) {
            return;
        }

        this.checkForTimedOutPlacements();

        if (newState === 'READY') {
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, [
                SDKMetrics.createAdsSdkTag('med', this._mediationName),
                SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                SDKMetrics.createAdsSdkTag('iar', `${this._activeLoads[placementId].initialAdRequest}`)
            ]);
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        } else if (newState === 'NO_FILL') {
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestNofill, timeValue, [
                SDKMetrics.createAdsSdkTag('med', this._mediationName),
                SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                SDKMetrics.createAdsSdkTag('iar', `${this._activeLoads[placementId].initialAdRequest}`)
            ]);
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        }
    }

    private getTime(): number {
        return performance.now();
    }

    private hasPlacementTimedOut(placementId: string, timeValue: number): boolean {
        if (timeValue >= 30000) {
            SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequestTimeout, [
                SDKMetrics.createAdsSdkTag('med', this._mediationName),
                SDKMetrics.createAdsSdkTag('wel', `${this._webviewEnabledLoad}`),
                SDKMetrics.createAdsSdkTag('iar', `${this._activeLoads[placementId].initialAdRequest}`)
            ]);
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
            return true;
        }
        return false;
    }

    private checkForTimedOutPlacements(): void {
        Object.keys(this._activeLoads).forEach((placementId) => {
            const timeValue = this.getTime() - this._activeLoads[placementId].time;
            this.hasPlacementTimedOut(placementId, timeValue);
        });
    }
}
