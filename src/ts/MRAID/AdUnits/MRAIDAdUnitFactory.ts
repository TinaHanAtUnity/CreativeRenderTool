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
        const mraidEventHandler: IMRAIDViewHandler = this.getMRAIDEventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);
        AbstractPrivacy.setupReportListener(parameters.privacy, mraidAdUnit);
        return mraidAdUnit;
    }

    private getMRAIDEventHandler(mraidAdUnit: MRAIDAdUnit, parameters: IMRAIDAdUnitParameters): IMRAIDViewHandler {
        if (CustomFeatures.isSonicPlayable(parameters.campaign.getCreativeId()) || parameters.campaign instanceof PerformanceMRAIDCampaign) {
            return new PerformanceMRAIDEventHandler(mraidAdUnit, parameters);
        } else if (parameters.mraid instanceof ARMRAID) {
            return new ARMRAIDEventHandler(mraidAdUnit, parameters);
        } else {
            return new ProgrammaticMRAIDEventHandler(mraidAdUnit, parameters);
        }
    }
}
