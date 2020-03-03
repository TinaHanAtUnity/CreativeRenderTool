import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface ITimeMeasurements {
    measure(tag: string): void;
}

class NullTimeMeasurements implements ITimeMeasurements {
    public measure(tag: string): void {
        // noop
    }
}

interface IStoredTimeMeasurement {
    duration: number;
    allTags: { [key: string]: string };
}

class TimeMeasurements implements ITimeMeasurements {
    private _startTime: number;
    private _tags: { [key: string]: string };
    private _event: TimingEvent;
    private _storedTimes: IStoredTimeMeasurement[];

    constructor(event: TimingEvent, tags: { [key: string]: string }) {
        this._startTime = performance.now();
        this._tags = tags;
        this._event = event;
        this._storedTimes = [];
    }

    public measure(tag: string): void {
        const time = performance.now();
        const duration = time - this._startTime;
        const allTags = {
            ...this._tags,
            'stg': tag };

        if (SDKMetrics.isMetricInstanceInitialized()) {
            SDKMetrics.reportTimingEventWithTags(this._event, duration, allTags);

            if (this._storedTimes.length > 0) {
                this._storedTimes.forEach(storedTime => {
                    SDKMetrics.reportTimingEventWithTags(this._event, storedTime.duration, storedTime.allTags);
                });
                this._storedTimes = [];
            }

        } else {
            this._storedTimes.push({
                duration,
                allTags
            });
        }

        this._startTime = time;
    }
}

export function createMeasurementsInstance(event: TimingEvent, tags: { [key: string]: string } = {}): ITimeMeasurements {
    if (performance && performance.now) {
        return new TimeMeasurements(event, tags);
    }

    return new NullTimeMeasurements();
}
