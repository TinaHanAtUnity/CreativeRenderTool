import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { BannerAdUnit, IBannerAdUnitParameters } from 'Banners/AdUnits/BannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';

export class BannerAdUnitFactory {
    public static createAdUnit(parameters: IAdUnitParameters<Campaign>): BannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(<IAdUnitParameters<BannerCampaign>>parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createBannerAdUnit(parameters: IAdUnitParameters<BannerCampaign>): BannerAdUnit {
        return new BannerAdUnit(<IBannerAdUnitParameters>parameters);
    }
}
