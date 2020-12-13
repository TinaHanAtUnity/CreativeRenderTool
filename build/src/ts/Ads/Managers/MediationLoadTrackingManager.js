import { MediationMetric, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
const INITIAL_AD_REQUEST_WAIT_TIME_IN_MS = 250;
export var MediationExperimentType;
(function (MediationExperimentType) {
    MediationExperimentType["LoadV5"] = "lv5";
    MediationExperimentType["None"] = "none";
})(MediationExperimentType || (MediationExperimentType = {}));
export class MediationLoadTrackingManager {
    constructor(loadApi, listener, mediationName, webviewEnabledLoad, experimentType, nativeInitTime, placementCount) {
        this._initialAdRequest = true;
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
    getCurrentExperiment() {
        return this._experimentType;
    }
    setInitComplete() {
        this._initialAdRequest = false;
        this._initCompleteTime = this.getTime();
        SDKMetrics.reportTimingEventWithTags(MediationMetric.InitializationComplete, this._initCompleteTime, this.getBaseTrackingTags());
        this.reportPlacementBucket(MediationMetric.InitCompleteByPlacements, true, this._initCompleteTime);
    }
    reportPlacementCount(placementCount) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.PlacementCount, placementCount, this.getBaseTrackingTags());
    }
    reportMediaCount(mediaCount) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.MediaCount, mediaCount, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
    }
    reportAuctionRequestStarted() {
        SDKMetrics.reportMetricEventWithTags(MediationMetric.AuctionRequestStarted, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
        SDKMetrics.sendBatchedEvents();
    }
    reportAdShown(adCached) {
        SDKMetrics.reportMetricEventWithTags(MediationMetric.AdShow, this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
            'str': `${!adCached}`
        }));
        SDKMetrics.sendBatchedEvents();
    }
    reportAuctionRequest(latency, requestSuccessful, reason) {
        let tags = this.getBaseTrackingTags({
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`,
            'res': `${requestSuccessful}`
        });
        if (reason) {
            tags = Object.assign({}, tags, { 'rsn': reason });
        }
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AuctionRequest, latency, tags);
        SDKMetrics.sendBatchedEvents();
    }
    reportingAdCaching(latency, adCachedSuccessfully) {
        SDKMetrics.reportTimingEventWithTags(MediationMetric.AdCaching, latency, this.getBaseTrackingTags({
            'acs': `${adCachedSuccessfully}`,
            'iar': `${GameSessionCounters.getCurrentCounters().adRequests === 1}`
        }));
    }
    onLoad(placements) {
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
    onPlacementStateChangedEventSent(placementId, newState) {
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
        }
        else if (newState === 'NO_FILL') {
            SDKMetrics.reportTimingEventWithTags(MediationMetric.LoadRequestNofill, timeValue, this.getBaseTrackingTags({
                'iar': `${this._activeLoads[placementId].initialAdRequest}`
            }));
            this.reportPlacementBucket(MediationMetric.NofillLatencyByPlacements, this._activeLoads[placementId].initialAdRequest, timeValue);
            delete this._activeLoads[placementId];
            SDKMetrics.sendBatchedEvents();
        }
    }
    getTime() {
        return performance.now();
    }
    hasPlacementTimedOut(placementId, timeValue) {
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
    tryToSendNativeTimeout(placementId) {
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
    checkForTimedOutPlacements() {
        Object.keys(this._activeLoads).forEach((placementId) => {
            const timeValue = this.getTime() - this._activeLoads[placementId].time;
            this.hasPlacementTimedOut(placementId, timeValue);
        });
    }
    getBaseTrackingTags(additionalTags = {}) {
        return Object.assign({}, additionalTags, { 'med': this._mediationName, 'wel': `${this._webviewEnabledLoad}`, 'exp': this._experimentType });
    }
    reportPlacementBucket(metric, initialAdRequest, latency) {
        SDKMetrics.reportTimingEventWithTags(metric, latency, {
            'iar': `${initialAdRequest}`,
            'plb': this.getPlacementBucket()
        });
    }
    // Limits the placement bucket to a maximum of 10 (100+ placements are in the same bucket)
    getPlacementBucket() {
        const bucket = Math.ceil(this._placementCount / 10);
        return bucket <= 10 ? `${bucket}` : '10';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkaWF0aW9uTG9hZFRyYWNraW5nTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvTWVkaWF0aW9uTG9hZFRyYWNraW5nTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXZFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXhFLE1BQU0sa0NBQWtDLEdBQUcsR0FBRyxDQUFDO0FBRS9DLE1BQU0sQ0FBTixJQUFZLHVCQUdYO0FBSEQsV0FBWSx1QkFBdUI7SUFDL0IseUNBQWMsQ0FBQTtJQUNkLHdDQUFhLENBQUE7QUFDakIsQ0FBQyxFQUhXLHVCQUF1QixLQUF2Qix1QkFBdUIsUUFHbEM7QUFFRCxNQUFNLE9BQU8sNEJBQTRCO0lBYXJDLFlBQVksT0FBZ0IsRUFBRSxRQUFxQixFQUFFLGFBQXFCLEVBQUUsa0JBQTJCLEVBQUUsY0FBdUMsRUFBRSxjQUFrQyxFQUFFLGNBQXNCO1FBUnBNLHNCQUFpQixHQUFZLElBQUksQ0FBQztRQVN0QyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUN4QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsY0FBYyxHQUFHLGFBQWEsQ0FBQztRQUNwQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7UUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFFdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7UUFFdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMs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