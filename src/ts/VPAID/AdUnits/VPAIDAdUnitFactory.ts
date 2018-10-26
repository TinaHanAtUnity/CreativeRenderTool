import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { Closer } from 'Ads/Views/Closer';
import { Privacy } from 'Ads/Views/Privacy';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDEndScreenEventHandler } from 'VPAID/EventHandlers/VPAIDEndScreenEventHandler';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDOverlayEventHandler } from 'VPAID/EventHandlers/VPAIDOverlayEventHandler';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';

export class VPAIDAdUnitFactory extends AbstractAdUnitFactory {

    public static ContentType = 'programmatic/vast-vpaid';

    public canCreateAdUnit(contentType: string): boolean {
        return contentType === VPAIDAdUnitFactory.ContentType;
    }

    public createAdUnit(parameters: IAdUnitParameters<VPAIDCampaign>): VPAIDAdUnit {
        // WebPlayerContainer will always be defined, checking and throwing just to remove the undefined type.
        if (!parameters.webPlayerContainer) {
            throw new Error('is undefined, should not get here.');
        }

        const privacy = this.createPrivacy(parameters);
        const showGDPRBanner = this.showGDPRBanner(parameters);
        const closer = new Closer(parameters.platform, parameters.placement, privacy, showGDPRBanner);
        const vpaid = new VPAID(parameters.platform, parameters.core, parameters.webPlayerContainer, parameters.campaign, parameters.placement);
        let endScreen: VPAIDEndScreen | undefined;

        const vpaidAdUnitParameters: IVPAIDAdUnitParameters = {
            ... parameters,
            vpaid: vpaid,
            closer: closer,
            privacy: privacy
        };

        if(parameters.campaign.hasEndScreen()) {
            endScreen = new VPAIDEndScreen(parameters.platform, parameters.campaign, parameters.clientInfo.getGameId());
            vpaidAdUnitParameters.endScreen = endScreen;
        }

        const vpaidAdUnit = new VPAIDAdUnit(vpaidAdUnitParameters);

        const vpaidEventHandler = new VPAIDEventHandler(vpaidAdUnit, vpaidAdUnitParameters);
        vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(vpaidAdUnit, vpaidAdUnitParameters);
        closer.addEventHandler(overlayEventHandler);

        if(parameters.campaign.hasEndScreen() && endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(vpaidAdUnit, vpaidAdUnitParameters);
            endScreen.addEventHandler(endScreenEventHandler);
        }
        Privacy.setupReportListener(privacy, vpaidAdUnit);

        return vpaidAdUnit;
    }

}
