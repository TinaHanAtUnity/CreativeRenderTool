import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface ITimeMeasurements {
    start(event: TimingEvent, tags: string[]): void;
    stop(event: TimingEvent): void;
    measure(tag: string): void;
}

class NullTimeMeasurements implements ITimeMeasurements {

    public start(event: TimingEvent, tags: string[] = []): void {
        // noop
    }

    public stop(event: TimingEvent): void {
        // noop
    }

    public measure(tag: string): void {
        // noop
    }
}

class TimeMeasurements implements ITimeMeasurements {
    private _startTimes: { [key: string]: { start: number; event: TimingEvent; tags: string[] } };
    private _startTime: number;
    private _tags: string[];
    private _event: TimingEvent;

    constructor(event: TimingEvent, tags: string[]) {
        this._startTime = performance.now();
        this._startTimes = {};
        this._tags = tags;
        this._event = event;
    }

    public start(event: TimingEvent, tags: string[] = []): void {
        this._startTimes[event] = {
            start: performance.now(),
            event: event,
            tags: tags
        };
    }

    public stop(event: TimingEvent): void {
        if (this._startTimes[event] === undefined) {
            return;
        }

        const info = this._startTimes[event];
        const duration = performance.now() - info.start;
        const allTags = info.tags.concat(this._tags);

        SDKMetrics.reportTimingEventWithTags(info.event, duration, allTags);

        delete this._startTimes[event];
    }

    public measure(tag: string): void {
        const time = performance.now();
        const duration = time - this._startTime;
        const allTags = this._tags.concat([SDKMetrics.createAdsSdkTag('stg', tag)]);

        SDKMetrics.reportTimingEventWithTags(this._event, duration, allTags);

        this._startTime = time;
    }
}

export function createMeasurementsInstances(event: TimingEvent, tags: string[] = []): ITimeMeasurements {
    if (performance && performance.now) {
        return new TimeMeasurements(event, tags);
    }

    return new NullTimeMeasurements();
}
