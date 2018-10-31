import { BannerAdUnit, IBannerAdUnitParameters } from 'Banners/AdUnits/BannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';

export class BannerAdUnitFactory {

    public static ContentTypeJS = 'programmatic/banner-js';
    public static ContentTypeHTML = 'programmatic/banner-html';

    public canCreateAdUnit(contentType: string): boolean {
        return contentType === BannerAdUnitFactory.ContentTypeJS || contentType === BannerAdUnitFactory.ContentTypeHTML;
    }

    public createAdUnit(parameters: IBannerAdUnitParameters): BannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private createBannerAdUnit(parameters: IBannerAdUnitParameters): BannerAdUnit {
        return new BannerAdUnit(parameters);
    }
}
