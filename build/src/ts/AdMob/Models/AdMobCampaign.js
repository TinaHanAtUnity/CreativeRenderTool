import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { Model } from 'Core/Models/Model';
export class AdMobVideo extends Model {
    constructor(data) {
        super('AdMobVideo', {
            mediaFileURL: ['string'],
            video: ['object'],
            extension: ['string', 'null']
        }, data);
    }
    getMediaFileURL() {
        return this.get('mediaFileURL');
    }
    getVideo() {
        return this.get('video');
    }
    getExtension() {
        return this.get('extension');
    }
    getDTO() {
        return {
            mediaFileUrl: this.getMediaFileURL(),
            video: this.getVideo().getDTO()
        };
    }
}
export class AdMobCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('AdMobCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { dynamicMarkup: ['string'], omVendors: ['array'], isOMEnabled: ['boolean', 'undefined'], shouldMuteByDefault: ['boolean', 'undefined'] }), campaign);
    }
    isOMEnabled() {
        return this.get('isOMEnabled');
    }
    getOMVendors() {
        return this.get('omVendors');
    }
    setOmEnabled(isOMEnabled) {
        this.set('isOMEnabled', isOMEnabled);
    }
    setOMVendors(omVendors) {
        this.set('omVendors', omVendors);
    }
    shouldMuteByDefault() {
        return this.get('shouldMuteByDefault');
    }
    getDynamicMarkup() {
        return this.get('dynamicMarkup');
    }
    getRequiredAssets() {
        return [];
    }
    getOptionalAssets() {
        return [];
    }
    isConnectionNeeded() {
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JDYW1wYWlnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZE1vYi9Nb2RlbHMvQWRNb2JDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQXlCLG9CQUFvQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDeEcsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBUTFDLE1BQU0sT0FBTyxVQUFXLFNBQVEsS0FBa0I7SUFDOUMsWUFBWSxJQUFpQjtRQUN6QixLQUFLLENBQUMsWUFBWSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN4QixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDakIsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztTQUNoQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVNLGVBQWU7UUFDbEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILFlBQVksRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3BDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFO1NBQ2xDLENBQUM7SUFDTixDQUFDO0NBQ0o7QUFTRCxNQUFNLE9BQU8sYUFBYyxTQUFRLG9CQUFvQztJQUNuRSxZQUFZLFFBQXdCO1FBQ2hDLEtBQUssQ0FBQyxlQUFlLG9CQUNiLG9CQUFvQixDQUFDLE1BQU0sSUFDL0IsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3pCLFNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUNwQixXQUFXLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLEVBQ3JDLG1CQUFtQixFQUFFLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxLQUM5QyxRQUFRLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRU0sV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRU0sWUFBWSxDQUFDLFdBQW9CO1FBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxZQUFZLENBQUMsU0FBbUI7UUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=