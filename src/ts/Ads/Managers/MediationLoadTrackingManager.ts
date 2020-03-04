import { ListenerApi } from 'Ads/Native/Listener';
import { MediationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { LoadApi } from 'Core/Native/LoadApi';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';

const INITIAL_AD_REQUEST_WAIT_TIME_IN_MS = 250;

export class MediationLoadTrackingManager {
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _mediationName: string;
    private _webviewEnabledLoad: boolean;
    private _initialAdRequest: boolean = true;
    private _initCompleteTime: number;
    private _nativeTimestamp: number;

    private _activeLoads: { [key: string]: { time: number; initialAdRequest: boolean } };

    constructor(loadApi: LoadApi, listener: ListenerApi, mediationName: string, webviewEnabledLoad: boolean, nativeTimestamp: number) {
        this._loadApi = loadApi;
        this._listener = listener;
        this._mediationName = mediationName;
        this._webviewEnabledLoad = webviewEnabledLoad;
        this._nativeTimestamp = nativeTimestamp;

        this._activeLoads = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, nextState));
    }

    public setInitComplete(): void {
        this._initialAdRequest = false;
        this._initCompleteTime = this.getTime();

        SDKMetrics.reportTimingEventWithTags(MediationMetric.InitializationComplete, this._initCompleteTime, {
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`
        });
    }

    public reportPlacementCount(placementCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.PlacementCount, placementCount, {
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`
        });
    }

    public reportMediaCount(mediaCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.MediaCount, mediaCount, {
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`,
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });
    }

    public reportAuctionRequest(latency: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AuctionRequest, latency, {
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`,
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });
    }

    public reportingAdCaching(latency: number, adCachedSuccessfully: boolean) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AdCaching, latency, {
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`,
            'acs': `${adCachedSuccessfully}`,
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        });
    }

    private onLoad(placements: { [key: string]: number }): void {
        this.checkForTimedOutPlacements();
        Object.keys(placements).forEach((placementId) => {
            if (this._activeLoads[placementId] === undefined) {
                this._activeLoads[placementId] = {
                    time: this.getTime(),
                    initialAdRequest: this._initialAdRequest || (this.getTime() - this._initCompleteTime <= INITIAL_AD_REQUEST_WAIT_TIME_IN_MS)
                };
                SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequest, {
                    'med': this._mediationName,
                    'wel': `${this._webviewEnabledLoad}`,
                    'iar': `${this._activeLoads[placementId].initialAdRequest}`
                });
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
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, {
                'med': this._mediationName,
                'wel': `${this._webviewEnabledLoad}`,
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            });
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        } else if (newState === 'NO_FILL') {
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestNofill, timeValue, {
                'med': this._mediationName,
                'wel': `${this._webviewEnabledLoad}`,
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            });
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        }
    }

    private getTime(): number {
        return performance.now();
    }

    private hasPlacementTimedOut(placementId: string, timeValue: number): boolean {
        const timedOut = (this.getTime() - this._nativeTimestamp) >= 30000;
        if (timedOut) {
            SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequestTimeout, {
                'med': this._mediationName,
                'wel': `${this._webviewEnabledLoad}`,
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            });
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
