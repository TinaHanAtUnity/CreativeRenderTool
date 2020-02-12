import { ProgrammaticTrackingError, PTSEvent, TimingMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Platform } from 'Core/Constants/Platform';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

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
        this._countryIso = country;
        this._batchedTimingEvents = [];
        this._batchedMetricEvents = [];
        this._baseUrl = this._clientInfo.getTestMode() ? this._stagingBaseUrl : this.getProductionUrl();
    }

    protected getProductionUrl(): string {
        return 'https://sdk-diagnostics.prd.mz.internal.unity3d.com/';
    }

    private createMetricTags(event: PTSEvent, tags: string[]): string[] {
        const sdkVersion: string = this._clientInfo.getSdkVersionName();
        return [this.createAdsSdkTag('mevt', event),
                this.createAdsSdkTag('sdv', sdkVersion),
                this.createAdsSdkTag('plt', Platform[this._platform])].concat(tags);
    }

    private createTimingTags(): string[] {
        return [
            this.createAdsSdkTag('sdv', this._clientInfo.getSdkVersionName()),
            this.createAdsSdkTag('iso', this._countryIso),
            this.createAdsSdkTag('plt', Platform[this._platform])
        ];
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

    public createAdsSdkTag(suffix: string, tagValue: string): string {
        return `ads_sdk2_${suffix}:${tagValue}`;
    }

    public reportMetricEvent(event: PTSEvent) {
        this.reportMetricEventWithTags(event, []);
    }

    public reportMetricEventWithTags(event: PTSEvent, tags: string[]) {
        this.batchMetricEvent(event, 1, this.createMetricTags(event, tags));
    }

    public reportErrorEvent(event: PTSEvent, adType: string, seatId?: number) {
        this.batchMetricEvent(event, 1, this.createErrorTags(event, adType, seatId));
    }

    public reportTimingEvent(event: TimingMetric, value: number) {
        // Gate Negative Values
        if (value > 0) {
            this.batchTimingEvent(event, value, this.createTimingTags());
        } else {
            this.batchMetricEvent(ProgrammaticTrackingError.TimingValueNegative, 1, this.createMetricTags(event, []));
        }
    }

    private batchTimingEvent(metric: PTSEvent, value: number, tags: string[]): void {
        // Curently ignore additional negative time values
        if (value > 0) {
            this._batchedTimingEvents = this._batchedTimingEvents.concat(this.createData(metric, value, tags).metrics);
        }

        // Failsafe so we aren't storing too many events at once
        if (this._batchedTimingEvents.length >= 10) {
            this.sendBatchedTimingEvents();
        }
    }

    private batchMetricEvent(metric: PTSEvent, value: number, tags:string[] ): void {
        // Curently ignore additional negative time values
        if (value > 0) {
            this._batchedMetricEvents = this._batchedMetricEvents.concat(this.createData(metric, value, tags).metrics);
        }

        // Failsafe so we aren't storing too many events at once
        if (this._batchedMetricEvents.length >= 10) {
            this.sendBatchedMetricEvents();
        }
    }

    public async sendBatchedEvents() {
        this.sendBatchedMetricEvents();
        this.sendBatchedTimingEvents();
    }

    public async sendBatchedMetricEvents(): Promise<void> {
        await this._sendBatchedEvents(this._batchedMetricEvents, this.metricPath).then(() => {
            this._batchedMetricEvents = []; 
            return;
        });
        return Promise.resolve();
    }

    public async sendBatchedTimingEvents(): Promise<void> {
        await this._sendBatchedEvents(this._batchedTimingEvents, this.timingPath).then(() => {
            this._batchedTimingEvents = []; 
            return;
         });
         return Promise.resolve();
    }

    private async _sendBatchedEvents(events:IPTSEvent[], path:string): Promise<void> {
        if (events.length > 0) {
            const data = {
                metrics: events
            };
            await this.postToDatadog(data, path);	
            return;
        }
        return Promise.resolve();
    }
}