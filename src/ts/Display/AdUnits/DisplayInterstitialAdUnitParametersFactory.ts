import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { IDisplayInterstitialAdUnitParameters } from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class DisplayInterstitialAdUnitParametersFactory extends AbstractAdUnitParametersFactory<DisplayInterstitialCampaign, IDisplayInterstitialAdUnitParameters> {
    private _webPlayerContainer: WebPlayerContainer;

    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }

    protected createParameters(baseParams: IAdUnitParameters<DisplayInterstitialCampaign>) {
        const privacy = this.createPrivacy(baseParams);

        const view = new DisplayInterstitial(baseParams.platform, baseParams.core, baseParams.deviceInfo, baseParams.placement, baseParams.campaign, privacy, this.showGDPRBanner(baseParams));
        return  {
            ... baseParams,
            webPlayerContainer: this._webPlayerContainer,
            view,
            privacy
        };
    }
}
