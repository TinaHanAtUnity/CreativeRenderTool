import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';
import { ARMRAIDEventHandler } from 'AR/EventHandlers/ARMRAIDEventHandler';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';

export class MRAIDAdUnitFactory extends AbstractAdUnitFactory<MRAIDCampaign, IMRAIDAdUnitParameters> {
    public createAdUnit(parameters: IMRAIDAdUnitParameters): MRAIDAdUnit {
        const mraidAdUnit: MRAIDAdUnit = new MRAIDAdUnit(parameters);
        // NOTE: When content type is correct for playables we want to change this to content type check.
        const isPlayable: boolean = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isAR: boolean = parameters.mraid instanceof ARMRAID;
        const isSonicPlayable: boolean = CustomFeatures.isSonicPlayable(parameters.campaign.getCreativeId());
        const EventHandler = (isSonicPlayable || isPlayable) ? PerformanceMRAIDEventHandler :
            isAR ? ARMRAIDEventHandler : ProgrammaticMRAIDEventHandler;
        const mraidEventHandler: IMRAIDViewHandler = new EventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);
        AbstractPrivacy.setupReportListener(parameters.privacy, mraidAdUnit);
        return mraidAdUnit;
    }
}
