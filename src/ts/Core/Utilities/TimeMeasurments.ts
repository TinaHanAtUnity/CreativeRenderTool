import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface ITimeMeasurement {
    start(event: TimingEvent): void;
    stop(event: TimingEvent): void;
    measure(event: TimingEvent): void;
}

class NullTimeMeasurement implements ITimeMeasurement {

    public start(event: TimingEvent, tags: string[] = []): void {
        // noop
    }

    public stop(event: TimingEvent): void {
        // noop
    }

    public measure(event: TimingEvent): void {
        // noop
    }
}

class TimeMeasurement implements ITimeMeasurement {
    private _startTimes: { [key: string]: { start: number; event: TimingEvent; tags: string[] } };
    private _startTime: number;
    private _tags: string[];

    constructor(tags: string[]) {
        this._startTime = performance.now();
        this._startTimes = {};
        this._tags = tags;
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

    public measure(event: TimingEvent, tags: string[] = []): void {
        const duration = performance.now() - this._startTime;
        const allTags = tags.concat(this._tags);

        SDKMetrics.reportTimingEventWithTags(event, duration, allTags);

        this._startTime = performance.now();
    }
}

export function createMeasurementsInstances(tags: string[] = []): ITimeMeasurement {
    if (performance && performance.now) {
        return new TimeMeasurement(tags);
    }

    return new NullTimeMeasurement();
}
