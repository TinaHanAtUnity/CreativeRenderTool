import { AbstractAdUnitFactory } from '../../Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from '../../Ads/AdUnits/AbstractAdUnit';
import { DisplayInterstitialCampaign } from '../Models/DisplayInterstitialCampaign';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from './DisplayInterstitialAdUnit';
import { DisplayInterstitial } from '../Views/DisplayInterstitial';
import { AndroidDeviceInfo } from '../../Core/Models/AndroidDeviceInfo';
import { DisplayInterstitialEventHandler } from '../EventHandlers/DisplayInterstitialEventHandler';
import { Privacy } from '../../Ads/Views/Privacy';

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
