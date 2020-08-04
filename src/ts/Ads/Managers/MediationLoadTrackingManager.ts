import { ListenerApi } from 'Ads/Native/Listener';
import { MediationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { LoadApi } from 'Core/Native/LoadApi';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';

const INITIAL_AD_REQUEST_WAIT_TIME_IN_MS = 250;

export enum MediationExperimentType {
    LoadV5 = 'lv5',
    None = 'none'
}

export class MediationLoadTrackingManager {
    private _loadApi: LoadApi;
    private _listener: ListenerApi;
    private _mediationName: string;
    private _webviewEnabledLoad: boolean;
    private _initialAdRequest: boolean = true;
    private _initCompleteTime: number;
    private _nativeInitTime: number | undefined;
    private _experimentType: MediationExperimentType;
    private _placementCount: number;

    private _activeLoads: { [key: string]: { time: number; initialAdRequest: boolean; nativeTimeoutSent: boolean } };

    constructor(loadApi: LoadApi, listener: ListenerApi, mediationName: string, webviewEnabledLoad: boolean, experimentType: MediationExperimentType, nativeInitTime: number | undefined, placementCount: number) {
        this._loadApi = loadApi;
        this._listener = listener;
        this._mediationName = mediationName;
        this._webviewEnabledLoad = webviewEnabledLoad;
        this._nativeInitTime = nativeInitTime;
        this._experimentType = experimentType;
        this._placementCount = placementCount;

        this._activeLoads = {};

        this._loadApi.onLoad.subscribe((placements) => this.onLoad(placements));
        this._listener.onPlacementStateChangedEventSent.subscribe((placementId, oldState, nextState) => this.onPlacementStateChangedEventSent(placementId, nextState));
    }

    public getCurrentExperiment(): MediationExperimentType {
        return this._experimentType;
    }

    public setInitComplete(): void {
        this._initialAdRequest = false;
        this._initCompleteTime = this.getTime();

        SDKMetrics.reportTimingEventWithTags(MediationMetric.InitializationComplete, this._initCompleteTime, this.getBaseTrackingTags());
        this.reportPlacementBucket(MediationMetric.InitCompleteByPlacements, true, this._initCompleteTime);
    }

    public reportPlacementCount(placementCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.PlacementCount, placementCount, this.getBaseTrackingTags());
    }

    public reportMediaCount(mediaCount: number) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.MediaCount, mediaCount, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
    }

    public reportAuctionRequestStarted() {
        SDKMetrics.reportMetricEventWithTags(MediationMetric.AuctionRequestStarted, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
        SDKMetrics.sendBatchedEvents();
    }

    public reportAdShown(adCached: boolean) {
        SDKMetrics.reportMetricEventWithTags(MediationMetric.AdShow, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
            'str': `${!adCached}`
        }));
        SDKMetrics.sendBatchedEvents();
    }

    public reportAuctionRequest(latency: number, requestSuccessful: boolean, reason?: string) {
        let tags: { [key: string]: string } = this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
            'res': `${requestSuccessful}`
        });

        if (reason) {
            tags = {
                ...tags,
                'rsn': reason
            };
        }

        SDKMetrics.reportTimingEventWithTags(MediationMetric.AuctionRequest, latency, tags);
        SDKMetrics.sendBatchedEvents();
    }

    public reportingAdCaching(latency: number, adCachedSuccessfully: boolean) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AdCaching, latency, this.getBaseTrackingTags({
            'acs': `${adCachedSuccessfully}`,
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
    }

    private onLoad(placements: { [key: string]: number }): void {
        this.checkForTimedOutPlacements();
        Object.keys(placements).forEach((placementId) => {
            if (this._activeLoads[placementId] === undefined) {
                this._activeLoads[placementId] = {
                    time: this.getTime(),
                    initialAdRequest: this._initialAdRequest || (this.getTime() - this._initCompleteTime <= INITIAL_AD_REQUEST_WAIT_TIME_IN_MS),
                    nativeTimeoutSent: false
                };
                SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequest, this.getBaseTrackingTags({
                    'iar': `${this._activeLoads[placementId].initialAdRequest}`
                }));

                if (this._nativeInitTime && this._activeLoads[placementId].initialAdRequest) {
                    SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequestNativeMeasured, this.getBaseTrackingTags());
                }
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
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestFill, timeValue, this.getBaseTrackingTags({
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            }));
            this.reportPlacementBucket(MediationMetric.FillLatencyByPlacements, this._activeLoads[placementId].initialAdRequest, timeValue);

            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        } else if (newState === 'NO_FILL') {
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestNofill, timeValue, this.getBaseTrackingTags({
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            }));
            this.reportPlacementBucket(MediationMetric.NofillLatencyByPlacements, this._activeLoads[placementId].initialAdRequest, timeValue);

            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        }
    }

    private getTime(): number {
        return performance.now();
    }

    private hasPlacementTimedOut(placementId: string, timeValue: number): boolean {
        this.tryToSendNativeTimeout(placementId);

        if (timeValue >= 30000) {
            SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequestTimeout, this.getBaseTrackingTags({
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            }));

            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
            return true;
        }
        return false;
    }

    private tryToSendNativeTimeout(placementId: string) {
        if (this._nativeInitTime === undefined) {
            return;
        }

        if (!this._activeLoads[placementId].initialAdRequest) {
            return;
        }

        if (this._activeLoads[placementId].nativeTimeoutSent) {
            return;
        }

        if (this.getTime() + this._nativeInitTime >= 30000) {
            SDKMetrics.reportMetricEventWithTags(MediationMetric.LoadRequestTimeoutNativeMeasured, this.getBaseTrackingTags());
            this._activeLoads[placementId].nativeTimeoutSent = true;
        }
    }

    private checkForTimedOutPlacements(): void {
        Object.keys(this._activeLoads).forEach((placementId) => {
            const timeValue = this.getTime() - this._activeLoads[placementId].time;
            this.hasPlacementTimedOut(placementId, timeValue);
        });
    }

    private getBaseTrackingTags(additionalTags: { [key: string]: string } = {}): { [key: string]: string } {
        return {
            ...additionalTags,
            'med': this._mediationName,
            'wel': `${this._webviewEnabledLoad}`,
            'exp': this._experimentType
        };
    }

    private reportPlacementBucket(metric: MediationMetric, initialAdRequest: boolean, latency: number): void {
        SDKMetrics.reportTimingEventWithTags(metric, latency, {
            'iar': `${initialAdRequest}`,
            'plb': this.getPlacementBucket()
        });
    }

    // Limits the placement bucket to a maximum of 10 (100+ placements are in the same bucket)
    private getPlacementBucket(): string {
        const bucket = Math.ceil(this._placementCount / 10);
        return bucket <= 10 ? `${bucket}` : '10';
    }
}
