import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

export class BannerAdUnitFactory {

    public canCreateAdUnit(contentType: string): boolean {
        return contentType === CampaignContentType.ProgrammaticJSBanner || contentType === CampaignContentType.ProgrammaticHTMLBanner;
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
