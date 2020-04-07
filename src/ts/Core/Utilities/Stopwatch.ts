import { TimingEvent, SDKMetrics } from 'Ads/Utilities/SDKMetrics';

export interface IStopwatch {
    start(): void;
    stop(): void;
    reset(): void;
    stopAndSend(event: TimingEvent, tags: { [key: string]: string }): void;
    send(event: TimingEvent, tags: { [key: string]: string }): void;
}

class NullStopwatch implements IStopwatch {
    public start(): void {
        // noop
    }
    public stop(): void {
        // noop
    }
    public stopAndSend(): void {
        // noop
    }
    public reset(): void {
        // noop
    }
    public send(): void {
        // noop
    }
}

class Stopwatch implements IStopwatch {
    private _totalTime: number;
    private _startTime: number;
    private _started: boolean;

    constructor() {
        this.reset();
    }

    public start(): void {
        if (!this._started) {
            this._startTime = performance.now();
            this._started = true;
        }
    }
    public stop(): void {
        if (this._started) {
            this._totalTime += performance.now() - this._startTime;
            this._started = false;
        }
    }
    public stopAndSend(event: TimingEvent, tags: { [key: string]: string }): void {
        this.stop();
        this.send(event, tags);
    }

    public reset(): void {
        this._startTime = 0;
        this._totalTime = 0;
        this._started = false;
    }

    public send(event: TimingEvent, tags: { [key: string]: string }): void {
        if (SDKMetrics.isMetricInstanceInitialized()) {
            SDKMetrics.reportTimingEventWithTags(event, this._totalTime, tags);
        }
    }
}

export function createStopwatch(): IStopwatch {
    if (performance && performance.now) {
        return new Stopwatch();
    }

    return new NullStopwatch();
}
