import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';

export class BannerAdUnitFactory {

    public static ContentTypeJS = 'programmatic/banner-js';
    public static ContentTypeHTML = 'programmatic/banner-html';

    public canCreateAdUnit(contentType: string): boolean {
        return contentType === BannerAdUnitFactory.ContentTypeJS || contentType === BannerAdUnitFactory.ContentTypeHTML;
    }

    public createAdUnit(parameters: IBannerAdUnitParameters): IBannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private createBannerAdUnit(parameters: IBannerAdUnitParameters): IBannerAdUnit {
        return new DisplayHTMLBannerAdUnit(parameters);
    }
}
