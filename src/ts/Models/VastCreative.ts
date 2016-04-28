import { VastMediaFile } from 'Models/VastMediaFile';

export abstract class VastCreative {

    private _type: string;
    private _trackingEvents: { [eventName: string]: string[] };

    constructor(type: string);
    constructor(type: string, trackingEvents?: { [eventName: string]: string[] }) {
        this._type = type;
        this._trackingEvents = trackingEvents || {};
    }

    public getType(): string {
        return this._type;
    }

    public getTrackingEvents(): { [eventName: string]: string[] } {
        return this._trackingEvents;
    }

    public addTrackingEvent(eventName: string, trackingURLTemplate: string) {
        if (this._trackingEvents[eventName] == null) {
            this._trackingEvents[eventName] = [];
        }
        this._trackingEvents[eventName].push(trackingURLTemplate);
    }

    public abstract getMediaFiles(): VastMediaFile[];
    public abstract getDuration(): number;

}