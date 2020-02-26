import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface ITimeMeasurements {
    measure(tag: string): void;
}

class NullTimeMeasurements implements ITimeMeasurements {
    public measure(tag: string): void {
        // noop
    }
}

class TimeMeasurements implements ITimeMeasurements {
    private _startTime: number;
    private _tags: string[];
    private _event: TimingEvent;

    constructor(event: TimingEvent, tags: string[]) {
        this._startTime = performance.now();
        this._tags = tags;
        this._event = event;
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
