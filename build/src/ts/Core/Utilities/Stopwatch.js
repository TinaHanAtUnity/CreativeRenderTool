import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
class NullStopwatch {
    start() {
        // noop
    }
    stop() {
        // noop
    }
    stopAndSend() {
        // noop
    }
    reset() {
        // noop
    }
    send() {
        // noop
    }
}
class Stopwatch {
    constructor() {
        this.reset();
    }
    start() {
        if (!this._started) {
            this._startTime = performance.now();
            this._started = true;
        }
    }
    stop() {
        if (this._started) {
            this._totalTime += performance.now() - this._startTime;
            this._started = false;
        }
    }
    stopAndSend(event, tags) {
        this.stop();
        this.send(event, tags);
    }
    reset() {
        this._startTime = 0;
        this._totalTime = 0;
        this._started = false;
    }
    send(event, tags) {
        SDKMetrics.reportTimingEventWithTags(event, this._totalTime, tags);
    }
}
export function createStopwatch() {
    if (performance && performance.now) {
        return new Stopwatch();
    }
    return new NullStopwatch();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcHdhdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1N0b3B3YXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWUsVUFBVSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFVbkUsTUFBTSxhQUFhO0lBQ1IsS0FBSztRQUNSLE9BQU87SUFDWCxDQUFDO0lBQ00sSUFBSTtRQUNQLE9BQU87SUFDWCxDQUFDO0lBQ00sV0FBVztRQUNkLE9BQU87SUFDWCxDQUFDO0lBQ00sS0FBSztRQUNSLE9BQU87SUFDWCxDQUFDO0lBQ00sSUFBSTtRQUNQLE9BQU87SUFDWCxDQUFDO0NBQ0o7QUFFRCxNQUFNLFNBQVM7SUFLWDtRQUNJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRU0sS0FBSztRQUNSLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO0lBQ0wsQ0FBQztJQUNNLElBQUk7UUFDUCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQztJQUNNLFdBQVcsQ0FBQyxLQUFrQixFQUFFLElBQStCO1FBQ2xFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFTSxLQUFLO1FBQ1IsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVNLElBQUksQ0FBQyxLQUFrQixFQUFFLElBQStCO1FBQzNELFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN2RSxDQUFDO0NBQ0o7QUFFRCxNQUFNLFVBQVUsZUFBZTtJQUMzQixJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztLQUMxQjtJQUVELE9BQU8sSUFBSSxhQUFhLEVBQUUsQ0FBQztBQUMvQixDQUFDIn0=