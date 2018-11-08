import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IBannerAdUnit } from 'Banners/AdUnits/IBannerAdUnit';
import { DisplayHTMLBannerAdUnit } from 'Banners/AdUnits/DisplayHTMLBannerAdUnit';
import { IBannerAdUnitParameters } from 'Banners/AdUnits/HTMLBannerAdUnit';

export class BannerAdUnitFactory {
    public static createAdUnit(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters): IBannerAdUnit {
        if (parameters.campaign instanceof BannerCampaign) {
            return this.createBannerAdUnit(nativeBridge, parameters);
        } else {
            throw new Error('Unknown campaign instance type');
        }
    }

    private static createBannerAdUnit(nativeBridge: NativeBridge, parameters: IBannerAdUnitParameters): IBannerAdUnit {
        return new DisplayHTMLBannerAdUnit(nativeBridge, parameters);
    }
}
