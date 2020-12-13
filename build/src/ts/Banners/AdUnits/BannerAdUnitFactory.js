import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
export class BannerAdUnitFactory {
    canCreateAdUnit(contentType) {
        return contentType === BannerAdUnitFactory.ContentTypeJS || contentType === BannerAdUnitFactory.ContentTypeHTML;
    }
    createAdUnit(parameters) {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(parameters);
        }
        else {
            throw new Error('Unknown campaign instance type');
        }
    }
    createBannerAdUnit(parameters) {
        return new DisplayHTMLBannerAdUnit(parameters);
    }
}
BannerAdUnitFactory.ContentTypeJS = 'programmatic/banner-js';
BannerAdUnitFactory.ContentTypeHTML = 'programmatic/banner-html';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQWRVbml0RmFjdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9CYW5uZXJzL0FkVW5pdHMvQmFubmVyQWRVbml0RmFjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDL0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFJbEYsTUFBTSxPQUFPLG1CQUFtQjtJQUtyQixlQUFlLENBQUMsV0FBbUI7UUFDdEMsT0FBTyxXQUFXLEtBQUssbUJBQW1CLENBQUMsYUFBYSxJQUFJLFdBQVcsS0FBSyxtQkFBbUIsQ0FBQyxlQUFlLENBQUM7SUFDcEgsQ0FBQztJQUVNLFlBQVksQ0FBQyxVQUFtQztRQUNuRCxJQUFJLFVBQVUsQ0FBQyxRQUFRLFlBQVksY0FBYyxFQUFFO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1NBQzlDO2FBQU07WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7U0FDckQ7SUFDTCxDQUFDO0lBRU8sa0JBQWtCLENBQUMsVUFBbUM7UUFDMUQsT0FBTyxJQUFJLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7O0FBakJhLGlDQUFhLEdBQUcsd0JBQXdCLENBQUM7QUFDekMsbUNBQWUsR0FBRywwQkFBMEIsQ0FBQyJ9