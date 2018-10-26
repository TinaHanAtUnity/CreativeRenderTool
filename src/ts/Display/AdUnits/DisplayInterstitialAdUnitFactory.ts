import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { DisplayInterstitialCampaign } from '../Models/DisplayInterstitialCampaign';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from './DisplayInterstitialAdUnit';
import { DisplayInterstitial } from '../Views/DisplayInterstitial';
import { DisplayInterstitialEventHandler } from '../EventHandlers/DisplayInterstitialEventHandler';
import { Privacy } from 'Ads/Views/Privacy';

export class DisplayInterstitialAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<DisplayInterstitialCampaign>): DisplayInterstitialAdUnit {
        const privacy = this.createPrivacy(nativeBridge, parameters);

        const view = new DisplayInterstitial(nativeBridge, parameters.placement, parameters.campaign, privacy, this.showGDPRBanner(parameters));
        const displayInterstitialParameters: IDisplayInterstitialAdUnitParameters = {
            ... parameters,
            view: view
        };

        const displayInterstitialAdUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialParameters);
        const displayInterstitialEventHandler = new DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialParameters);
        view.addEventHandler(displayInterstitialEventHandler);
        Privacy.setupReportListener(privacy, displayInterstitialAdUnit);

        return displayInterstitialAdUnit;
    }

}
