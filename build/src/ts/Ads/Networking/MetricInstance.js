import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Platform } from 'Core/Constants/Platform';
import { Promises } from 'Core/Utilities/Promises';
export class NullMetricInstance {
    reportMetricEvent(event) {
        // noop
    }
    reportMetricEventWithTags(event, tags) {
        // noop
    }
    reportTimingEvent(event, value) {
        // noop
    }
    reportTimingEventWithTags(event, value, tags) {
        // noop
    }
    sendBatchedEvents() {
        return Promise.resolve([]);
    }
}
export class MetricInstance {
    constructor(platform, requestManager, clientInfo, deviceInfo, country) {
        this._stagingBaseUrl = 'https://sdk-diagnostics.stg.mz.internal.unity3d.com';
        this.metricPath = '/v1/metrics';
        this.timingPath = '/v1/timing';
        this._platform = platform;
        this._requestManager = requestManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._countryIso = this.getCountryIso(country);
        this._batchedTimingEvents = [];
        this._batchedMetricEvents = [];
        if (MetricInstance._overrideBaseUrl !== undefined) {
            this._baseUrl = MetricInstance._overrideBaseUrl;
        }
        else {
            this._baseUrl = this._clientInfo.getTestMode() ? this._stagingBaseUrl : this.getProductionUrl();
        }
    }
    static setBaseUrl(url) {
        MetricInstance._overrideBaseUrl = url;
    }
    getProductionUrl() {
        return 'https://sdk-diagnostics.prd.mz.internal.unity3d.com';
    }
    createTags(tags) {
        const adsSdkTags = [];
        Object.entries(tags).forEach(([key, value]) => {
            adsSdkTags.push(this.createAdsSdkTag(key, value));
        });
        return [
            this.createAdsSdkTag('sdv', this._clientInfo.getSdkVersionName()),
            this.createAdsSdkTag('iso', this._countryIso),
            this.createAdsSdkTag('plt', Platform[this._platform])
        ].concat(adsSdkTags);
    }
    createData(event, value, tags) {
        return {
            metrics: [
                {
                    name: event,
                    value: value,
                    tags: tags
                }
            ]
        };
    }
    postToDatadog(metricData, path) {
        const url = this._baseUrl + path;
        const data = JSON.stringify(metricData);
        const headers = [];
        headers.push(['Content-Type', 'application/json']);
        return this._requestManager.post(url, data, headers, {
            retries: 2,
            retryDelay: 0,
            retryWithConnectionEvents: false,
            followRedirects: false
        });
    }
    getCountryIso(country) {
        const lowercaseCountry = country.toLowerCase();
        switch (lowercaseCountry) {
            case 'us':
            case 'cn':
            case 'jp':
            case 'gb':
            case 'ru':
            case 'de':
            case 'kr':
            case 'fr':
            case 'ca':
            case 'au':
                return lowercaseCountry;
            default:
                return 'row';
        }
    }
    createAdsSdkTag(suffix, tagValue) {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }
    reportMetricEvent(event) {
        this.reportMetricEventWithTags(event, {});
    }
    reportMetricEventWithTags(event, tags) {
        this.batchMetricEvent(event, 1, this.createTags(tags));
    }
    reportTimingEvent(event, value) {
        if (value > 0) {
            this.batchTimingEvent(event, value, this.createTags({}));
        }
    }
    reportTimingEventWithTags(event, value, tags) {
        if (value > 0) {
            this.batchTimingEvent(event, value, this.createTags(tags));
        }
    }
    sendBatchedEvents() {
        const promises = [
            this.sendBatchedMetricEvents(),
            this.sendBatchedTimingEvents()
        ];
        return Promise.all(promises);
    }
    sendBatchedMetricEvents() {
        const tempBatchedMetricEvents = this._batchedMetricEvents;
        this._batchedMetricEvents = [];
        return this.constructAndSendEvents(tempBatchedMetricEvents, this.metricPath);
    }
    sendBatchedTimingEvents() {
        const tempBatchedTimingEvents = this._batchedTimingEvents;
        this._batchedTimingEvents = [];
        return this.constructAndSendEvents(tempBatchedTimingEvents, this.timingPath);
    }
    batchTimingEvent(metric, value, tags) {
        this._batchedTimingEvents = this._batchedTimingEvents.concat(this.createData(metric, value, tags).metrics);
        // Failsafe so we aren't storing too many events at once
        if (this._batchedTimingEvents.length >= 30) {
            this.sendBatchedTimingEvents();
        }
    }
    batchMetricEvent(metric, value, tags) {
        this._batchedMetricEvents = this._batchedMetricEvents.concat(this.createData(metric, value, tags).metrics);
        // Failsafe so we aren't storing too many events at once
        if (this._batchedMetricEvents.length >= 30) {
            this.sendBatchedMetricEvents();
        }
    }
    constructAndSendEvents(events, path) {
        if (events.length > 0) {
            const data = {
                metrics: events
            };
            return Promises.voidResult(this.postToDatadog(data, path));
        }
        return Promise.resolve();
    }
}
export class ChinaMetricInstance extends MetricInstance {
    getProductionUrl() {
        return 'https://sdk-diagnostics.prd.mz.internal.unity.cn';
    }
}
export function createMetricInstance(platform, requestManager, clientInfo, deviceInfo, country) {
    if (CustomFeatures.sampleAtGivenPercent(50)) {
        if (deviceInfo.isChineseNetworkOperator()) {
            return new ChinaMetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
        }
        else {
            return new MetricInstance(platform, requestManager, clientInfo, deviceInfo, country);
        }
    }
    else {
        return new NullMetricInstance();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0cmljSW5zdGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05ldHdvcmtpbmcvTWV0cmljSW5zdGFuY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFvQm5ELE1BQU0sT0FBTyxrQkFBa0I7SUFFcEIsaUJBQWlCLENBQUMsS0FBZTtRQUNwQyxPQUFPO0lBQ1gsQ0FBQztJQUVNLHlCQUF5QixDQUFDLEtBQWUsRUFBRSxJQUErQjtRQUM3RSxPQUFPO0lBQ1gsQ0FBQztJQUVNLGlCQUFpQixDQUFDLEtBQWtCLEVBQUUsS0FBYTtRQUN0RCxPQUFPO0lBQ1gsQ0FBQztJQUVNLHlCQUF5QixDQUFDLEtBQWtCLEVBQUUsS0FBYSxFQUFFLElBQStCO1FBQy9GLE9BQU87SUFDWCxDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0o7QUFFRCxNQUFNLE9BQU8sY0FBYztJQXNCdkIsWUFBWSxRQUFrQixFQUFFLGNBQThCLEVBQUUsVUFBc0IsRUFBRSxVQUFzQixFQUFFLE9BQWU7UUFYdkgsb0JBQWUsR0FBRyxxREFBcUQsQ0FBQztRQUV4RSxlQUFVLEdBQUcsYUFBYSxDQUFDO1FBQzNCLGVBQVUsR0FBRyxZQUFZLENBQUM7UUFTOUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFD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