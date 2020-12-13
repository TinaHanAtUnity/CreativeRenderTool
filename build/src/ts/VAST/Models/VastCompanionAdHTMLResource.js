import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';
export class VastCompanionAdHTMLResource extends Model {
    constructor(id, height, width, htmlResourceURL) {
        super('VastCompanionAdHTMLResource', {
            id: ['string', 'null'],
            type: ['string'],
            width: ['number'],
            height: ['number'],
            htmlResourceContent: ['string', 'null']
        });
        this.set('id', id || null);
        this.set('type', VastCompanionAdType.HTML);
        this.set('width', width);
        this.set('height', height);
        this.set('htmlResourceContent', htmlResourceURL || null);
    }
    getId() {
        return this.get('id');
    }
    getType() {
        return this.get('type');
    }
    setHtmlResourceContent(htmlContent) {
        this.set('htmlResourceContent', htmlContent);
    }
    getHtmlResourceContent() {
        return this.get('htmlResourceContent');
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
            'htmlResourceContent': this.getHtmlResourceContent()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSFRNTFJlc291cmNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RDb21wYW5pb25BZEhUTUxSZXNvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQTRCLG1CQUFtQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDckcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBTTFDLE1BQU0sT0FBTywyQkFBNEIsU0FBUSxLQUFtQztJQUVoRixZQUFZLEVBQWlCLEVBQUUsTUFBYyxFQUFFLEtBQWEsRUFBRSxlQUF3QjtRQUNsRixLQUFLLENBQUMsNkJBQTZCLEVBQUU7WUFDakMsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUN0QixJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2pCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNsQixtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7U0FDMUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsZUFBZSxJQUFJLElBQUksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTSxLQUFLO1FBQ1IsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTSxPQUFPO1FBQ1YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFTSxzQkFBc0IsQ0FBQyxXQUFtQjtRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFTSxzQkFBc0I7UUFDekIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbEIsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDeEIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDdEIscUJBQXFCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFFO1NBQ3ZELENBQUM7SUFDTixDQUFDO0NBQ0oifQ==