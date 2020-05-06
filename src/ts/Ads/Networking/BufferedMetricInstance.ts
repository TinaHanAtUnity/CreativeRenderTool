import { TimingEvent, PTSEvent } from 'Ads/Utilities/SDKMetrics';
import { IMetricInstance } from 'Ads/Networking/MetricInstance';

interface IBufferedMetric<Metric> {
    event: Metric;
    tags: { [key: string]: string };
    value?: number;
}

interface IBufferedTimeMetric extends IBufferedMetric<TimingEvent> {
    value: number;
}

export class BufferedMetricInstance implements IMetricInstance {
    private _metrics: IBufferedMetric<PTSEvent>[];
    private _timings: IBufferedTimeMetric[];

    constructor() {
        this._metrics = [];
        this._timings = [];
    }

    public forwardTo(metricInstance: IMetricInstance) {
        this._metrics.forEach(x => {
            metricInstance.reportMetricEventWithTags(x.event, x.tags);
        });
        this._timings.forEach(x => {
            metricInstance.reportTimingEventWithTags(x.event, x.value, x.tags);
        });
    }

    public reportMetricEvent(event: PTSEvent) {
        this._metrics.push({
            event: event,
            tags: {}
        });
    }

    public reportMetricEventWithTags(event: PTSEvent, tags: { [key: string]: string }) {
        this._metrics.push({
            event: event,
            tags: tags
        });
    }

    public reportTimingEvent(event: TimingEvent, value: number) {
        this._timings.push({
            event: event,
            value: value,
            tags: {}
        });
    }

    public reportTimingEventWithTags(event: TimingEvent, value: number, tags: { [key: string]: string }) {
        this._timings.push({
            event: event,
            value: value,
            tags: tags
        });
    }

    public sendBatchedEvents(): Promise<void[]> {
        return Promise.resolve<void[]>([]);
    }
}
