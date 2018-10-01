import { ISchema, Model } from 'Core/Models/Model';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';

export interface IVastCreative {
    type: string;
    trackingEvents: { [eventName: string]: string[] };
}

export abstract class VastCreative<T extends IVastCreative = IVastCreative> extends Model<T> {
    constructor(name: string, schema: ISchema<T>, type: string, trackingEvents?: { [eventName: string]: string[] }) {
        super(name, schema);

        this.set('type', type);
        this.set('trackingEvents', trackingEvents || {});
    }

    public getType(): string {
        return this.get('type');
    }

    public getTrackingEvents(): { [eventName: string]: string[] } {
        return this.get('trackingEvents');
    }

    public addTrackingEvent(eventName: string, trackingURLTemplate: string) {
        if (this.get('trackingEvents')[eventName] == null) {
            this.get('trackingEvents')[eventName] = [];
        }
        this.get('trackingEvents')[eventName].push(trackingURLTemplate);
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'type': this.getType(),
            'trackingEvents': this.getTrackingEvents()
        };
    }

    public abstract getMediaFiles(): VastMediaFile[];
    public abstract getDuration(): number;
}
