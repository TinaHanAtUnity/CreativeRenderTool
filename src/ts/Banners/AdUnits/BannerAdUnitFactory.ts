import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { BannerAdUnit, IBannerAdUnitParameters } from 'Banners/AdUnits/BannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { NativeBridge } from 'Common/Native/NativeBridge';

export class BannerAdUnitFactory {
    public static createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): BannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(nativeBridge, <IAdUnitParameters<BannerCampaign>>parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createBannerAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<BannerCampaign>): BannerAdUnit {
        return new BannerAdUnit(nativeBridge, <IBannerAdUnitParameters>parameters);
    }
}
