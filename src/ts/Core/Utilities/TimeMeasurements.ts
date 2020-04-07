import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface ITimeMeasurements {
    measure(tag: string): void;
    overrideTag(tag: string, value: string): void;
}

class NullTimeMeasurements implements ITimeMeasurements {
    public measure(tag: string): void {
        // noop
    }
    public overrideTag(tag: string, value: string): void {
        // noop
    }
}

class TimeMeasurements implements ITimeMeasurements {
    private _startTime: number;
    private _tags: { [key: string]: string };
    private _event: TimingEvent;

    constructor(event: TimingEvent, tags: { [key: string]: string }) {
        this._startTime = performance.now();
        this._tags = tags;
        this._event = event;
    }

    public overrideTag(tag: string, value: string): void {
        this._tags[tag] = value;
    }

    public measure(tag: string): void {
        const time = performance.now();
        const duration = time - this._startTime;
        const allTags = {
            ...this._tags,
            'stg': tag };

        SDKMetrics.reportTimingEventWithTags(this._event, duration, allTags);

        this._startTime = time;
    }
}

export function createMeasurementsInstance(event: TimingEvent, tags: { [key: string]: string } = {}): ITimeMeasurements {
    if (performance && performance.now) {
        return new TimeMeasurements(event, tags);
    }

    return new NullTimeMeasurements();
}
