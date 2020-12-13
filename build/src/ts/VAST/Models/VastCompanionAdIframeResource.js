import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';
export class VastCompanionAdIframeResource extends Model {
    constructor(id, height, width, iframeResourceURL) {
        super('VastCompanionAdIframeResource', {
            id: ['string', 'null'],
            type: ['string'],
            width: ['number'],
            height: ['number'],
            iframeResourceURL: ['string', 'null']
        });
        this.set('id', id || null);
        this.set('type', VastCompanionAdType.IFRAME);
        this.set('width', width);
        this.set('height', height);
        this.set('iframeResourceURL', iframeResourceURL || null);
    }
    getId() {
        return this.get('id');
    }
    getType() {
        return this.get('type');
    }
    setIframeResourceURL(url) {
        this.set('iframeResourceURL', url);
    }
    getIframeResourceURL() {
        return this.get('iframeResourceURL');
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
            'iframeResourceURL': this.getIframeResourceURL()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSWZyYW1lUmVzb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9Nb2RlbHMvVmFzdENvbXBhbmlvbkFkSWZyYW1lUmVzb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUE0QixtQkFBbUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JHLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU0xQyxNQUFNLE9BQU8sNkJBQThCLFNBQVEsS0FBcUM7SUFFcEYsWUFBWSxFQUFpQixFQUFFLE1BQWMsRUFBRSxLQUFhLEVBQUUsaUJBQTBCO1FBQ3BGLEtBQUssQ0FBQywrQkFBK0IsRUFBRTtZQUNuQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQ3RCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNoQixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDakIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2xCLGlCQUFpQixFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztTQUN4QyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksSUFBSSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxpQkFBaUIsSUFBSSxJQUFJLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBRU0sS0FBSztRQUNSLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRU0sb0JBQW9CLENBQUMsR0FBVztRQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxvQkFBb0I7UUFDdkIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdEIsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixFQUFFO1NBQ25ELENBQUM7SUFDTixDQUFDO0NBQ0oifQ==