import { VastMediaFile } from 'Models/Vast/VastMediaFile';
import { ISchema, Model } from 'Models/Model';

export interface IVastCreative {
    type: string;
    trackingEvents: { [eventName: string]: string[] };
}

export abstract class VastCreative<T extends IVastCreative = IVastCreative> extends Model<T> {
    constructor(schema: ISchema<T>, type: string, trackingEvents?: { [eventName: string]: string[] }) {
        super(schema);

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

    public getDTO(): { [key: string]: any } {
        return {
            'type': this.getType(),
            'trackingEvents': this.getTrackingEvents()
        };
    }

    public abstract getMediaFiles(): VastMediaFile[];
    public abstract getDuration(): number;
}
