import { Model } from 'Models/Model';

interface IVastCreativeCompanionAd {
    id: string | null;
    width: number;
    height: number;
    type: string;
    staticResourceURL: string | null;
    creativeType: string | null;
    companionClickThroughURLTemplate: string | null;
    trackingEvents: { [eventName: string]: string[] };
}

export class VastCreativeCompanionAd extends Model<IVastCreativeCompanionAd> {
    constructor(id: string, creativeType: string, height: number, width: number, staticResourceURL: string, companionClickThroughURLTemplate: string, trackingEvents?: { [eventName: string]: string[] }) {
        super('VastCreativeCompanionAd', {
            id: ['string', 'null'],
            width: ['number'],
            height: ['number'],
            type: ['string'],
            staticResourceURL: ['string', 'null'],
            creativeType: ['string', 'null'],
            companionClickThroughURLTemplate: ['string', 'null'],
            trackingEvents: ['object']
        });

        this.set('id', id || null);
        this.set('width', width || 0);
        this.set('height', height || 0);
        this.set('type', '');
        this.set('creativeType', creativeType || null);
        this.set('staticResourceURL', staticResourceURL || null);
        this.set('companionClickThroughURLTemplate', companionClickThroughURLTemplate || null);
        this.set('trackingEvents', trackingEvents || {});
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getCreativeType(): string | null {
        return this.get('creativeType');
    }

    public getType(): string {
        return this.get('type');
    }

    public getStaticResourceURL(): string | null {
        return this.get('staticResourceURL');
    }

    public getCompanionClickThroughURLTemplate(): string | null {
        return this.get('companionClickThroughURLTemplate');
    }

    public getHeight(): number {
        return this.get('height');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'width': this.getWidth(),
            'height': this.getHeight(),
            'type': this.getType(),
            'staticResourceURL': this.getStaticResourceURL(),
            'creativeType': this.getCreativeType(),
            'companionClickThroughURLTemplate': this.getCompanionClickThroughURLTemplate()
        };
    }

    public getTrackingEvents(): { [eventType: string]: string[] } {
        return this.get('trackingEvents') || {};
    }
// tslint:disable:no-console
    public getEventTrackingUrls(eventType: string): string[] {
        const trackingEvents = this.getTrackingEvents();
        console.log('----- event tracking urls ' + trackingEvents);
        if (trackingEvents) {
            console.log('------ trackingEvents[eventType] ' + eventType + '-----' + trackingEvents[eventType]);
            return trackingEvents[eventType] || [];
        }
        return [];
    }
}
