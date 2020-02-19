import { ProgrammaticTrackingError, PTSEvent, TimingEvent } from 'Ads/Utilities/SDKMetrics';
import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Promises } from 'Core/Utilities/Promises';

interface IPTSEvent {
    name: string;
    value: number;
    tags: string[];
}

export interface IProgrammaticTrackingData {
    metrics: IPTSEvent[];
}

export class MetricInstance {

    private _platform: Platform;
    private _requestManager: RequestManager;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _countryIso: string;
    private _batchedTimingEvents: IPTSEvent[];
    private _batchedMetricEvents: IPTSEvent[];
    private _baseUrl: string;

    private _stagingBaseUrl = 'https://sdk-diagnostics.stg.mz.internal.unity3d.com/';

    private metricPath = 'v1/metrics';
    private timingPath = 'v1/timing';

    constructor(platform: Platform, requestManager: RequestManager, clientInfo: ClientInfo, deviceInfo: DeviceInfo, country: string) {
        this._platform = platform;
        this._requestManager = requestManager;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._countryIso = this.getCountryIso(country);
        this._batchedTimingEvents = [];
        this._batchedMetricEvents = [];
        this._baseUrl = this._clientInfo.getTestMode() ? this._stagingBaseUrl : this.getProductionUrl();
    }

    protected getProductionUrl(): string {
        return 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/';
    }

    private createTags(tags: string[]): string[] {
        return [
            this.createAdsSdkTag('sdv', this._clientInfo.getSdkVersionName()),
            this.createAdsSdkTag('iso', this._countryIso),
            this.createAdsSdkTag('plt', Platform[this._platform])].concat(tags);
    }

    private createErrorTags(event: PTSEvent, adType?: string, seatId?: number): string[] {

        const platform: Platform = this._platform;
        const osVersion: string = this._deviceInfo.getOsVersion();
        const sdkVersion: string = this._clientInfo.getSdkVersionName();

        return [
            this.createAdsSdkTag('eevt', event),
            this.createAdsSdkTag('plt', Platform[platform]),
            this.createAdsSdkTag('osv', osVersion),
            this.createAdsSdkTag('sdv', sdkVersion),
            this.createAdsSdkTag('adt', `${adType}`),
            this.createAdsSdkTag('sid', `${seatId}`)
        ];
    }

    private createData(event: PTSEvent, value: number, tags: string[]): IProgrammaticTrackingData {
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

    private postToDatadog(metricData: IProgrammaticTrackingData, path: string): Promise<INativeResponse> {
        const url: string = this._baseUrl + path;
        const data: string = JSON.stringify(metricData);
        const headers: [string, string][] = [];
        headers.push(['Content-Type', 'application/json']);
        return this._requestManager.post(url, data, headers);
    }

    private getCountryIso(country: string): string {
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

    public createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    public reportMetricEvent(event: PTSEvent) {
        this.reportMetricEventWithTags(event, []);
    }

    public reportMetricEventWithTags(event: PTSEvent, tags: string[]) {
        this.batchMetricEvent(event, 1, this.createTags(tags));
    }

    public reportErrorEvent(event: PTSEvent, adType: string, seatId?: number) {
        this.batchMetricEvent(event, 1, this.createErrorTags(event, adType, seatId));
    }

    public reportTimingEvent(event: TimingEvent, value: number) {
        // Gate Negative Values
        if (value > 0) {
            this.batchTimingEvent(event, value, this.createTags([]));
        } else {
            this.batchMetricEvent(ProgrammaticTrackingError.TimingValueNegative, 1, this.createTags([
                this.createAdsSdkTag('mevt', event)
            ]));
        }
    }

    public reportTimingEventWithTags(event: TimingEvent, value: number, tags: string[]) {
        if (value > 0) {
            this.batchTimingEvent(event, value, this.createTags(tags));
        } else {
            this.batchMetricEvent(ProgrammaticTrackingError.TimingValueNegative, 1, this.createTags([
                this.createAdsSdkTag('mevt', event)
            ]));
        }
    }

    public sendBatchedEvents(): Promise<void[]> {
        const promises = [
            this.sendBatchedMetricEvents(),
            this.sendBatchedTimingEvents()
        ];
        return Promise.all(promises);
    }

    private sendBatchedMetricEvents(): Promise<void> {
        return this.constructAndSendEvents(this._batchedMetricEvents, this.metricPath).then(() => {
            this._batchedMetricEvents = [];
        });
    }

    private sendBatchedTimingEvents(): Promise<void> {
        return this.constructAndSendEvents(this._batchedTimingEvents, this.timingPath).then(() => {
            this._batchedTimingEvents = [];
         });
    }

    private batchTimingEvent(metric: PTSEvent, value: number, tags: string[]): void {
        this._batchedTimingEvents = this._batchedTimingEvents.concat(this.createData(metric, value, tags).metrics);

        // Failsafe so we aren't storing too many events at once
        if (this._batchedTimingEvents.length >= 30) {
            this.sendBatchedTimingEvents();
        }
    }

    private batchMetricEvent(metric: PTSEvent, value: number, tags: string[]): void {
        this._batchedMetricEvents = this._batchedMetricEvents.concat(this.createData(metric, value, tags).metrics);

        // Failsafe so we aren't storing too many events at once
        if (this._batchedMetricEvents.length >= 30) {
            this.sendBatchedMetricEvents();
        }
    }

    private constructAndSendEvents(events: IPTSEvent[], path: string): Promise<void> {
        if (events.length > 0) {
            const data = {
                metrics: events
            };
            return Promises.voidResult(this.postToDatadog(data, path));
        }
        return Promise.resolve();
    }
}
