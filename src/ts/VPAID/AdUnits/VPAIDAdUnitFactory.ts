import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { VPAIDOverlayEventHandler } from 'VPAID/EventHandlers/VPAIDOverlayEventHandler';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDEndScreenEventHandler } from 'VPAID/EventHandlers/VPAIDEndScreenEventHandler';
import { Closer } from 'Ads/Views/Closer';
import { VPAID } from 'VPAID/Views/VPAID';
import { Privacy } from 'Ads/Views/Privacy';

export class VPAIDAdUnitFactory extends AbstractAdUnitFactory<VPAIDCampaign, IVPAIDAdUnitParameters> {

    public createAdUnit(parameters: IVPAIDAdUnitParameters): VPAIDAdUnit {
        const vpaidAdUnit = new VPAIDAdUnit(parameters);

        const vpaidEventHandler = new VPAIDEventHandler(vpaidAdUnit, {
            ads: parameters.ads,
            core: parameters.core,
            closer: parameters.closer,
            endScreen: parameters.endScreen,
            operativeEventManager: parameters.operativeEventManager,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            placement: parameters.placement,
            campaign: parameters.campaign
        });
        parameters.vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(vpaidAdUnit, parameters);
        parameters.closer.addEventHandler(overlayEventHandler);

        if(parameters.campaign.hasEndScreen() && parameters.endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(vpaidAdUnit, parameters);
            parameters.endScreen.addEventHandler(endScreenEventHandler);
        }
        Privacy.setupReportListener(parameters.privacy, vpaidAdUnit);

        return vpaidAdUnit;
    }

}
