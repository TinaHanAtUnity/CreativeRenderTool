import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { IVPAIDAdUnitParameters } from 'VPAID/AdUnits/VPAIDAdUnit';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Closer } from 'Ads/Views/Closer';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { VPAID } from 'VPAID/Views/VPAID';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class VPAIDAdUnitParametersFactory extends AbstractAdUnitParametersFactory<VPAIDCampaign, IVPAIDAdUnitParameters> {
    private _webPlayerContainer: WebPlayerContainer;

    constructor(core: ICore, ads: IAds) {
        super(core, ads);
        this._webPlayerContainer = ads.InterstitialWebPlayerContainer;
    }

    protected createParameters(baseParams: IAdUnitParameters<VPAIDCampaign>) {
        const showGDPRBanner = this.showGDPRBanner(baseParams);
        const closer = new Closer(baseParams.platform, baseParams.placement, baseParams.privacy, showGDPRBanner);
        const vpaid = new VPAID(baseParams.platform, baseParams.core, this._webPlayerContainer, this._campaign, this._placement);
        let endScreen: VPAIDEndScreen | undefined;

        const vpaidAdUnitParameters: IVPAIDAdUnitParameters = {
            ... baseParams,
            vpaid: vpaid,
            closer: closer,
            webPlayerContainer: this._webPlayerContainer
        };

        if (baseParams.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(baseParams.platform, baseParams.campaign, baseParams.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }
        return vpaidAdUnitParameters;
    }
}
