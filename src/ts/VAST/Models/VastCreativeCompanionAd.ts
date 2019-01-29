import { Model } from 'Core/Models/Model';

interface IVastCreativeCompanionAd {
    id: string | null;
    width: number;
    height: number;
    type: string;
    staticResourceURL: string | null;
    creativeType: string | null;
    companionClickThroughURLTemplate: string | null;
    companionClickTrackingURLTemplates: string[];
    trackingEvents: { [eventName: string]: string[] };
}

export class VastCreativeCompanionAd extends Model<IVastCreativeCompanionAd> {

    constructor(id: string | null, height: number | null, width: number | null, creativeType?: string | null, staticResourceURL?: string | null, companionClickThroughURLTemplate?: string | null, companionClickTrackingURLTemplates?: string[], trackingEvents?: { [eventName: string]: string[] }) {
        super('VastCreativeCompanionAd', {
            id: ['string', 'null'],
            width: ['number'],
            height: ['number'],
            type: ['string'],
            staticResourceURL: ['string', 'null'],
            creativeType: ['string', 'null'],
            companionClickThroughURLTemplate: ['string', 'null'],
            companionClickTrackingURLTemplates: ['array'],
            trackingEvents: ['object']
        });

        this.set('id', id || null);
        this.set('width', width || 0);
        this.set('height', height || 0);
        this.set('type', '');
        this.set('creativeType', creativeType || null);
        this.set('staticResourceURL', staticResourceURL || null);
        this.set('companionClickThroughURLTemplate', companionClickThroughURLTemplate || null);
        this.set('companionClickTrackingURLTemplates', companionClickTrackingURLTemplates || []);
        this.set('trackingEvents', trackingEvents || {});
    }

    public setCompanionClickThroughURLTemplate(url: string | null) {
        this.set('companionClickThroughURLTemplate', url);
    }

    public setCompanionClickTrackingURLTemplates(urls: string[]) {
        this.set('companionClickTrackingURLTemplates', urls);
    }

    public setStaticResourceURL(url: string | null) {
        this.set('staticResourceURL', url);
    }

    public setCreativeType(type: string | null) {
        this.set('creativeType', type);
    }

    public addTrackingEvent(eventName: string, trackingURLTemplate: string) {
        const trackingEvents = this.get('trackingEvents');
        if (trackingEvents[eventName]) {
            trackingEvents[eventName].push(trackingURLTemplate);
        } else {
            trackingEvents[eventName] = [trackingURLTemplate];
        }
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

    public getCompanionClickTrackingURLTemplates(): string[] {
        return this.get('companionClickTrackingURLTemplates');
    }

    public getHeight(): number {
        return this.get('height');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'id': this.getId(),
            'width': this.getWidth(),
            'height': this.getHeight(),
            'type': this.getType(),
            'staticResourceURL': this.getStaticResourceURL(),
            'creativeType': this.getCreativeType(),
            'companionClickThroughURLTemplate': this.getCompanionClickThroughURLTemplate(),
            'companionClickTrackingURLTemplates': this.getCompanionClickTrackingURLTemplates()
        };
    }

    public getTrackingEvents(): { [eventType: string]: string[] } {
        return this.get('trackingEvents') || {};
    }

    public getEventTrackingUrls(eventType: string): string[] {
        const trackingEvents = this.getTrackingEvents();
        if (trackingEvents) {
            return trackingEvents[eventType] || [];
        }
        return [];
    }

}
