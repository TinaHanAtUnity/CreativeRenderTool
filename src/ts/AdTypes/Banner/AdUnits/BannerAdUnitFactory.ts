import { NativeBridge } from 'Native/NativeBridge';
import { IAdUnitParameters, AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { BannerAdUnit, IBannerAdUnitParameters } from 'AdTypes/Banner/AdUnits/BannerAdUnit';
import { BannerCampaign } from 'AdTypes/Banner/Models/Campaigns/BannerCampaign';

export class BannerAdUnitFactory {
    public static createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>): AbstractAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(nativeBridge, <IAdUnitParameters<BannerCampaign>>parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createBannerAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<BannerCampaign>): BannerAdUnit {
        const adUnit = new BannerAdUnit(nativeBridge, <IBannerAdUnitParameters>parameters);
        return adUnit;
    }
}
