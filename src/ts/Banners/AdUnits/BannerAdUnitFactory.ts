import { BannerAdUnit, IBannerAdUnitParameters } from 'Banners/AdUnits/BannerAdUnit';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class BannerAdUnitFactory {
    public static createAdUnit(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters): BannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(nativeBridge, parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createBannerAdUnit(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters): BannerAdUnit {
        return new BannerAdUnit(nativeBridge, parameters);
    }
}
