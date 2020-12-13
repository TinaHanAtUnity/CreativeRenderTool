import { Model } from 'Core/Models/Model';
export class VastCreative extends Model {
    constructor(name, schema, type, trackingEvents) {
        super(name, schema);
        this.set('type', type);
        this.set('trackingEvents', trackingEvents || {});
    }
    getType() {
        return this.get('type');
    }
    getTrackingEvents() {
        return this.get('trackingEvents');
    }
    addTrackingEvent(eventName, trackingURLTemplate) {
        if (this.get('trackingEvents')[eventName] == null) {
            this.get('trackingEvents')[eventName] = [];
        }
        this.get('trackingEvents')[eventName].push(trackingURLTemplate);
    }
    getDTO() {
        return {
            'type': this.getType(),
            'trackingEvents': this.getTrackingEvents()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENyZWF0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RDcmVhdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVcsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFRbkQsTUFBTSxPQUFnQixZQUFzRCxTQUFRLEtBQVE7SUFDeEYsWUFBWSxJQUFZLEVBQUUsTUFBa0IsRUFBRSxJQUFZLEVBQUUsY0FBa0Q7UUFDMUcsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVwQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxTQUFpQixFQUFFLG1CQUEyQjtRQUNsRSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLEVBQUU7WUFDL0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUM5QztRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN0QixnQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7U0FDN0MsQ0FBQztJQUNOLENBQUM7Q0FJSiJ9