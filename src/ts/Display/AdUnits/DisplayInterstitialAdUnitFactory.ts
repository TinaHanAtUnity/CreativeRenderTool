import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';

export class DisplayInterstitialAdUnitFactory extends AbstractAdUnitFactory<DisplayInterstitialCampaign, IDisplayInterstitialAdUnitParameters> {

    public createAdUnit(parameters: IDisplayInterstitialAdUnitParameters): DisplayInterstitialAdUnit {
        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(parameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, parameters);
        parameters.view.addEventHandler(displayInterstitialEventHandler);
        AbstractPrivacy.setupReportListener(parameters.privacy, displayInterstitialAdUnit);
        return displayInterstitialAdUnit;
    }

}
