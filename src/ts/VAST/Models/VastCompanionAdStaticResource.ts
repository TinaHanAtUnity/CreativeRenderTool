import { Model } from 'Core/Models/Model';
import { IVastCreativeCompanionAd, VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';

interface IVastCompanionAdStaticResource extends IVastCreativeCompanionAd {
    staticResourceURL: string | null;
    creativeType: string | null;
    companionClickThroughURLTemplate: string | null;
    companionClickTrackingURLTemplates: string[];
    trackingEvents: { [eventName: string]: string[] };
}

export class VastCompanionAdStaticResource extends Model<IVastCompanionAdStaticResource> {

    constructor(id: string | null, height: number, width: number, creativeType?: string | null, staticResourceURL?: string | null, companionClickThroughURLTemplate?: string | null, companionClickTrackingURLTemplates?: string[], trackingEvents?: { [eventName: string]: string[] }) {
        super('VastCompanionAdStaticResource', {
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
        this.set('type', VastCompanionAdType.STATIC);
        this.set('creativeType', creativeType || null);
        this.set('staticResourceURL', staticResourceURL || null);
        this.set('companionClickThroughURLTemplate', companionClickThroughURLTemplate || null);
        this.set('companionClickTrackingURLTemplates', companionClickTrackingURLTemplates || []);
        this.set('trackingEvents', trackingEvents || {});
    }

    public setCompanionClickThroughURLTemplate(url: string | null) {
        this.set('companionClickThroughURLTemplate', url);
    }

    public setStaticResourceURL(url: string) {
        this.set('staticResourceURL', url);
    }

    public setCreativeType(type: string | null) {
        this.set('creativeType', type);
    }

    public addCompanionClickTrackingURLTemplate(url: string) {
        this.getCompanionClickTrackingURLTemplates().push(url);
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

    public getType(): VastCompanionAdType {
        return this.get('type');
    }

    public getCreativeType(): string | null {
        return this.get('creativeType');
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
