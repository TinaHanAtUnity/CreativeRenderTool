import { AbstractAdUnitFactory } from '../../Ads/AdUnits/AbstractAdUnitFactory';
import { NativeBridge } from '../../Core/Native/Bridge/NativeBridge';
import { IAdUnitParameters } from '../../Ads/AdUnits/AbstractAdUnit';
import { VPAIDCampaign } from '../Models/VPAIDCampaign';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from './VPAIDAdUnit';
import { VPAIDEndScreen } from '../Views/VPAIDEndScreen';
import { VPAIDOverlayEventHandler } from '../EventHandlers/VPAIDOverlayEventHandler';
import { VPAIDEventHandler } from '../EventHandlers/VPAIDEventHandler';
import { VPAIDEndScreenEventHandler } from '../EventHandlers/VPAIDEndScreenEventHandler';
import { Closer } from '../../Ads/Views/Closer';
import { VPAID } from '../Views/VPAID';
import { Privacy } from '../../Ads/Views/Privacy';

export class VPAIDAdUnitFactory extends AbstractAdUnitFactory {

    public createAdUnit(nativeBridge: NativeBridge, parameters: IAdUnitParameters<VPAIDCampaign>): VPAIDAdUnit {
        // WebPlayerContainer will always be defined, checking and throwing just to remove the undefined type.
        if (!parameters.webPlayerContainer) {
            throw new Error('is undefined, should not get here.');
        }

        const privacy = this.createPrivacy(nativeBridge, parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const closer = new Closer(nativeBridge, parameters.placement, privacy, showGDPRBanner);
        const vpaid = new VPAID(nativeBridge, parameters.webPlayerContainer, parameters.campaign, parameters.placement);
        let endScreen: VPAIDEndScreen | undefined;

        const vpaidAdUnitParameters: IVPAIDAdUnitParameters = {
            ... parameters,
            vpaid: vpaid,
            closer: closer,
            privacy: privacy
        };

        if(parameters.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(nativeBridge, parameters.campaign, parameters.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }

        const vpaidAdUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);

        const vpaidEventHandler = new VPAIDEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
        closer.addEventHandler(overlayEventHandler);

        if(parameters.campaign.hasEndScreen() && endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(nativeBridge, vpaidAdUnit, vpaidAdUnitParameters);
            endScreen.addEventHandler(endScreenEventHandler);
        }
        Privacy.setupReportListener(privacy, vpaidAdUnit);

        return vpaidAdUnit;
    }

}
