import { Model } from 'Core/Models/Model';
import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
export class VastCompanionAdStaticResource extends Model {
    constructor(id, height, width, creativeType, staticResourceURL, companionClickThroughURLTemplate, companionClickTrackingURLTemplates, trackingEvents) {
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
    setCompanionClickThroughURLTemplate(url) {
        this.set('companionClickThroughURLTemplate', url);
    }
    setStaticResourceURL(url) {
        this.set('staticResourceURL', url);
    }
    setCreativeType(type) {
        this.set('creativeType', type);
    }
    addCompanionClickTrackingURLTemplate(url) {
        this.getCompanionClickTrackingURLTemplates().push(url);
    }
    addTrackingEvent(eventName, trackingURLTemplate) {
        const trackingEvents = this.get('trackingEvents');
        if (trackingEvents[eventName]) {
            trackingEvents[eventName].push(trackingURLTemplate);
        }
        else {
            trackingEvents[eventName] = [trackingURLTemplate];
        }
    }
    getId() {
        return this.get('id');
    }
    getType() {
        return this.get('type');
    }
    getCreativeType() {
        return this.get('creativeType');
    }
    getStaticResourceURL() {
        return this.get('staticResourceURL');
    }
    getCompanionClickThroughURLTemplate() {
        return this.get('companionClickThroughURLTemplate');
    }
    getCompanionClickTrackingURLTemplates() {
        return this.get('companionClickTrackingURLTemplates');
    }
    getHeight() {
        return this.get('height');
    }
    getWidth() {
        return this.get('width');
    }
    getDTO() {
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
    getTrackingEvents() {
        return this.get('trackingEvents') || {};
    }
    getEventTrackingUrls(eventType) {
        const trackingEvents = this.getTrackingEvents();
        if (trackingEvents) {
            return trackingEvents[eventType] || [];
        }
        return [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9Nb2RlbHMvVmFzdENvbXBhbmlvbkFkU3RhdGljUmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzFDLE9BQU8sRUFBNEIsbUJBQW1CLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQVVyRyxNQUFNLE9BQU8sNkJBQThCLFNBQVEsS0FBcUM7SUFFcEYsWUFBWSxFQUFpQixFQUFFLE1BQWMsRUFBRSxLQUFhLEVBQUUsWUFBNEIsRUFBRSxpQkFBaUMsRUFBRSxnQ0FBZ0QsRUFBRSxrQ0FBNkMsRUFBRSxjQUFrRDtRQUM5USxLQUFLLENBQUMsK0JBQStCLEVBQUU7WUFDbkMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUN0QixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDakIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2xCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNoQixpQkFBaUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDckMsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUNoQyxnQ0FBZ0MsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDcEQsa0NBQWtDLEVBQUUsQ0FBQyxPQUFPLENBQUM7WUFDN0MsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDO1NBQzdCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLEdB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