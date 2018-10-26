import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { Privacy } from 'Ads/Views/Privacy';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';

export class DisplayInterstitialAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<DisplayInterstitialCampaign>): DisplayInterstitialAdUnit {
        const privacy = this.createPrivacy(parameters);

        const view = new DisplayInterstitial(parameters.platform, parameters.core, <AndroidDeviceInfo>parameters.deviceInfo, parameters.placement, parameters.campaign, privacy, this.showGDPRBanner(parameters));
        const displayInterstitialParameters: IDisplayInterstitialAdUnitParameters = {
            ... parameters,
            view: view
        };

        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(displayInterstitialParameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, displayInterstitialParameters);
        view.addEventHandler(displayInterstitialEventHandler);
        Privacy.setupReportListener(privacy, displayInterstitialAdUnit);

        return displayInterstitialAdUnit;
    }

}
