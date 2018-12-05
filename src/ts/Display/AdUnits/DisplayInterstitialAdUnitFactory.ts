import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';

export class DisplayInterstitialAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(parameters: IAdUnitParameters<DisplayInterstitialCampaign>): DisplayInterstitialAdUnit {
        const privacy = this.createPrivacy(parameters);

        const view = new DisplayInterstitial(parameters.platform, parameters.core, parameters.deviceInfo, parameters.placement, parameters.campaign, privacy, this.showGDPRBanner(parameters));
        const displayInterstitialParameters: IDisplayInterstitialAdUnitParameters = {
            ... parameters,
            view: view
        };

        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(displayInterstitialParameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, displayInterstitialParameters);
        view.addEventHandler(displayInterstitialEventHandler);
        AbstractPrivacy.setupReportListener(privacy, displayInterstitialAdUnit);

        return displayInterstitialAdUnit;
    }

}
